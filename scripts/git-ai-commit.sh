#!/bin/bash

# Git AI Commit - Generate conventional commit messages using Claude Code CLI
# Usage: git ai-commit

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "\n${CYAN}${BOLD}🤖 Git AI Commit${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━${NC}"
}

print_status() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_commit_msg() {
    echo -e "\n${BOLD}Proposed commit message:${NC}"
    echo -e "${GREEN}┌─────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${GREEN}│${NC} $1 ${GREEN}│${NC}"
    echo -e "${GREEN}└─────────────────────────────────────────────────────────────┘${NC}\n"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi

# Check if Claude Code CLI is available
if ! command -v claude &> /dev/null; then
    print_error "Claude Code CLI not found"
    echo -e "Please install Claude Code CLI from: ${BLUE}https://claude.ai/code${NC}"
    exit 1
fi

print_header

# Check if there are staged changes
STAGED_CHANGES=$(git diff --cached --name-only)
if [ -z "$STAGED_CHANGES" ]; then
    print_error "No staged changes found"
    echo "Please stage your changes first with: git add <files>"
    exit 1
fi

print_status "Analyzing staged changes..."

# Get the staged diff
STAGED_DIFF=$(git diff --cached)

# Get list of changed files for better context
CHANGED_FILES=$(git diff --cached --name-only | tr '\n' ', ' | sed 's/,$//')

# Count the number of files
FILE_COUNT=$(echo "$STAGED_CHANGES" | wc -l | tr -d ' ')

print_status "Found changes in $FILE_COUNT file(s): $CHANGED_FILES"

# Create prompt for Claude Code using stdin instead of temp file
PROMPT_TEXT="Generate a conventional commit message for the following git diff. 

Requirements:
1. Follow conventional commit format: type(scope): description
2. Use appropriate conventional commit types:
   - feat: new features
   - fix: bug fixes
   - docs: documentation changes
   - style: formatting, missing semicolons, etc (no code changes)
   - refactor: code refactoring (no functional changes)
   - test: adding or updating tests
   - chore: maintenance tasks, dependency updates
   - perf: performance improvements
   - ci: changes to CI configuration files and scripts
   - build: changes to build system or external dependencies

3. Include scope when relevant (e.g., components, api, ui, hooks, types, config)
4. Keep description concise but descriptive
5. Use imperative mood (e.g., \"add\" not \"adds\" or \"added\")
6. Start description with lowercase letter
7. Do not end with period
8. If multiple types of changes, choose the most significant one

Respond with ONLY the commit message, nothing else.

Files changed: $CHANGED_FILES

Git diff:
$STAGED_DIFF"

print_status "Generating commit message with Claude Code CLI..."

# Generate commit message using Claude Code with stdin
COMMIT_MESSAGE=$(echo "$PROMPT_TEXT" | claude 2>/dev/null | tr -d '\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

# Validate that we got a reasonable response
if [ -z "$COMMIT_MESSAGE" ] || [ ${#COMMIT_MESSAGE} -lt 10 ]; then
    print_error "Failed to generate commit message"
    print_warning "Please check your staged changes and try again"
    exit 1
fi

# Display the proposed commit message
print_commit_msg "$COMMIT_MESSAGE"

# Ask for confirmation
while true; do
    echo -e "${BOLD}Options:${NC}"
    echo -e "  ${GREEN}y${NC} - Commit with this message"
    echo -e "  ${YELLOW}e${NC} - Edit the message"
    echo -e "  ${BLUE}r${NC} - Regenerate message"
    echo -e "  ${RED}n${NC} - Cancel"
    echo -e "\n${CYAN}Choose [y/e/r/n]:${NC} \c"
    read -r choice

    case $choice in
        [Yy]* ) 
            print_status "Committing changes..."
            git commit -m "$COMMIT_MESSAGE"
            print_success "Committed successfully!"
            echo -e "Message: ${GREEN}$COMMIT_MESSAGE${NC}"
            break
            ;;
        [Ee]* )
            # Use git's default editor to edit the commit message
            print_status "Opening editor to modify commit message..."
            echo "$COMMIT_MESSAGE" > .git/COMMIT_EDITMSG
            ${EDITOR:-vi} .git/COMMIT_EDITMSG
            EDITED_MESSAGE=$(cat .git/COMMIT_EDITMSG | head -1)
            rm -f .git/COMMIT_EDITMSG
            
            if [ -n "$EDITED_MESSAGE" ]; then
                print_status "Committing with edited message..."
                git commit -m "$EDITED_MESSAGE"
                print_success "Committed successfully!"
                echo -e "Message: ${GREEN}$EDITED_MESSAGE${NC}"
            else
                print_warning "Empty commit message, cancelling"
            fi
            break
            ;;
        [Rr]* )
            print_status "Regenerating commit message..."
            exec "$0"  # Restart the script
            ;;
        [Nn]* ) 
            print_warning "Commit cancelled"
            break
            ;;
        * ) 
            print_error "Please answer y, e, r, or n"
            ;;
    esac
done

echo -e "\n${CYAN}Thanks for using Git AI Commit! 🚀${NC}"