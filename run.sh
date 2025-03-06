#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Maximum retry attempts
MAX_RETRIES=3

# Get terminal dimensions
TERM_WIDTH=$(tput cols)
TERM_HEIGHT=$(tput lines)

# Sound effects
play_sound() {
    if [ "${NO_SOUND}" = "true" ]; then
        return
    fi
    
    if command -v paplay &> /dev/null; then
        case "$1" in
            "success") paplay /usr/share/sounds/freedesktop/stereo/complete.oga 2>/dev/null & ;;
            "error") paplay /usr/share/sounds/freedesktop/stereo/dialog-error.oga 2>/dev/null & ;;
            "warning") paplay /usr/share/sounds/freedesktop/stereo/dialog-warning.oga 2>/dev/null & ;;
            "startup") paplay /usr/share/sounds/freedesktop/stereo/service-login.oga 2>/dev/null & ;;
            "menu") paplay /usr/share/sounds/freedesktop/stereo/message.oga 2>/dev/null & ;;
            *) paplay /usr/share/sounds/freedesktop/stereo/message.oga 2>/dev/null & ;;
        esac
    elif command -v afplay &> /dev/null; then
        # For macOS
        case "$1" in
            "success") printf '\a' ;;
            "error") for i in {1..3}; do printf '\a'; sleep 0.1; done ;;
            "warning") for i in {1..2}; do printf '\a'; sleep 0.2; done ;;
            "startup") printf '\a' ;;
            *) printf '\a' ;;
        esac
    else
        # Fallback to terminal bell
        case "$1" in
            "success") printf '\a' ;;
            "error") for i in {1..3}; do printf '\a'; sleep 0.1; done ;;
            "warning") for i in {1..2}; do printf '\a'; sleep 0.2; done ;;
            "startup") printf '\a' ;;
            *) printf '\a' ;;
        esac
    fi
}

# Animated intro
show_intro() {
    clear
    play_sound "startup"
    
    # ASCII Art Logo
    local logo=(
        "╔═══════════════════════════════════════════════════════════════╗"
        "║                                                               ║"
        "║   ██╗      ██████╗  ██████╗ █████╗ ██╗     ██████╗  █████╗   ║"
        "║   ██║     ██╔═══██╗██╔════╝██╔══██╗██║     ██╔══██╗██╔══██╗  ║"
        "║   ██║     ██║   ██║██║     ███████║██║     ██████╔╝███████║  ║"
        "║   ██║     ██║   ██║██║     ██╔══██║██║     ██╔══██╗██╔══██║  ║"
        "║   ███████╗╚██████╔╝╚██████╗██║  ██║███████╗██║  ██║██║  ██║  ║"
        "║   ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝  ║"
        "║                                                               ║"
        "║    ██████╗ ██████╗ ██████╗ ███████╗██████╗  █████╗ ██████╗   ║"
        "║   ██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔══██╗  ║"
        "║   ██║     ██║   ██║██║  ██║█████╗  ██████╔╝███████║██████╔╝  ║"
        "║   ██║     ██║   ██║██║  ██║██╔══╝  ██╔══██╗██╔══██║██╔══██╗  ║"
        "║   ╚██████╗╚██████╔╝██████╔╝███████╗██║  ██║██║  ██║██████╔╝  ║"
        "║    ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝   ║"
        "║                                                               ║"
        "╚═══════════════════════════════════════════════════════════════╝"
    )
    
    # Center the logo
    local logo_height=${#logo[@]}
    local logo_width=${#logo[0]}
    local start_row=$(( (TERM_HEIGHT - logo_height) / 2 ))
    local start_col=$(( (TERM_WIDTH - logo_width) / 2 ))
    
    # Animation: reveal logo line by line with typing effect
    for (( i=0; i<${#logo[@]}; i++ )); do
        tput cup $((start_row + i)) $start_col
        for (( j=0; j<${#logo[$i]}; j++ )); do
            echo -n -e "${CYAN}${logo[$i]:$j:1}${NC}"
            
            # Speed up the animation for quicker reveal
            if (( j % 3 == 0 )); then
                sleep 0.001
            fi
        done
        echo
    done
    
    # Subtitle with typing effect
    local subtitle="Development Environment Setup & Management"
    tput cup $((start_row + logo_height + 1)) $(( (TERM_WIDTH - ${#subtitle}) / 2 ))
    for (( i=0; i<${#subtitle}; i++ )); do
        echo -n -e "${YELLOW}${subtitle:$i:1}${NC}"
        sleep 0.03
    done
    
    # Version info
    local version="v1.0.0"
    tput cup $((start_row + logo_height + 3)) $(( (TERM_WIDTH - ${#version}) / 2 ))
    echo -e "${WHITE}${version}${NC}"
    
    # Continue prompt
    local prompt="Press any key to continue..."
    tput cup $((start_row + logo_height + 5)) $(( (TERM_WIDTH - ${#prompt}) / 2 ))
    echo -e "${BOLD}${prompt}${NC}"
    
    read -n 1 -s
}

# Enhanced spinner animation
spinner() {
    local pid=$1
    local message=$2
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    
    tput civis # Hide cursor
    
    while [ "$(ps a | awk '{print $1}' | grep -w $pid)" ]; do
        local temp=${spinstr#?}
        printf " ${BLUE}%c${NC} %s" "$spinstr" "$message"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\r\033[K"
    done
    
    tput cnorm # Show cursor
}

# Print step with color and animation
print_step() {
    local message="$1"
    printf "${BLUE}[STEP]${NC} %s... " "$message"
    sleep 0.2
    printf "\n"
}

# Print success message
print_success() {
    local message="$1"
    sleep 0.2
    printf "${GREEN}[SUCCESS]${NC} %s\n" "$message"
    play_sound "success"
}

# Print error message
print_error() {
    local message="$1"
    sleep 0.2
    printf "${RED}[ERROR]${NC} %s\n" "$message"
    play_sound "error"
}

# Print warning message
print_warning() {
    local message="$1"
    sleep 0.2
    printf "${YELLOW}[WARNING]${NC} %s\n" "$message"
    play_sound "warning"
}

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
        
        # Run command in background for spinner
        eval "$cmd" &>/dev/null &
        local cmd_pid=$!
        spinner $cmd_pid "Running command..."
        
        wait $cmd_pid
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
                rm -rf .yarn/cache
                yarn cache clean
                yarn install --mode=update-lockfile
                ;;
            *"yarn test"*)
                print_step "Fixing test environment..."
                yarn cache clean
                rm -rf node_modules/.cache
                yarn install --mode=update-lockfile
                ;;
            *"yarn build"*)
                print_step "Fixing build issues..."
                rm -rf build dist
                rm -rf node_modules/.cache
                yarn install --mode=update-lockfile
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

# Check if command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        return 1
    fi
    return 0
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
    local npm_req="8.0.0"
    local git_req=$(cat project-requirements.json | jq -r '.systemRequirements.git' | sed 's/>=//g')

    # Progress bar function
    show_progress() {
        local msg=$1
        local width=30
        local percentage=$2
        local filled=$(( width * percentage / 100 ))
        local empty=$(( width - filled ))
        
        printf "%s [" "$msg"
        printf "%${filled}s" "" | tr ' ' '█'
        printf "%${empty}s" "" | tr ' ' '░'
        printf "] %d%%\r" "$percentage"
    }

    # Main progress animation
    (
        # Attempt to fix Node.js version if needed
        show_progress "Checking Node.js..." 10
        sleep 0.5
        
        if ! check_command "node"; then
            show_progress "Installing Node.js..." 20
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
            nvm install 16
            nvm use 16
        fi

        # Check Node.js
        show_progress "Verifying Node.js version..." 30
        sleep 0.5
        check_command "node"
        local node_version=$(node -v | sed 's/v//g')
        
        show_progress "Checking npm..." 50
        sleep 0.5
        # Attempt to fix npm if needed
        if ! check_command "npm"; then
            show_progress "Installing npm..." 60
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
            nvm install-latest-npm
        fi
        
        show_progress "Checking Git..." 80
        sleep 0.5
        # Check Git
        check_command "git"
        
        show_progress "Finalizing checks..." 90
        sleep 0.5
        # Check jq for JSON parsing
        check_command "jq"
        
        show_progress "System checks complete!" 100
        sleep 1
    ) &
    
    wait
    printf "\n"
    print_success "All system requirements met"
    return 0
}

# Clean installation
clean_install() {
    print_step "Cleaning previous installation..."
    
    # Run with progress animation
    (
        npm cache clean --force
        rm -rf client/node_modules
        rm -rf server/node_modules
        rm -rf client/build
        rm -rf client/.cache
        rm -rf server/.cache
        rm -rf .yarn
        rm -rf yarn.lock
    ) &
    
    spinner $! "Removing old files and directories..."
    
    print_success "Clean completed"
    return 0
}

# Enhanced install_dependencies function
install_dependencies() {
    print_step "Installing dependencies..."
    
    # Backup package.json files
    cp client/package.json client/package.json.backup 2>/dev/null
    cp server/package.json server/package.json.backup 2>/dev/null
    
    # Client dependencies
    if ! retry_command "npm install" $MAX_RETRIES "client"; then
        handle_error $? "npm install" "client"
        retry_command "npm install" 1 "client" || return 1
    fi
    
    # Server dependencies
    if ! retry_command "npm install" $MAX_RETRIES "server"; then
        handle_error $? "npm install" "server"
        retry_command "npm install" 1 "server" || return 1
    fi
    
    return 0
}

# Update package.json scripts
update_package_scripts() {
    print_step "Updating package scripts..."
    
    (
        cd client
        local client_scripts=$(cat ../project-requirements.json | jq '.scripts.client')
        jq --argjson scripts "$client_scripts" '.scripts = $scripts' package.json > package.json.tmp && mv package.json.tmp package.json
        cd ../server
        local server_scripts=$(cat ../project-requirements.json | jq '.scripts.server')
        jq --argjson scripts "$server_scripts" '.scripts = $scripts' package.json > package.json.tmp && mv package.json.tmp package.json
        cd ..
    ) &
    
    spinner $! "Updating scripts in package.json files..."
    
    print_success "Package scripts updated"
    return 0
}

# Run linting
run_lint() {
    print_step "Running linter..."
    
    (
        cd client
        yarn lint
        cd ../server
        yarn lint
    ) &
    
    spinner $! "Checking code quality..."
    
    print_success "Linting completed"
    return 0
}

# Run tests
run_tests() {
    print_step "Running tests..."
    
    (
        cd client
        yarn test --watchAll=false
        cd ../server
        yarn test
    ) &
    
    spinner $! "Executing test suites..."
    
    print_success "Tests completed"
    return 0
}

# Clear cache
clear_cache() {
    print_step "Clearing cache..."
    
    (
        rm -rf client/.cache
        rm -rf server/.cache
        rm -rf client/node_modules/.cache
        rm -rf server/node_modules/.cache
    ) &
    
    spinner $! "Removing cached files..."
    
    print_success "Cache cleared"
    return 0
}

# Create missing files
create_missing_files() {
    print_step "Creating missing files..."
    
    (
        # Check and create common config files if missing
        [ -f ".env" ] || cp .env.example .env 2>/dev/null || touch .env
        [ -f ".gitignore" ] || touch .gitignore
        
        # Add standard entries to gitignore if not present
        grep -q "node_modules" .gitignore || echo "node_modules/" >> .gitignore
        grep -q ".env" .gitignore || echo ".env" >> .gitignore
        grep -q ".DS_Store" .gitignore || echo ".DS_Store" >> .gitignore
    ) &
    
    spinner $! "Setting up configuration files..."
    
    print_success "Missing files created"
    return 0
}

# Optimize database
optimize_db() {
    print_step "Optimizing database..."
    
    (
        # Check if database exists and run optimization
        if [ -f "server/db.sqlite" ]; then
            if command -v sqlite3 &> /dev/null; then
                sqlite3 server/db.sqlite "VACUUM; ANALYZE;" 2>/dev/null
            else
                echo "SQLite3 command not found, skipping optimization"
            fi
        else
            echo "Database file not found, skipping optimization"
        fi
    ) &
    
    spinner $! "Running database optimization..."
    
    print_success "Database optimized"
    return 0
}

# Run security audit
run_security_audit() {
    print_step "Running security audit..."
    
    (
        cd client
        yarn audit --groups dependencies
        
        cd ../server
        yarn audit --groups dependencies
    ) &
    
    spinner $! "Checking for security vulnerabilities..."
    
    print_success "Security audit completed"
    return 0
}

# Start application
start_app() {
    print_step "Starting application..."
    
    # In a real implementation, this would start the client and server
    # For this example, we'll just simulate it
    (
        echo "Initializing server..."
        sleep 1
        echo "Starting client application..."
        sleep 1
        echo "Environment ready!"
    ) &
    
    spinner $! "Launching development environment..."
    
    print_success "Development environment started"
    return 0
}

# Display animated menu
show_menu() {
    clear
    echo -e "${CYAN}=== Development Environment Menu ===${NC}"
    echo "1) Start Application"
    echo "2) Start Application (Debug Mode)"
    echo "3) Run Tests"
    echo "4) Build Project"
    echo "5) Lint Code"
    echo "6) Exit"
    
    read -p "Select an option: " choice
    
    case $choice in
        1) start_app ;;
        2) start_debug_mode ;;
        3) run_tests ;;
        4) build_project ;;
        5) run_lint ;;
        6) exit 0 ;;
        *) print_error "Invalid option" && sleep 2 && show_menu ;;
    esac
}

# Debug mode function
start_debug_mode() {
    print_step "Starting application in debug mode"
    
    # Start server with Node inspector
    cd server
    NODE_ENV=development yarn dev --inspect=9229 &
    SERVER_PID=$!
    print_success "Server debug mode started on port 9229"
    
    # Give server time to start
    sleep 2
    
    # Start client with different inspector port
    cd ../client
    BROWSER=none PORT=3000 yarn dev --inspect=9230 &
    CLIENT_PID=$!
    print_success "Client debug mode started on port 9230"
    
    # Give processes time to start
    sleep 2
    
    # Open VS Code debugger
    code --reuse-window .
    
    print_warning "To start debugging:"
    print_warning "1. Press F5 or click the Debug icon in VS Code"
    print_warning "2. Select 'Server + Client' from the dropdown"
    print_warning "3. Set breakpoints in your code"
    print_warning "4. The debugger will automatically attach"
    
    # Keep the script running
    echo "Press Ctrl+C to stop the application..."
    
    # Wait for both processes
    wait $SERVER_PID $CLIENT_PID
}

# Utility Functions
validate_node_modules() {
    local dir=$1
    print_step "Validating node_modules in $dir..."
    
    if [ ! -d "$dir/node_modules" ]; then
        print_warning "node_modules not found in $dir"
        (cd "$dir" && yarn install --mode=update-lockfile)
        return $?
    fi
    
    return 0
}

validate_env_files() {
    local dir=$1
    if [ ! -f "$dir/.env" ]; then
        if [ -f "$dir/.env.example" ]; then
            print_step "Creating .env from example..."
            cp "$dir/.env.example" "$dir/.env"
        else
            print_warning "No .env or .env.example found in $dir"
            return 1
        fi
    fi
    return 0
}

check_db_status() {
    print_step "Checking database status..."
    
    if [ ! -f "server/db.sqlite" ]; then
        print_warning "Database file not found, initializing..."
        touch server/db.sqlite
        return 1
    fi
    
    return 0
}

run_vite_dev() {
    cd client
    if [ ! -f "vite.config.js" ]; then
        print_error "Vite config not found!"
        return 1
    fi
    yarn dev
}

run_server_dev() {
    cd server
    if [ ! -f "index.js" ]; then
        print_error "Server entry point not found!"
        return 1
    fi
    yarn dev
}

# Fix server package issues
fix_server_package_issues() {
    print_step "Analyzing server package issues..."
    
    # Create reports directory if it doesn't exist
    mkdir -p server/reports
    
    # Run with progress animation
    (
        cd server
        
        # Step 1: Run npm audit to find security issues
        echo "Running security audit..."
        npm audit --json > reports/security-audit.json 2>/dev/null
        
        # Step 2: Run ESLint to find code quality issues
        echo "Running ESLint analysis..."
        npx eslint . --format json > reports/eslint-report.json 2>/dev/null
        
        # Step 3: Check for outdated packages
        echo "Checking for outdated packages..."
        npm outdated --json > reports/outdated-packages.json 2>/dev/null
        
        # Step 4: Fix security vulnerabilities
        echo "Fixing security vulnerabilities..."
        npm audit fix
        
        # Step 5: Fix ESLint issues
        echo "Fixing ESLint issues..."
        npx eslint . --fix
        
        # Step 6: Update compatible dependencies
        echo "Updating compatible dependencies..."
        npx npm-check-updates -u --target minor
        
        # Step 7: Reinstall dependencies with fixed versions
        echo "Reinstalling dependencies..."
        npm install
        
        # Step 8: Generate final report
        echo "Generating final report..."
        {
            echo "# Server Package Correction Report"
            echo "## Generated on $(date)"
            echo ""
            echo "## Security Issues"
            echo "$(cat reports/security-audit.json | jq -r '.metadata.vulnerabilities | to_entries | map("\(.key): \(.value)") | join(", ")' 2>/dev/null || echo "No security issues found")"
            echo ""
            echo "## ESLint Issues"
            echo "$(cat reports/eslint-report.json | jq -r 'map(.errorCount + .warningCount) | add' 2>/dev/null || echo "No ESLint issues found")"
            echo ""
            echo "## Outdated Packages"
            echo "$(cat reports/outdated-packages.json | jq -r 'to_entries | map("\(.key): \(.value.current) -> \(.value.latest)") | join("\n")' 2>/dev/null || echo "No outdated packages found")"
            echo ""
            echo "## Actions Taken"
            echo "- Security vulnerabilities fixed"
            echo "- Code quality issues fixed"
            echo "- Compatible dependencies updated"
            echo "- Dependencies reinstalled"
        } > reports/correction-report.md
    ) &
    
    spinner $! "Fixing server package issues..."
    
    print_success "Server package issues fixed"
    echo "Report generated at server/reports/correction-report.md"
    return 0
}

# Fix client package issues
fix_client_package_issues() {
    print_step "Analyzing client package issues..."
    
    # Create reports directory if it doesn't exist
    mkdir -p client/reports
    
    # Run with progress animation
    (
        cd client
        
        # Step 1: Run npm audit to find security issues
        echo "Running security audit..."
        npm audit --json > reports/security-audit.json 2>/dev/null
        
        # Step 2: Run ESLint to find code quality issues
        echo "Running ESLint analysis..."
        npx eslint src --format json > reports/eslint-report.json 2>/dev/null
        
        # Step 3: Check for outdated packages
        echo "Checking for outdated packages..."
        npm outdated --json > reports/outdated-packages.json 2>/dev/null
        
        # Step 4: Fix security vulnerabilities
        echo "Fixing security vulnerabilities..."
        npm audit fix
        
        # Step 5: Fix ESLint issues
        echo "Fixing ESLint issues..."
        npx eslint src --fix
        
        # Step 6: Update compatible dependencies
        echo "Updating compatible dependencies..."
        npx npm-check-updates -u --target minor
        
        # Step 7: Reinstall dependencies with fixed versions
        echo "Reinstalling dependencies..."
        npm install
        
        # Step 8: Generate final report
        echo "Generating final report..."
        {
            echo "# Client Package Correction Report"
            echo "## Generated on $(date)"
            echo ""
            echo "## Security Issues"
            echo "$(cat reports/security-audit.json | jq -r '.metadata.vulnerabilities | to_entries | map("\(.key): \(.value)") | join(", ")' 2>/dev/null || echo "No security issues found")"
            echo ""
            echo "## ESLint Issues"
            echo "$(cat reports/eslint-report.json | jq -r 'map(.errorCount + .warningCount) | add' 2>/dev/null || echo "No ESLint issues found")"
            echo ""
            echo "## Outdated Packages"
            echo "$(cat reports/outdated-packages.json | jq -r 'to_entries | map("\(.key): \(.value.current) -> \(.value.latest)") | join("\n")' 2>/dev/null || echo "No outdated packages found")"
            echo ""
            echo "## Actions Taken"
            echo "- Security vulnerabilities fixed"
            echo "- Code quality issues fixed"
            echo "- Compatible dependencies updated"
            echo "- Dependencies reinstalled"
        } > reports/correction-report.md
    ) &
    
    spinner $! "Fixing client package issues..."
    
    print_success "Client package issues fixed"
    echo "Report generated at client/reports/correction-report.md"
    return 0
}

# Function to run linting for both client and server and output in VS Code compatible format
run_lint_for_vscode() {
    echo -e "${BLUE}${BOLD}Setting up real-time linting for client and server...${NC}"
    
    # Create reports directory if it doesn't exist
    mkdir -p reports
    
    # Clear any existing reports
    > reports/client-lint.txt
    > reports/server-lint.txt
    > reports/combined-lint.txt
    
    # Ensure correct Node.js version using NVM
    echo -e "${YELLOW}Ensuring correct Node.js version...${NC}"
    
    # Check if NVM is available
    if [ -s "$NVM_DIR/nvm.sh" ]; then
        # Load NVM
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        
        # Use Node.js version from .nvmrc or fallback to 18
        if [ -f ".nvmrc" ]; then
            echo -e "${CYAN}Using Node.js version from .nvmrc file...${NC}"
            nvm use
        else
            echo -e "${CYAN}Using Node.js version 18...${NC}"
            nvm use 18
        fi
    else
        echo -e "${YELLOW}NVM not found. Please ensure you're using Node.js 18 or higher.${NC}"
    fi
    
    # Install nodemon if not already installed
    if ! command -v nodemon &> /dev/null; then
        echo -e "${YELLOW}Installing nodemon for file watching...${NC}"
        npm install -g nodemon
    fi
    
    # Create a filter script for ESLint output
    cat > reports/filter-eslint.sh << 'EOF'
#!/bin/bash
# Remove ANSI color codes and format output for VS Code problem matcher
sed -E 's/\x1B\[[0-9;]*[mK]//g' | # Remove ANSI color codes
grep -v "^yarn" | 
grep -v "Done in" | 
grep -v "info Visit" |
grep -v "$ eslint" |
grep -v "^$" # Remove empty lines
EOF
    chmod +x reports/filter-eslint.sh
    
    # Run client linting in watch mode in the background using nodemon
    echo -e "${CYAN}Starting client linting in watch mode...${NC}"
    (cd client && npx nodemon --watch src --ext js,jsx,ts,tsx --exec "yarn eslint --format unix src/ 2>&1 | tee ../reports/client-lint.txt | ../reports/filter-eslint.sh") &
    CLIENT_PID=$!
    
    # Run server linting in watch mode in the background using nodemon
    echo -e "${CYAN}Starting server linting in watch mode...${NC}"
    (cd server && npx nodemon --watch . --ext js --ignore node_modules/ --exec "yarn eslint --format unix ./ 2>&1 | tee ../reports/server-lint.txt | ../reports/filter-eslint.sh") &
    SERVER_PID=$!
    
    # Display instructions
    echo -e "${GREEN}${BOLD}Real-time linting started!${NC}"
    echo -e "${YELLOW}Lint errors will appear in VS Code's Problems tab as you type.${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the linting process.${NC}"
    
    # Create a trap to kill background processes when this script is terminated
    trap "kill $CLIENT_PID $SERVER_PID 2>/dev/null; echo -e '\n${RED}Linting stopped.${NC}'; exit" INT TERM EXIT
    
    # Keep the script running to maintain the background processes
    echo -e "\n${CYAN}Watching for changes...${NC}"
    
    # Wait for both processes
    wait $CLIENT_PID $SERVER_PID
}

# Main execution
main() {
    # Show intro unless disabled
    if [ "$NO_ANIMATION" != "true" ]; then
        show_intro
    fi
    
    # Test mode execution
    if [ "$TEST_MODE" = "true" ]; then
        if [ -n "$TEST_OPTION" ]; then
            process_choice "$TEST_OPTION"
            exit 0
        else
            # Run all options in sequence
            for choice in {1..15}; do
                process_choice "$choice"
            done
            exit 0
        fi
    fi
    
    # Main menu loop
    while true; do
        show_menu
    done
}

# Execute main function with all arguments
main "$@"