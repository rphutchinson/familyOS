#!/bin/bash

# Healthcare Dashboard - Manual Documentation Update Script
# Updates CLAUDE.md based on current project state

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[update-docs]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[update-docs]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[update-docs]${NC} $1"
}

print_error() {
    echo -e "${RED}[update-docs]${NC} $1"
}

# Check if Claude Code CLI is available
if ! command -v claude &> /dev/null; then
    print_error "Claude Code CLI not found. Please install Claude Code to use this script."
    echo "Visit: https://claude.ai/code for installation instructions"
    exit 1
fi

print_status "Starting manual documentation update..."

# Create analysis of current project state
TEMP_ANALYSIS=$(mktemp)
cat > "$TEMP_ANALYSIS" << 'EOF'
Please analyze the current state of this healthcare dashboard project and update CLAUDE.md to reflect the current architecture, dependencies, and structure.

Focus on these sections and update them based on the actual project files:

1. **Tech Stack** - Review package.json for current dependencies and versions
2. **Folder Structure** - Analyze the actual directory structure 
3. **Key Components** - Identify all components in the components/ directory
4. **Data Models** - Review types/index.ts for current interfaces
5. **State Management** - Check hooks/ directory for custom hooks
6. **Key Dependencies** - Update dependency list from package.json
7. **Styling Conventions** - Review globals.css and component patterns

Please ensure all information is current and accurate based on the actual project files.
Only update sections where you find discrepancies or new information.

After updating, please confirm the changes made.
EOF

print_status "Analyzing project structure and updating documentation..."

# Use Claude Code to update documentation
if claude -p "$TEMP_ANALYSIS" --edit CLAUDE.md; then
    print_success "CLAUDE.md has been updated successfully!"
    print_status "Review the changes and commit them if they look correct."
else
    print_error "Failed to update CLAUDE.md. Please check for any issues."
    exit 1
fi

# Clean up
rm -f "$TEMP_ANALYSIS"

print_success "Documentation update completed!"