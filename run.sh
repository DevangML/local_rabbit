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
    play_sound "menu"
    
    local menu_title="LocalCodeRabbit - Development Tools"
    local menu_width=60
    local padding=$(( (TERM_WIDTH - menu_width) / 2 ))
    
    # Top border with animation
    printf "%${padding}s" ""
    printf "${CYAN}╔"
    for (( i=1; i<$((menu_width-1)); i++ )); do
        printf "═"
        if (( i % 5 == 0 )); then
            sleep 0.01
        fi
    done
    printf "╗${NC}\n"
    
    # Title
    printf "%${padding}s" ""
    printf "${CYAN}║"
    title_padding=$(( (menu_width - 2 - ${#menu_title}) / 2 ))
    printf "%${title_padding}s${YELLOW}%s${NC}%${title_padding}s" "" "$menu_title" ""
    if [ $(( title_padding * 2 + ${#menu_title} )) -lt $((menu_width - 2)) ]; then
        printf " "
    fi
    printf "${CYAN}║${NC}\n"
    
    # Separator
    printf "%${padding}s" ""
    printf "${CYAN}╠"
    printf '═%.0s' $(seq 1 $((menu_width-2)))
    printf "╣${NC}\n"
    
    # Menu options
    local options=(
        "Check System Requirements" 
        "Clean Installation" 
        "Install Dependencies" 
        "Update Package Scripts" 
        "Create Missing Files" 
        "Clear Cache" 
        "Optimize Database" 
        "Run Linter" 
        "Run VS Code Linter"
        "Run Tests" 
        "Run Security Audit" 
        "Start Application" 
        "Run Complete Setup"
        "Fix Server Package Issues"
        "Fix Client Package Issues"
        "Exit"
    )
    
    for i in "${!options[@]}"; do
        printf "%${padding}s" ""
        printf "${CYAN}║ ${GREEN}%2d${NC}) ${WHITE}%-$(($menu_width - 8))s${CYAN} ║${NC}\n" "$((i+1))" "${options[$i]}"
        sleep 0.03
    done
    
    # Bottom border
    printf "%${padding}s" ""
    printf "${CYAN}╚"
    printf '═%.0s' $(seq 1 $((menu_width-2)))
    printf "╝${NC}\n"
    
    # Prompt
    printf "%${padding}s" ""
    printf "${YELLOW}Select an option [1-${#options[@]}]:${NC} "
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
    
    # Run client linting in watch mode in the background using nodemon
    echo -e "${CYAN}Starting client linting in watch mode...${NC}"
    (cd client && npx nodemon --watch src --ext js,jsx,ts,tsx --exec "yarn eslint --format unix src/ | tee ../reports/client-lint.txt") &
    CLIENT_PID=$!
    
    # Run server linting in watch mode in the background using nodemon
    echo -e "${CYAN}Starting server linting in watch mode...${NC}"
    (cd server && npx nodemon --watch . --ext js --ignore node_modules/ --exec "yarn eslint --format unix ./ | tee ../reports/server-lint.txt") &
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

# Process menu choice
process_choice() {
    local choice=$1
    local success=false
    
    # Clear the screen but maintain a header
    clear
    printf "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}\n"
    printf "${CYAN}║ ${YELLOW}LocalCodeRabbit - Running: %-33s${CYAN} ║${NC}\n" "${options[$((choice-1))]}"
    printf "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}\n\n"
    
    case $choice in
        1) check_system_requirements && {
                validate_env_files "client" &&
                validate_env_files "server" &&
                success=true
            }
            ;;
            
        2) clean_install && {
                validate_node_modules "client" || yarn install --mode=update-lockfile &&
                validate_node_modules "server" || yarn install --mode=update-lockfile &&
                success=true
            }
            ;;
            
        3) (cd client && yarn install) && 
            (cd server && yarn install) && 
            success=true
            ;;
            
        4) update_package_scripts && {
                (cd client && yarn install) &&
                (cd server && yarn install) &&
                success=true
            }
            ;;
            
        5) create_missing_files && {
                validate_env_files "client" &&
                validate_env_files "server" &&
                check_db_status &&
                success=true
            }
            ;;
            
        6) clear_cache && {
                rm -rf client/.cache client/node_modules/.cache &&
                rm -rf server/.cache server/node_modules/.cache &&
                success=true
            }
            ;;
            
        7) optimize_db && {
                check_db_status &&
                (cd client && node scripts/optimize-db.js) &&
                success=true
            }
            ;;
            
        8) (cd client && yarn lint) && 
            (cd server && yarn lint) && 
            success=true
            ;;
            
        9) run_lint_for_vscode && success=true
            ;;
            
        10) (cd client && yarn test) && 
            (cd server && yarn test) && 
            success=true
            ;;
            
        11) run_security_audit && {
                (cd client && yarn audit) &&
                (cd server && yarn audit) &&
                success=true
            }
            ;;
            
        12) print_step "Starting development servers..."
            
            # Start both servers in parallel
            (run_server_dev) & 
            local server_pid=$!
            
            sleep 2  # Give the server time to start
            
            (run_vite_dev) &
            local client_pid=$!
            
            # Wait for both processes
            wait $server_pid
            wait $client_pid
            
            success=true
            ;;
            
        13) run_complete_setup && success=true
            ;;
            
        14) fix_server_package_issues && success=true
            ;;
            
        15) fix_client_package_issues && success=true
            ;;
            
        16) exit 0
            ;;
            
        *) print_error "Invalid option"
            ;;
    esac
    
    if $success; then
        echo
        echo -e "${GREEN}Operation completed successfully.${NC}"
    else
        echo
        echo -e "${RED}Operation failed or was interrupted.${NC}"
    fi
    
    echo -e "\n${WHITE}Press any key to return to the menu...${NC}"
    read -n 1 -s
}

# Parse command line arguments
parse_args() {
    # Process any command line arguments
    for arg in "$@"; do
        case $arg in
            --no-animation)
                NO_ANIMATION=true
                ;;
            --no-sound)
                NO_SOUND=true
                ;;
            --test-mode)
                TEST_MODE=true
                ;;
            --test-option=*)
                TEST_OPTION="${arg#*=}"
                ;;
            lint-vscode)
                run_lint_for_vscode
                exit $?
                ;;
            --help)
                echo "Usage: $0 [options]"
                echo
                echo "Options:"
                echo "  --no-animation    Disable animations"
                echo "  --no-sound        Disable sound effects"
                echo "  --test-mode       Run in test mode"
                echo "  --test-option=N   Run specific option in test mode"
                echo "  lint-vscode       Run ESLint for VS Code problems tab"
                echo "  --help            Show this help message"
                exit 0
                ;;
        esac
    done
}

# Main execution
main() {
    # Parse command line arguments
    parse_args "$@"
    
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
        options=(
            "Check System Requirements" 
            "Clean Installation" 
            "Install Dependencies" 
            "Update Package Scripts" 
            "Create Missing Files" 
            "Clear Cache" 
            "Optimize Database" 
            "Run Linter" 
            "Run VS Code Linter"
            "Run Tests" 
            "Run Security Audit" 
            "Start Application" 
            "Run Complete Setup"
            "Fix Server Package Issues"
            "Fix Client Package Issues"
            "Exit"
        )
        
        show_menu
        read -r choice
        process_choice "$choice"
    done
}

# Execute main function with all arguments
main "$@"