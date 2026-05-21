#!/bin/bash
# scripts/__tests__/dev-connect.test.sh
#
# Tests that dev-connect.sh refuses to run when AWS_PROFILE points to a
# production account (profile name contains "prod").
#
# Requirements: 7.2
#
# Run with: bash scripts/__tests__/dev-connect.test.sh

SCRIPT="scripts/dev-connect.sh"
PASS=0
FAIL=0

# ─── Helpers ─────────────────────────────────────────────────────────────────
pass() { echo "  ✅  PASS: $*"; PASS=$((PASS + 1)); }
fail() { echo "  ❌  FAIL: $*"; FAIL=$((FAIL + 1)); }

# ─── Stub aws CLI ─────────────────────────────────────────────────────────────
# Creates a temporary stub that simulates 'aws sts get-caller-identity'
# returning a known account ID, so the script can reach the profile-name check
# without real AWS credentials.
setup_aws_stub() {
    local account_id="${1:-123456789012}"
    STUB_DIR=$(mktemp -d)
    cat > "$STUB_DIR/aws" <<STUB
#!/bin/bash
if [[ "\$*" == *"sts get-caller-identity"* ]]; then
    echo '{"Account":"${account_id}","Arn":"arn:aws:iam::${account_id}:user/test","UserId":"AIDATEST"}'
    exit 0
fi
exit 1
STUB
    chmod +x "$STUB_DIR/aws"
    export PATH="$STUB_DIR:$PATH"
    export _STUB_DIR="$STUB_DIR"
}

teardown_aws_stub() {
    if [[ -n "${_STUB_DIR:-}" && -d "$_STUB_DIR" ]]; then
        rm -rf "$_STUB_DIR"
        unset _STUB_DIR
    fi
}

run_script() {
    # Run in a subshell so set -e doesn't kill the test runner
    bash "$SCRIPT" "$@" 2>&1
    return $?
}

# ─── Tests ───────────────────────────────────────────────────────────────────
echo ""
echo "Running dev-connect.sh tests..."
echo "────────────────────────────────────────────────────────────"

# Test 1: profile named 'prod' is blocked
setup_aws_stub "123456789012"
if run_script > /dev/null 2>&1; then
    fail "Exits non-zero when AWS_PROFILE=prod"
else
    pass "Exits non-zero when AWS_PROFILE=prod"
fi
teardown_aws_stub

# Test 2: profile named 'production' is blocked
setup_aws_stub "123456789012"
OUTPUT=$(AWS_PROFILE=production run_script 2>&1 || true)
if AWS_PROFILE=production bash "$SCRIPT" > /dev/null 2>&1; then
    fail "Exits non-zero when AWS_PROFILE=production"
else
    pass "Exits non-zero when AWS_PROFILE=production"
fi
teardown_aws_stub

# Test 3: profile named 'my-prod-account' is blocked
setup_aws_stub "123456789012"
if AWS_PROFILE=my-prod-account bash "$SCRIPT" > /dev/null 2>&1; then
    fail "Exits non-zero when AWS_PROFILE=my-prod-account"
else
    pass "Exits non-zero when AWS_PROFILE=my-prod-account"
fi
teardown_aws_stub

# Test 4: error message mentions BLOCKED when profile=prod
setup_aws_stub "123456789012"
OUTPUT=$(AWS_PROFILE=prod bash "$SCRIPT" 2>&1 || true)
if echo "$OUTPUT" | grep -qi "BLOCKED"; then
    pass "Prints BLOCKED message when AWS_PROFILE=prod"
else
    fail "Prints BLOCKED message when AWS_PROFILE=prod — got: $OUTPUT"
fi
teardown_aws_stub

# Test 5: profile named 'dev' is NOT blocked by the profile check
setup_aws_stub "123456789012"
OUTPUT=$(AWS_PROFILE=dev bash "$SCRIPT" 2>&1 || true)
if echo "$OUTPUT" | grep -qi "BLOCKED"; then
    fail "Should NOT block AWS_PROFILE=dev"
else
    pass "Does not block AWS_PROFILE=dev"
fi
teardown_aws_stub

# Test 6: profile named 'default' is NOT blocked
setup_aws_stub "123456789012"
OUTPUT=$(AWS_PROFILE=default bash "$SCRIPT" 2>&1 || true)
if echo "$OUTPUT" | grep -qi "BLOCKED"; then
    fail "Should NOT block AWS_PROFILE=default"
else
    pass "Does not block AWS_PROFILE=default"
fi
teardown_aws_stub

# Test 7: known production account ID is blocked via PRODUCTION_ACCOUNT_IDS
setup_aws_stub "999999999999"
if AWS_PROFILE=dev PRODUCTION_ACCOUNT_IDS="999999999999" bash "$SCRIPT" > /dev/null 2>&1; then
    fail "Exits non-zero when account ID matches PRODUCTION_ACCOUNT_IDS"
else
    pass "Exits non-zero when account ID matches PRODUCTION_ACCOUNT_IDS"
fi
teardown_aws_stub

# Test 8: non-production account ID is NOT blocked by PRODUCTION_ACCOUNT_IDS
setup_aws_stub "123456789012"
OUTPUT=$(AWS_PROFILE=dev PRODUCTION_ACCOUNT_IDS="999999999999" bash "$SCRIPT" 2>&1 || true)
if echo "$OUTPUT" | grep -qi "BLOCKED"; then
    fail "Should NOT block account 123456789012 when PRODUCTION_ACCOUNT_IDS=999999999999"
else
    pass "Does not block non-production account ID"
fi
teardown_aws_stub

# Test 9: .env.dev-connect is cleaned up on exit (trap works)
setup_aws_stub "123456789012"
# Run with a profile that passes the check but fails before writing the env file
# (Secrets Manager call will fail with our stub). The env file should not exist after.
AWS_PROFILE=dev bash "$SCRIPT" > /dev/null 2>&1 || true
if [[ -f ".env.dev-connect" ]]; then
    fail ".env.dev-connect should be deleted on script exit"
    rm -f ".env.dev-connect"
else
    pass ".env.dev-connect is cleaned up on script exit"
fi
teardown_aws_stub

# ─── Summary ─────────────────────────────────────────────────────────────────
echo "────────────────────────────────────────────────────────────"
echo "Results: ${PASS} passed, ${FAIL} failed"
echo ""

if [[ $FAIL -gt 0 ]]; then
    exit 1
fi
exit 0
