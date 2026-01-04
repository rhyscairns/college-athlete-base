#!/bin/bash

# Branch Protection Configuration Script
# This script configures GitHub branch protection rules using the GitHub CLI
# Requirements: 4.1, 4.2, 4.3, 4.4, 4.5

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed."
    echo "Please install it first:"
    echo "  macOS: brew install gh"
    echo "  Linux: See https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    print_error "Not authenticated with GitHub CLI."
    echo "Please run: gh auth login"
    exit 1
fi

# Get repository information
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)

if [ -z "$REPO" ]; then
    print_error "Could not determine repository. Make sure you're in a git repository."
    exit 1
fi

print_info "Configuring branch protection for repository: $REPO"

# Extract owner and repo name
OWNER=$(echo $REPO | cut -d'/' -f1)
REPO_NAME=$(echo $REPO | cut -d'/' -f2)

# Branch to protect
BRANCH="main"

print_info "Configuring protection rules for branch: $BRANCH"

# Create branch protection configuration
print_info "Setting up branch protection rules..."

# Note: GitHub CLI doesn't have a direct command for branch protection
# We need to use the API directly

# Create the protection configuration
PROTECTION_CONFIG=$(cat <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build", "test", "lint", "code-quality"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": true
}
EOF
)

# Apply branch protection
print_info "Applying branch protection rules..."

if gh api \
    --method PUT \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "/repos/$OWNER/$REPO_NAME/branches/$BRANCH/protection" \
    --input - <<< "$PROTECTION_CONFIG" > /dev/null 2>&1; then
    
    print_info "✓ Branch protection rules configured successfully!"
    echo ""
    print_info "Configuration summary:"
    echo "  • Branch: $BRANCH"
    echo "  • Required approvals: 1"
    echo "  • Required status checks: build, test, lint, code-quality"
    echo "  • Dismiss stale reviews: enabled"
    echo "  • Enforce on administrators: enabled"
    echo "  • Require conversation resolution: enabled"
    echo "  • Allow force pushes: disabled"
    echo "  • Allow deletions: disabled"
    echo ""
    print_info "View settings at: https://github.com/$OWNER/$REPO_NAME/settings/branches"
else
    print_error "Failed to configure branch protection rules."
    echo ""
    print_warning "You may need to configure manually via GitHub web interface."
    print_warning "See docs/BRANCH_PROTECTION_SETUP.md for detailed instructions."
    exit 1
fi

# Verify configuration
print_info "Verifying configuration..."

if gh api \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "/repos/$OWNER/$REPO_NAME/branches/$BRANCH/protection" \
    > /dev/null 2>&1; then
    
    print_info "✓ Branch protection is active and verified!"
else
    print_warning "Could not verify branch protection settings."
fi

echo ""
print_info "Configuration complete!"
print_info "For more details, see: docs/BRANCH_PROTECTION_SETUP.md"
