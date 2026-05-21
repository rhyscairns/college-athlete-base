#!/bin/bash
# scripts/dev-connect.sh
#
# Connects your local Next.js app to the shared development cloud environment.
# Fetches credentials from AWS Secrets Manager and Lambda URLs from CloudFormation,
# writes a temporary .env.dev-connect file, starts Next.js, then cleans up on exit.
#
# Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
#
# Usage:
#   AWS_PROFILE=dev ./scripts/dev-connect.sh
#   npm run dev:connect

set -euo pipefail

# ─── Colour helpers ──────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

info()    { echo -e "${BLUE}[dev-connect]${NC} $*"; }
success() { echo -e "${GREEN}[dev-connect]${NC} $*"; }
warn()    { echo -e "${YELLOW}[dev-connect]${NC} $*"; }
error()   { echo -e "${RED}[dev-connect]${NC} $*" >&2; }

# ─── Constants ───────────────────────────────────────────────────────────────
ENV_FILE=".env.dev-connect"
DEV_STACK_NAME="DevStack"
ENV_PREFIX="development"

# Known production account IDs — connecting to these is blocked.
# Add your production AWS account ID here.
PRODUCTION_ACCOUNT_IDS="${PRODUCTION_ACCOUNT_IDS:-}"

# ─── Cleanup ─────────────────────────────────────────────────────────────────
cleanup() {
    echo ""
    info "Session ended — cleaning up..."
    if [[ -f "$ENV_FILE" ]]; then
        rm -f "$ENV_FILE"
        success "Deleted $ENV_FILE"
    fi
    info "Local environment restored. Run 'npm run dev' to start locally."
}

# Trap EXIT so cleanup always runs, even on error or Ctrl-C
trap cleanup EXIT

# ─── Preflight checks ────────────────────────────────────────────────────────
check_dependencies() {
    local missing=()
    for cmd in aws jq; do
        if ! command -v "$cmd" &>/dev/null; then
            missing+=("$cmd")
        fi
    done

    if [[ ${#missing[@]} -gt 0 ]]; then
        error "Missing required tools: ${missing[*]}"
        error "  aws:  https://aws.amazon.com/cli/"
        error "  jq:   brew install jq  (macOS)"
        exit 1
    fi
}

check_aws_credentials() {
    info "Verifying AWS credentials..."
    if ! CALLER_IDENTITY=$(aws sts get-caller-identity --output json 2>/dev/null); then
        error "AWS credentials not configured or invalid."
        error "Run: aws configure  (or set AWS_PROFILE)"
        exit 1
    fi

    ACCOUNT_ID=$(echo "$CALLER_IDENTITY" | jq -r '.Account')
    CALLER_ARN=$(echo "$CALLER_IDENTITY" | jq -r '.Arn')
    success "Authenticated as: $CALLER_ARN (account: $ACCOUNT_ID)"
}

# Requirement 7.2 — block production account access
block_production_access() {
    # Check explicit list of known production account IDs
    if [[ -n "$PRODUCTION_ACCOUNT_IDS" ]]; then
        for prod_account in $PRODUCTION_ACCOUNT_IDS; do
            if [[ "$ACCOUNT_ID" == "$prod_account" ]]; then
                error "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                error "  BLOCKED: Current AWS account ($ACCOUNT_ID) is a"
                error "  known production account. This script only connects"
                error "  to the development environment."
                error "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                exit 1
            fi
        done
    fi

    # Check AWS_PROFILE name — block any profile that contains 'prod'
    local profile="${AWS_PROFILE:-default}"
    if echo "$profile" | grep -qi "prod"; then
        error "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        error "  BLOCKED: AWS_PROFILE '$profile' looks like a production"
        error "  profile. This script only connects to the development"
        error "  environment. Use a dev-scoped AWS profile."
        error "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        exit 1
    fi

    # Check if the CloudFormation stack we're about to query is the prod stack
    # by verifying the stack name doesn't contain 'prod'
    if echo "$DEV_STACK_NAME" | grep -qi "prod"; then
        error "DEV_STACK_NAME '$DEV_STACK_NAME' appears to reference a production stack. Aborting."
        exit 1
    fi
}

# ─── Secrets Manager helpers ─────────────────────────────────────────────────
fetch_secret() {
    local secret_id="$1"
    local value
    if ! value=$(aws secretsmanager get-secret-value \
        --secret-id "$secret_id" \
        --query SecretString \
        --output text 2>/dev/null); then
        error "Failed to fetch secret: $secret_id"
        error "Ensure the development environment is deployed and you have the correct IAM permissions."
        exit 1
    fi
    echo "$value"
}

# ─── CloudFormation stack output helper ──────────────────────────────────────
fetch_stack_output() {
    local stack_name="$1"
    local output_key="$2"
    local value
    value=$(aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --query "Stacks[0].Outputs[?OutputKey=='$output_key'].OutputValue" \
        --output text 2>/dev/null)

    if [[ -z "$value" || "$value" == "None" ]]; then
        error "Stack output '$output_key' not found in stack '$stack_name'."
        error "Ensure the development environment is deployed: cd infrastructure && npm run deploy:dev"
        exit 1
    fi
    echo "$value"
}

# ─── Warning banner ──────────────────────────────────────────────────────────
print_warning_banner() {
    echo ""
    echo -e "${YELLOW}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}${BOLD}  ⚠️   WARNING: CONNECTED TO SHARED DEVELOPMENT DATABASE  ⚠️${NC}"
    echo -e "${YELLOW}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  Any data you write will be visible to ALL developers.${NC}"
    echo -e "${YELLOW}  Do NOT run migrations or seed scripts against this database.${NC}"
    echo -e "${YELLOW}  Press Ctrl-C to disconnect and restore your local environment.${NC}"
    echo -e "${YELLOW}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# ─── Main ────────────────────────────────────────────────────────────────────
main() {
    info "Starting dev-connect session..."
    echo ""

    check_dependencies
    check_aws_credentials
    block_production_access

    # ── Fetch DB credentials ──────────────────────────────────────────────────
    info "Fetching database credentials from Secrets Manager..."
    DB_SECRET=$(fetch_secret "${ENV_PREFIX}/college-athlete-base/db-credentials")
    DB_HOST=$(echo "$DB_SECRET" | jq -r '.host')
    DB_PORT=$(echo "$DB_SECRET" | jq -r '.port // "5432"')
    DB_NAME=$(echo "$DB_SECRET" | jq -r '.database // "college_athlete_base"')
    DB_USER=$(echo "$DB_SECRET" | jq -r '.username')
    DB_PASS=$(echo "$DB_SECRET" | jq -r '.password')
    success "Database credentials retrieved"

    # ── Fetch JWT secret ──────────────────────────────────────────────────────
    info "Fetching JWT secret from Secrets Manager..."
    JWT_SECRET_JSON=$(fetch_secret "${ENV_PREFIX}/college-athlete-base/jwt-secret")
    JWT_SECRET_VALUE=$(echo "$JWT_SECRET_JSON" | jq -r '.secret')
    success "JWT secret retrieved"

    # ── Fetch Stripe keys ─────────────────────────────────────────────────────
    info "Fetching Stripe keys from Secrets Manager..."
    STRIPE_SECRET_JSON=$(fetch_secret "${ENV_PREFIX}/college-athlete-base/stripe-keys")
    STRIPE_PUBLISHABLE_KEY=$(echo "$STRIPE_SECRET_JSON" | jq -r '.publishable_key')
    STRIPE_SECRET_KEY=$(echo "$STRIPE_SECRET_JSON" | jq -r '.secret_key')
    STRIPE_WEBHOOK_SECRET=$(echo "$STRIPE_SECRET_JSON" | jq -r '.webhook_secret')
    STRIPE_MONTHLY_PRICE_ID=$(echo "$STRIPE_SECRET_JSON" | jq -r '.monthly_price_id')
    STRIPE_ANNUAL_PRICE_ID=$(echo "$STRIPE_SECRET_JSON" | jq -r '.annual_price_id')
    success "Stripe keys retrieved"

    # ── Fetch Lambda URLs from CloudFormation stack outputs ───────────────────
    info "Fetching Lambda URLs from CloudFormation stack '$DEV_STACK_NAME'..."
    AUTH_LAMBDA_URL=$(fetch_stack_output "$DEV_STACK_NAME" "AuthLambdaUrl")
    PAYMENT_LAMBDA_URL=$(fetch_stack_output "$DEV_STACK_NAME" "PaymentLambdaUrl")
    success "Lambda URLs retrieved"

    # ── Fetch Redis endpoint ──────────────────────────────────────────────────
    info "Fetching Redis endpoint from CloudFormation stack..."
    REDIS_ENDPOINT=$(fetch_stack_output "$DEV_STACK_NAME" "RedisEndpoint")
    REDIS_URL="redis://${REDIS_ENDPOINT}"
    success "Redis endpoint retrieved"

    # ── Write .env.dev-connect ────────────────────────────────────────────────
    info "Writing $ENV_FILE..."
    cat > "$ENV_FILE" <<EOF
# AUTO-GENERATED by scripts/dev-connect.sh — DO NOT COMMIT
# This file is deleted automatically when the dev-connect session ends.
# Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

# ============================================
# RUNTIME ENVIRONMENT
# ============================================
RUNTIME_ENV=development

# ============================================
# DATABASE (dev RDS — fetched from Secrets Manager)
# ============================================
DATABASE_HOST=${DB_HOST}
DATABASE_PORT=${DB_PORT}
DATABASE_NAME=${DB_NAME}
DATABASE_USER=${DB_USER}
DATABASE_PASSWORD=${DB_PASS}
DATABASE_SSL=true

# ============================================
# REDIS (dev ElastiCache)
# ============================================
REDIS_URL=${REDIS_URL}

# ============================================
# AUTHENTICATION
# ============================================
JWT_SECRET=${JWT_SECRET_VALUE}
JWT_EXPIRATION=7d
BCRYPT_ROUNDS=10

# ============================================
# LAMBDA URLS
# ============================================
AUTH_LAMBDA_URL=${AUTH_LAMBDA_URL}
PAYMENT_LAMBDA_URL=${PAYMENT_LAMBDA_URL}

# ============================================
# STRIPE (test mode keys)
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
STRIPE_MONTHLY_PRICE_ID=${STRIPE_MONTHLY_PRICE_ID}
STRIPE_ANNUAL_PRICE_ID=${STRIPE_ANNUAL_PRICE_ID}

# ============================================
# NEXT.JS
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
LOG_LEVEL=debug
EOF
    success "$ENV_FILE written"

    print_warning_banner

    # ── Start Next.js with dev-connect env vars ───────────────────────────────
    info "Starting Next.js with RUNTIME_ENV=development..."
    info "Server will be available at http://localhost:3000"
    echo ""

    # Load the generated env file and start Next.js.
    # 'set -a' exports all variables defined in the sourced file.
    set -a
    # shellcheck source=/dev/null
    source "$ENV_FILE"
    set +a

    npm run dev
}

main "$@"
