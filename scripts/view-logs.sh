#!/bin/bash

# Script to view and filter application logs during local development
# Provides colored output and filtering options

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
FOLLOW=false
LEVEL=""
FILTER=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -l|--level)
            LEVEL="$2"
            shift 2
            ;;
        -g|--grep)
            FILTER="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -f, --follow          Follow log output (like tail -f)"
            echo "  -l, --level LEVEL     Filter by log level (debug|info|warn|error)"
            echo "  -g, --grep PATTERN    Filter logs containing pattern"
            echo "  -h, --help            Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # View all logs"
            echo "  $0 -f                 # Follow logs in real-time"
            echo "  $0 -l error           # Show only error logs"
            echo "  $0 -g registration    # Show logs containing 'registration'"
            echo "  $0 -f -l warn         # Follow warn and error logs"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

echo "📋 Application Logs"
echo "==================="
echo ""

if [ "$FOLLOW" = true ]; then
    echo "Following logs... (Press Ctrl+C to stop)"
    echo ""
fi

# Check if Next.js dev server is running
if ! pgrep -f "next dev" > /dev/null; then
    echo -e "${YELLOW}⚠️  Next.js dev server doesn't appear to be running${NC}"
    echo "Start it with: npm run dev"
    echo ""
fi

# Function to colorize log level
colorize_level() {
    local line="$1"
    
    if echo "$line" | grep -q "ERROR"; then
        echo -e "${RED}$line${NC}"
    elif echo "$line" | grep -q "WARN"; then
        echo -e "${YELLOW}$line${NC}"
    elif echo "$line" | grep -q "INFO"; then
        echo -e "${GREEN}$line${NC}"
    elif echo "$line" | grep -q "DEBUG"; then
        echo -e "${CYAN}$line${NC}"
    else
        echo "$line"
    fi
}

# Function to filter by level
filter_level() {
    if [ -z "$LEVEL" ]; then
        cat
    else
        case "$LEVEL" in
            debug)
                grep -E "(DEBUG|INFO|WARN|ERROR)"
                ;;
            info)
                grep -E "(INFO|WARN|ERROR)"
                ;;
            warn)
                grep -E "(WARN|ERROR)"
                ;;
            error)
                grep "ERROR"
                ;;
            *)
                echo "Invalid log level: $LEVEL"
                exit 1
                ;;
        esac
    fi
}

# Function to filter by pattern
filter_pattern() {
    if [ -z "$FILTER" ]; then
        cat
    else
        grep -i "$FILTER"
    fi
}

# Main log viewing logic
if [ "$FOLLOW" = true ]; then
    # Follow mode - watch the terminal output
    # This is a simplified version - in production you'd tail actual log files
    echo "Note: This follows the terminal output. For production, use CloudWatch Logs."
    echo ""
    
    # In development, Next.js logs go to stdout
    # We can't easily tail them, so we'll just show a message
    echo "To view logs in real-time:"
    echo "1. Keep your terminal with 'npm run dev' visible"
    echo "2. Or check the browser console for client-side logs"
    echo "3. Or use: docker-compose logs -f (if using Docker)"
    echo ""
    echo "For production logs, use:"
    echo "  aws logs tail /ecs/development-college-athlete-base --follow"
    
else
    # Static mode - show recent logs
    echo "Recent application logs:"
    echo ""
    echo "Note: In development, logs appear in the terminal running 'npm run dev'"
    echo ""
    echo "To view Docker logs (if using local database):"
    echo "  docker-compose logs postgres"
    echo ""
    echo "To view Next.js logs:"
    echo "  Check the terminal where you ran 'npm run dev'"
    echo ""
    echo "For production AWS logs:"
    echo "  aws logs tail /ecs/development-college-athlete-base --since 1h"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Log Levels:"
echo -e "  ${CYAN}DEBUG${NC}  - Detailed information for debugging"
echo -e "  ${GREEN}INFO${NC}   - General informational messages"
echo -e "  ${YELLOW}WARN${NC}   - Warning messages"
echo -e "  ${RED}ERROR${NC}  - Error messages"
echo ""
echo "Common Log Patterns:"
echo "  - API Request/Response"
echo "  - Database operations"
echo "  - Validation errors"
echo "  - Security events"
echo ""
