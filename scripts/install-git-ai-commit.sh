#!/bin/bash

# Install Git AI Commit globally
# This script copies the git-ai-commit.sh to a global location and sets up the alias

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[install]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[install]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[install]${NC} $1"
}

print_error() {
    echo -e "${RED}[install]${NC} $1"
}

print_status "Installing Git AI Commit globally..."

# Create ~/.local/bin if it doesn't exist
LOCAL_BIN="$HOME/.local/bin"
if [ ! -d "$LOCAL_BIN" ]; then
    print_status "Creating $LOCAL_BIN directory..."
    mkdir -p "$LOCAL_BIN"
fi

# Copy the script to ~/.local/bin
if [ -f "./scripts/git-ai-commit.sh" ]; then
    print_status "Copying git-ai-commit.sh to $LOCAL_BIN..."
    cp "./scripts/git-ai-commit.sh" "$LOCAL_BIN/git-ai-commit"
    chmod +x "$LOCAL_BIN/git-ai-commit"
    print_success "Script copied successfully"
else
    print_error "git-ai-commit.sh not found in ./scripts/"
    print_error "Please run this script from your project root"
    exit 1
fi

# Update git alias to use global installation
print_status "Setting up global git alias..."
git config --global alias.ai-commit '!git-ai-commit'

print_success "Git AI Commit installed successfully!"

# Check if ~/.local/bin is in PATH
if [[ ":$PATH:" != *":$LOCAL_BIN:"* ]]; then
    print_warning "Warning: $LOCAL_BIN is not in your PATH"
    echo ""
    echo "To use git ai-commit from any directory, add this line to your shell profile:"
    echo "  ~/.bashrc or ~/.zshrc:"
    echo "    export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo ""
    echo "Then reload your shell or run: source ~/.bashrc (or ~/.zshrc)"
else
    print_success "Path is configured correctly"
fi

echo ""
print_success "You can now use 'git ai-commit' from any git repository!"
echo ""
echo "Usage:"
echo "  1. Stage your changes: git add <files>"
echo "  2. Generate AI commit: git ai-commit"
echo "  3. Review and confirm the generated message"