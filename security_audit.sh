#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Starting security audit..."

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "Installing yarn..."
    npm install -g yarn
fi

# Run security checks
check_security() {
    local DIR=$1
    cd $DIR

    echo -e "\n${YELLOW}Checking $DIR...${NC}"
    
    # Run yarn audit
    yarn audit
    AUDIT_EXIT=$?

    # Run snyk test if available
    if command -v snyk &> /dev/null; then
        snyk test
        SNYK_EXIT=$?
    else
        yarn global add snyk
        snyk auth
        snyk test
        SNYK_EXIT=$?
    fi

    # Fix vulnerabilities
    if [ $AUDIT_EXIT -ne 0 ] || [ $SNYK_EXIT -ne 0 ]; then
        echo -e "${RED}Vulnerabilities found. Attempting to fix...${NC}"
        
        # Try to upgrade packages with vulnerabilities
        yarn upgrade
        
        # Run yarn audit fix
        yarn audit fix
        
        # Run snyk wizard
        snyk wizard
        
        # Run snyk monitor
        snyk monitor
    fi

    # Verify fixes
    yarn audit
    FINAL_AUDIT=$?
    
    if [ $FINAL_AUDIT -ne 0 ]; then
        echo -e "${RED}Security vulnerabilities still exist. Please review manually.${NC}"
        exit 1
    fi

    cd ..
}

# Check root directory
check_security .

# Check client directory
check_security client

# Check server directory
check_security server

echo -e "${GREEN}Security audit completed successfully!${NC}"
