#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Maximum retry attempts
MAX_RETRIES=3

# Retry function with exponential backoff
retry_command() {
    local cmd=$1
    local attempt=1
    local max_attempts=$2
    local delay=2
    local directory=${3:-"."}
    
    while [ $attempt -le $max_attempts ]; do
        cd "$directory" 2>/dev/null
        print_step "Attempt $attempt/$max_attempts: $cmd"
        eval "$cmd"
        if [ $? -eq 0 ]; then
            print_success "Command succeeded!"
            return 0
        fi
        
        print_warning "Attempt $attempt failed. Trying to fix..."
        
        # Generic error recovery steps
        case "$cmd" in
            *"yarn install"*)
                print_step "Fixing yarn installation..."
                rm -rf node_modules
                rm -rf yarn.lock
                yarn cache clean
                if [ ! -f ".yarnrc.yml" ]; then
                    bash ../setup-yarn.sh
                fi
                ;;
            *"yarn test"*)
                print_step "Fixing test environment..."
                yarn cache clean
                rm -rf node_modules/.cache
                yarn install --force
                ;;
            *"yarn build"*)
                print_step "Fixing build issues..."
                rm -rf build dist
                rm -rf node_modules/.cache
                yarn install --force
                ;;
            *"yarn lint"*)
                print_step "Fixing lint issues..."
                yarn eslint --fix .
                yarn prettier --write .
                ;;
        esac
        
        attempt=$((attempt + 1))
        sleep $delay
        delay=$((delay * 2))
    done
    
    return 1
}

# Enhanced error handler
handle_error() {
    local error_code=$1
    local command=$2
    local directory=$3
    
    print_warning "Error detected (code: $error_code) while running: $command"
    print_step "Attempting to fix..."
    
    # Common fixes
    yarn cache clean
    rm -rf node_modules/.cache
    
    # Check for common issues
    if ! command -v yarn &> /dev/null; then
        print_warning "Yarn not found. Reinstalling..."
        npm install -g yarn
        bash setup-yarn.sh
    fi
    
    if [ ! -f "package.json" ]; then
        print_warning "package.json missing. Recreating..."
        cp package.json.backup package.json 2>/dev/null || 
        yarn init -y
    fi
    
    # Check for corrupt node_modules
    if [ -d "node_modules" ]; then
        if ! yarn check --verify-tree 2>/dev/null; then
            print_warning "Corrupt node_modules detected. Reinstalling..."
            rm -rf node_modules
            yarn install --force
        fi
    fi
    
    # Check Git state
    if [ -d ".git" ]; then
        if ! git status &>/dev/null; then
            print_warning "Git repository issues detected. Fixing..."
            git fsck --full
            git gc --aggressive
        fi
    fi
    
    return 0
}

# Spinner animation
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Print step with color
print_step() {
    printf "${BLUE}==> ${NC}$1\n"
}

# Print success message
print_success() {
    printf "${GREEN}✓ ${NC}$1\n"
}

# Print error message
print_error() {
    printf "${RED}✗ ${NC}$1\n"
}

# Print warning message
print_warning() {
    printf "${YELLOW}! ${NC}$1\n"
}

# Check if command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

# Check version meets minimum requirement
check_version() {
    local current=$1
    local required=$2
    if [ "$(printf '%s\n' "$required" "$current" | sort -V | head -n1)" != "$required" ]; then
        return 1
    fi
    return 0
}

# Enhanced check_system_requirements function
check_system_requirements() {
    print_step "Checking system requirements..."
    
    # Read requirements from JSON
    local node_req=$(cat project-requirements.json | jq -r '.systemRequirements.node' | sed 's/>=//g')
    local yarn_req="3.6.0"
    local git_req=$(cat project-requirements.json | jq -r '.systemRequirements.git' | sed 's/>=//g')

    # Attempt to fix Node.js version if needed
    if ! check_command "node"; then
        print_warning "Node.js not found. Attempting to install via nvm..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm install 16
        nvm use 16
    fi

    # Check Node.js
    check_command "node"
    local node_version=$(node -v | sed 's/v//g')
    if ! check_version "$node_version" "$node_req"; then
        print_error "Node.js version $node_req or higher is required (current: $node_version)"
        exit 1
    fi

    # Attempt to fix Yarn if needed
    if [ ! -f ".yarn/releases/yarn-${yarn_req}.cjs" ]; then
        print_warning "Yarn Berry not found. Setting up..."
        bash setup-yarn.sh || {
            print_warning "Setup failed. Trying alternative approach..."
            npm install -g yarn
            yarn set version berry
            yarn set version 3.6.0
        }
    fi
    
    if ! yarn -v &> /dev/null; then
        print_error "Yarn installation failed"
        exit 1
    fi

    # Check Git
    check_command "git"
    local git_version=$(git --version | sed 's/git version //g')
    if ! check_version "$git_version" "$git_req"; then
        print_error "Git version $git_req or higher is required (current: $git_version)"
        exit 1
    fi

    # Check jq for JSON parsing
    check_command "jq"

    print_success "All system requirements met"
}

# Clean installation
clean_install() {
    print_step "Cleaning previous installation..."
    rm -rf client/node_modules
    rm -rf server/node_modules
    rm -rf client/build
    rm -rf client/.cache
    rm -rf server/.cache
    print_success "Clean completed"
}

# Enhanced install_dependencies function
install_dependencies() {
    print_step "Installing dependencies..."
    
    # Backup package.json files
    cp client/package.json client/package.json.backup 2>/dev/null
    cp server/package.json server/package.json.backup 2>/dev/null
    
    # Client dependencies
    if ! retry_command "yarn install" $MAX_RETRIES "client"; then
        handle_error $? "yarn install" "client"
        retry_command "yarn install" 1 "client" || exit 1
    fi
    
    # Server dependencies
    if ! retry_command "yarn install" $MAX_RETRIES "server"; then
        handle_error $? "yarn install" "server"
        retry_command "yarn install" 1 "server" || exit 1
    fi
}

# Update package.json scripts
update_package_scripts() {
    print_step "Updating package scripts..."
    
    cd client
    local client_scripts=$(cat ../project-requirements.json | jq '.scripts.client')
    jq --argjson scripts "$client_scripts" '.scripts = $scripts' package.json > package.json.tmp && mv package.json.tmp package.json
    cd ../server
    local server_scripts=$(cat ../project-requirements.json | jq '.scripts.server')
    jq --argjson scripts "$server_scripts" '.scripts = $scripts' package.json > package.json.tmp && mv package.json.tmp package.json
    cd ..
    
    print_success "Package scripts updated"
}

# Run linting
run_lint() {
    print_step "Running linter..."
    cd client
    yarn lint
    cd ../server
    yarn lint
    cd ..
    print_success "Linting completed"
}

# Run tests
run_tests() {
    print_step "Running tests..."
    cd client
    yarn test --watchAll=false
    cd ../server
    yarn test
    cd ..
    print_success "Tests completed"
}

# Clear cache
clear_cache() {
    print_step "Clearing cache..."
    rm -rf client/.cache
    rm -rf server/.cache
    rm -rf client/node_modules/.cache
    rm -rf server/node_modules/.cache
    print_success "Cache cleared"
}

# Main execution
main() {
    # Parse command line arguments
    parse_args "$@"
    
    print_step "Starting LocalCodeRabbit setup..."
    
    check_system_requirements
    clean_install
    install_dependencies
    update_package_scripts
    create_missing_files
    clear_cache
    optimize_db
    run_lint
    run_tests
    run_security_audit
    
    print_step "Setup completed successfully!"
    print_step "Starting application..."
    start_app
}

# Execute main function with all arguments
main "$@"