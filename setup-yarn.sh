#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "Setting up Yarn Berry..."

# Install latest stable version of Yarn globally
npm install -g yarn

# Set up Yarn Berry in the project
cd "$(dirname "$0")"
yarn set version berry
yarn set version 3.6.0

# Initialize Yarn Berry
yarn init -2

# Install plugins
yarn plugin import @yarnpkg/plugin-interactive-tools
yarn plugin import @yarnpkg/plugin-version

# Create .yarnrc.yml with correct configuration
cat > .yarnrc.yml << EOL
nodeLinker: node-modules

enableScripts: true
enableTelemetry: false
networkTimeout: 100000

packageExtensions:
  "@mui/material@*":
    peerDependencies:
      "@emotion/react": "*"
      "@emotion/styled": "*"
  "react-scripts@*":
    peerDependencies:
      typescript: "*"
  "eslint-config-react-app@*":
    peerDependencies:
      typescript: "*"

plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-interactive-tools.cjs
    spec: "@yarnpkg/plugin-interactive-tools"
  - path: .yarn/plugins/@yarnpkg/plugin-version.cjs
    spec: "@yarnpkg/plugin-version"
EOL

# Create .gitignore for Yarn
cat > .gitignore << EOL
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions
EOL

echo -e "${GREEN}Yarn Berry setup completed!${NC}"
echo "Run 'yarn install' to install dependencies"
