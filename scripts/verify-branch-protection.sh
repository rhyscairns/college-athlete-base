#!/bin/bash

# Branch Protection Verification Script
# This script verifies that GitHub branch protection rules are properly configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_check() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed."
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    print_error "Not authenticated with GitHub CLI."
    exit 1
fi

# Get repository information
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)

if [ -z "$REPO" ]; then
    print_error "Could not determine repository."
    exit 1
fi

OWNER=$(echo $REPO | cut -d'/' -f1)
REPO_NAME=$(echo $REPO | cut -d'/' -f2)
BRANCH="main"

print_info "Verifying branch protection for: $REPO (branch: $BRANCH)"
echo ""

# Fetch branch protection settings
PROTECTION=$(gh api \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "/repos/$OWNER/$REPO_NAME/branches/$BRANCH/protection" 2>/dev/null)

if [ -z "$PROTECTION" ]; then
    print_error "Branch protection is not configured for $BRANCH"
    echo ""
    print_info "To configure, run: ./scripts/configure-branch-protection.sh"
    print_info "Or see: docs/BRANCH_PROTECTION_SETUP.md"
    exit 1
fi

# Verification checks
CHECKS_PASSED=0
CHECKS_FAILED=0

# Check 1: Required pull request reviews
print_check "Checking required pull request reviews..."
REQUIRED_REVIEWS=$(echo "$PROTECTION" | grep -o '"required_approving_review_count":[0-9]*' | grep -o '[0-9]*' || echo "0")
if [ "$REQUIRED_REVIEWS" -ge 1 ]; then
    echo "  ✓ Required approvals: $REQUIRED_REVIEWS"
    ((CHECKS_PASSED++))
else
    echo "  ✗ Required approvals not configured"
    ((CHECKS_FAILED++))
fi

# Check 2: Dismiss stale reviews
if echo "$PROTECTION" | grep -q '"dismiss_stale_reviews":true'; then
    echo "  ✓ Dismiss stale reviews: enabled"
    ((CHECKS_PASSED++))
else
    echo "  ✗ Dismiss stale reviews: disabled"
    ((CHECKS_FAILED++))
fi

# Check 3: Required status checks
print_check "Checking required status checks..."
REQUIRED_CHECKS=$(echo "$PROTECTION" | grep -o '"contexts":\[[^]]*\]' || echo "")
if echo "$REQUIRED_CHECKS" | grep -q "build"; then
    echo "  ✓ Status check 'build' required"
    ((CHECKS_PASSED++))
else
    echo "  ✗ Status check 'build' not required"
    ((CHECKS_FAILED++))
fi

if echo "$REQUIRED_CHECKS" | grep -q "test"; then
    echo "  ✓ Status check 'test' required"
    ((CHECKS_PASSED++))
else
    echo "  ✗ Status check 'test' not required"
    ((CHECKS_FAILED++))
fi

if echo "$REQUIRED_CHECKS" | grep -q "lint"; then
    echo "  ✓ Status check 'lint' required"
    ((CHECKS_PASSED++))
else
    echo "  ✗ Status check 'lint' not required"
    ((CHECKS_FAILED++))
fi

if echo "$REQUIRED_CHECKS" | grep -q "code-quality"; then
    echo "  ✓ Status check 'code-quality' required"
    ((CHECKS_PASSED++))
else
    echo "  ✗ Status check 'code-quality' not required"
    ((CHECKS_FAILED++))
fi

# Check 4: Enforce on administrators
print_check "Checking administrator enforcement..."
if echo "$PROTECTION" | grep -q '"enforce_admins"'; then
    ENFORCE_ADMINS=$(echo "$PROTECTION" | grep -o '"enforce_admins":{[^}]*}' || echo "")
    if echo "$ENFORCE_ADMINS" | grep -q '"enabled":true'; then
        echo "  ✓ Enforce on administrators: enabled"
        ((CHECKS_PASSED++))
    else
        echo "  ✗ Enforce on administrators: disabled"
        ((CHECKS_FAILED++))
    fi
else
    echo "  ✗ Administrator enforcement not configured"
    ((CHECKS_FAILED++))
fi

# Check 5: Require conversation resolution
print_check "Checking conversation resolution requirement..."
if echo "$PROTECTION" | grep -q '"required_conversation_resolution":true'; then
    echo "  ✓ Require conversation resolution: enabled"
    ((CHECKS_PASSED++))
else
    echo "  ✗ Require conversation resolution: disabled"
    ((CHECKS_FAILED++))
fi

# Check 6: Block force pushes
print_check "Checking force push protection..."
if echo "$PROTECTION" | grep -q '"allow_force_pushes":false' || ! echo "$PROTECTION" | grep -q '"allow_force_pushes"'; then
    echo "  ✓ Force pushes: blocked"
    ((CHECKS_PASSED++))
else
    echo "  ✗ Force pushes: allowed"
    ((CHECKS_FAILED++))
fi

# Check 7: Block deletions
print_check "Checking deletion protection..."
if echo "$PROTECTION" | grep -q '"allow_deletions":false' || ! echo "$PROTECTION" | grep -q '"allow_deletions"'; then
    echo "  ✓ Branch deletions: blocked"
    ((CHECKS_PASSED++))
else
    echo "  ✗ Branch deletions: allowed"
    ((CHECKS_FAILED++))
fi

# Summary
echo ""
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo "Checks passed: $CHECKS_PASSED"
echo "Checks failed: $CHECKS_FAILED"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    print_info "✓ All branch protection checks passed!"
    print_info "Requirements 4.1, 4.2, 4.3, 4.4, 4.5 are satisfied"
    exit 0
else
    print_warning "Some branch protection checks failed."
    print_info "To reconfigure, run: ./scripts/configure-branch-protection.sh"
    print_info "Or see: docs/BRANCH_PROTECTION_SETUP.md"
    exit 1
fi
