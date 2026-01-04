#!/bin/bash

# Test script for branch protection configuration scripts
# This script validates that the configuration scripts are properly set up

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

TESTS_PASSED=0
TESTS_FAILED=0

print_info "Testing branch protection scripts..."
echo ""

# Test 1: Check if scripts exist
print_test "Checking if scripts exist..."
if [ -f "scripts/configure-branch-protection.sh" ]; then
    print_pass "configure-branch-protection.sh exists"
    ((TESTS_PASSED++))
else
    print_fail "configure-branch-protection.sh not found"
    ((TESTS_FAILED++))
fi

if [ -f "scripts/verify-branch-protection.sh" ]; then
    print_pass "verify-branch-protection.sh exists"
    ((TESTS_PASSED++))
else
    print_fail "verify-branch-protection.sh not found"
    ((TESTS_FAILED++))
fi

# Test 2: Check if scripts are executable
print_test "Checking if scripts are executable..."
if [ -x "scripts/configure-branch-protection.sh" ]; then
    print_pass "configure-branch-protection.sh is executable"
    ((TESTS_PASSED++))
else
    print_fail "configure-branch-protection.sh is not executable"
    ((TESTS_FAILED++))
fi

if [ -x "scripts/verify-branch-protection.sh" ]; then
    print_pass "verify-branch-protection.sh is executable"
    ((TESTS_PASSED++))
else
    print_fail "verify-branch-protection.sh is not executable"
    ((TESTS_FAILED++))
fi

# Test 3: Check if documentation exists
print_test "Checking if documentation exists..."
if [ -f "docs/BRANCH_PROTECTION_SETUP.md" ]; then
    print_pass "BRANCH_PROTECTION_SETUP.md exists"
    ((TESTS_PASSED++))
else
    print_fail "BRANCH_PROTECTION_SETUP.md not found"
    ((TESTS_FAILED++))
fi

# Test 4: Check if workflow exists
print_test "Checking if verification workflow exists..."
if [ -f ".github/workflows/verify-branch-protection.yml" ]; then
    print_pass "verify-branch-protection.yml workflow exists"
    ((TESTS_PASSED++))
else
    print_fail "verify-branch-protection.yml workflow not found"
    ((TESTS_FAILED++))
fi

# Test 5: Validate script syntax
print_test "Validating script syntax..."
if bash -n scripts/configure-branch-protection.sh 2>/dev/null; then
    print_pass "configure-branch-protection.sh syntax is valid"
    ((TESTS_PASSED++))
else
    print_fail "configure-branch-protection.sh has syntax errors"
    ((TESTS_FAILED++))
fi

if bash -n scripts/verify-branch-protection.sh 2>/dev/null; then
    print_pass "verify-branch-protection.sh syntax is valid"
    ((TESTS_PASSED++))
else
    print_fail "verify-branch-protection.sh has syntax errors"
    ((TESTS_FAILED++))
fi

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "Tests passed: $TESTS_PASSED"
echo "Tests failed: $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    print_info "✓ All tests passed!"
    exit 0
else
    print_fail "Some tests failed"
    exit 1
fi
