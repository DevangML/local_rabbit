#!/bin/bash

# Create a log directory if it doesn't exist
mkdir -p logs

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a logs/test_run.log
}

# Export YARN_IGNORE_NODE=1 for Yarn Berry compatibility
export YARN_IGNORE_NODE=1

# Clean up any previous logs
rm -f logs/option_*.log logs/error_summary.log logs/test_run.log

# Run each option individually
for i in {1..12}; do
    log_message "Testing option $i..."
    ./run.sh --no-animation --no-sound --test-mode --test-option=$i 2>&1 | tee logs/option_${i}.log
    
    # Check for errors
    if grep -i "error" logs/option_${i}.log > /dev/null; then
        log_message "⚠️ Found error in option $i"
    fi
    if grep -i "failed" logs/option_${i}.log > /dev/null; then
        log_message "⚠️ Found failure in option $i"
    fi
    
    # Clean up processes
    pkill -f "yarn" || true
    pkill -f "node" || true
    
    sleep 2
done

# Analyze logs for errors
log_message "Analyzing logs for errors..."
echo "=== Error Summary ===" > logs/error_summary.log
for i in {1..12}; do
    if [ -f logs/option_${i}.log ]; then
        echo "=== Option $i Errors ===" >> logs/error_summary.log
        grep -i "error\|failed\|warning" logs/option_${i}.log >> logs/error_summary.log 2>/dev/null
    fi
done

log_message "Test run completed. Check logs/error_summary.log for details." 