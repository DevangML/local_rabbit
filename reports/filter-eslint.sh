#!/bin/bash
# Remove ANSI color codes and format output for VS Code problem matcher
sed -E 's/\x1B\[[0-9;]*[mK]//g' | # Remove ANSI color codes
grep -v "^yarn" | 
grep -v "Done in" | 
grep -v "info Visit" |
grep -v "$ eslint" |
grep -v "^$" # Remove empty lines
