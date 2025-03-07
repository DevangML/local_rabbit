#!/bin/bash

# Set up colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== Complete Code Quality Fixer Script =====${NC}"
echo "This script will fix code quality issues in both client and server packages."
echo

# Record the start time
START_TIME=$(date +%s)

# Create unified report directory
mkdir -p reports

# 1. FIX CLIENT CODE QUALITY
echo -e "${BLUE}===== STEP 1: FIXING CLIENT CODE QUALITY =====${NC}"
cd packages/client
./fix-code-quality.sh
cd ../..

# 2. FIX SERVER CODE QUALITY
echo -e "${BLUE}===== STEP 2: FIXING SERVER CODE QUALITY =====${NC}"
cd packages/server
./fix-code-quality.sh
cd ../..

# Calculate the total execution time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

# 3. GENERATE UNIFIED REPORT
echo -e "${BLUE}===== COMPLETE CODE QUALITY IMPROVEMENT SUMMARY =====${NC}"
echo -e "Client package fixes:"
cat packages/client/reports/code-quality-report.txt
echo -e "\n-----------------------------\n"
echo -e "Server package fixes:"
cat packages/server/reports/code-quality-report.txt
echo -e "\n-----------------------------\n"
echo -e "${GREEN}All fixes completed in ${MINUTES}m ${SECONDS}s.${NC}"
echo -e "Detailed reports saved in each package's ${YELLOW}reports/${NC} directory."
echo

# Make the script executable
chmod +x fix-all-code-quality.sh 