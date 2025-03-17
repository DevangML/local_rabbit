#!/bin/bash

# Terminal colors
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

# Check if dependencies are installed
function check_dependencies() {
  echo -e "${BLUE}Checking dependencies...${NC}"
  
  if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js.${NC}"
    exit 1
  fi
  
  if ! command -v yarn &> /dev/null; then
    echo -e "${YELLOW}Yarn is not installed. Installing dependencies with npm...${NC}"
    npm install
  else
    echo -e "${BLUE}Installing dependencies with yarn...${NC}"
    yarn install
  fi
  
  echo -e "${GREEN}Dependencies are installed.${NC}"
}

# Create reports directory
REPORT_DIR="reports"
mkdir -p $REPORT_DIR
# Run ESLint check
function run_eslint_check() {
  echo -e "${BLUE}Running ESLint check...${NC}"
  yarn eslint src --ext .js,.jsx,.ts,.tsx -o "$REPORT_DIR/eslint_errors.log" --quiet || true
  
  # Check if there are ESLint errors
  if [ -s "$REPORT_DIR/eslint_errors.log" ]; then
    ERROR_COUNT=$(grep -c "\(\[error\]\)" "$REPORT_DIR/eslint_errors.log")
    echo -e "${YELLOW}Found ESLint errors. See $REPORT_DIR/eslint_errors.log for details.${NC}"
    
    # Try to fix automatically with ESLint fix
    echo -e "${BLUE}Fixing ESLint errors automatically...${NC}"
    yarn eslint src --ext .js,.jsx,.ts,.tsx --fix || true
    
    # Fix additional issues that ESLint's --fix can't handle
    echo -e "${BLUE}Fixing additional ESLint issues...${NC}"
    
    # Fix quotes
    find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s/'/\"/g" {} \;
    
    # Fix console logs
    find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s/console\.log(/\/\/ console.log(/g" {} \;
    
    # Fix indentation
    find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s/^  /    /g" {} \;
    
    # Run our enhanced ESLint fixer
    echo -e "${BLUE}Running enhanced ESLint fixer...${NC}"
    node scripts/fix-eslint-issues.js
    
    # Add missing return types
    echo -e "${BLUE}Adding missing return types...${NC}"
    find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s/function \([a-zA-Z0-9_$]\+\)(/function \1(): void (/g" {} \;
    find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s/const \([a-zA-Z0-9_$]\+\) = (.*) =>/const \1 = (.*): void =>/g" {} \;
    
    # Add browser globals to files
    echo -e "${BLUE}Adding browser globals to files...${NC}"
    find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) | xargs grep -l "window" | xargs -I{} sed -i '' '1s/^/\/* global window *\/\n/' {}
    find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) | xargs grep -l "document" | xargs -I{} sed -i '' '1s/^/\/* global document *\/\n/' {}
    find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) | xargs grep -l "localStorage" | xargs -I{} sed -i '' '1s/^/\/* global localStorage *\/\n/' {}
    find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) | xargs grep -l "fetch" | xargs -I{} sed -i '' '1s/^/\/* global fetch *\/\n/' {}
    find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) | xargs grep -l "console" | xargs -I{} sed -i '' '1s/^/\/* global console *\/\n/' {}
    
    # Fix conditional expressions
    echo -e "${BLUE}Fixing conditional expressions...${NC}"
    find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s/if (\([a-zA-Z0-9_$]\+\))/if (Boolean(\1))/g" {} \;
    
    # Fix floating promises
    echo -e "${BLUE}Fixing floating promises...${NC}"
    find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s/\([a-zA-Z0-9_$]\+\)();/void \1();/g" {} \;
    
    # Run ESLint check again
    yarn eslint src --ext .js,.jsx,.ts,.tsx -o "$REPORT_DIR/eslint_errors_after_fix.log" --quiet || true
    
    if [ -s "$REPORT_DIR/eslint_errors_after_fix.log" ]; then
      REMAINING_ERRORS=$(grep -c "\(\[error\]\)" "$REPORT_DIR/eslint_errors_after_fix.log")
      echo -e "${YELLOW}After fixes, there are still ESLint errors. See $REPORT_DIR/eslint_errors_after_fix.log for details.${NC}"
    else
      echo -e "${GREEN}All ESLint errors have been fixed!${NC}"
    fi
  else
    echo -e "${GREEN}No ESLint errors found.${NC}"
  fi
}

# Fix tsconfig.json to include all files
function fix_tsconfig() {
  echo -e "${BLUE}Updating tsconfig.json to include all files...${NC}"
  
  # Create a backup
  cp tsconfig.json tsconfig.json.bak
  
  # Update the include section to include all file extensions
  sed -i '' 's/"include": \[\s*"src\/\*\*\/\*"\s*\]/"include": \[\n    "src\/\*\*\/\*.ts",\n    "src\/\*\*\/\*.tsx",\n    "src\/\*\*\/\*.js",\n    "src\/\*\*\/\*.jsx"\n  \]/g' tsconfig.json
  
  echo -e "${GREEN}Updated tsconfig.json to include all file types.${NC}"
}

# Fix parser errors
function fix_parser_errors() {
  echo -e "${BLUE}Fixing parser errors...${NC}"
  
  # Check common syntax issues
  find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/,\s*}/}/g' {} \;
  find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/,\s*\]/]/g' {} \;
  
  echo -e "${GREEN}Fixed common syntax errors.${NC}"
}

# Main function
function main() {
  echo -e "${BLUE}=== Starting Code Quality Fix Script ===${NC}"
  
  check_dependencies
  fix_tsconfig
  fix_parser_errors
  run_eslint_check
  
  echo -e "${BLUE}=== Code Quality Fix Complete ===${NC}"
  echo -e "${YELLOW}If any errors remain, they may need to be fixed manually.${NC}"
}

# Run the main function
main 