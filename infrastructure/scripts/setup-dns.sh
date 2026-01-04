#!/bin/bash

# Script to create Route53 hosted zones for both environments
# This script creates hosted zones and outputs the nameservers

set -e

echo "🌐 Setting up DNS Hosted Zones for College Athlete Base"
echo "========================================================"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq is not installed. Please install it first (brew install jq)."
    exit 1
fi

# Create Development Hosted Zone
echo "📝 Creating hosted zone for collegeathletebase-dev.com..."
DEV_ZONE_OUTPUT=$(aws route53 create-hosted-zone \
    --name collegeathletebase-dev.com \
    --caller-reference "dev-$(date +%s)" \
    --hosted-zone-config Comment="Development environment for College Athlete Base")

DEV_ZONE_ID=$(echo $DEV_ZONE_OUTPUT | jq -r '.HostedZone.Id' | cut -d'/' -f3)
echo "✅ Development hosted zone created: $DEV_ZONE_ID"
echo ""

echo "📋 Development Nameservers:"
echo "============================"
echo $DEV_ZONE_OUTPUT | jq -r '.DelegationSet.NameServers[]'
echo ""

# Create Production Hosted Zone
echo "📝 Creating hosted zone for collegeathletebase.com..."
PROD_ZONE_OUTPUT=$(aws route53 create-hosted-zone \
    --name collegeathletebase.com \
    --caller-reference "prod-$(date +%s)" \
    --hosted-zone-config Comment="Production environment for College Athlete Base")

PROD_ZONE_ID=$(echo $PROD_ZONE_OUTPUT | jq -r '.HostedZone.Id' | cut -d'/' -f3)
echo "✅ Production hosted zone created: $PROD_ZONE_ID"
echo ""

echo "📋 Production Nameservers:"
echo "==========================="
echo $PROD_ZONE_OUTPUT | jq -r '.DelegationSet.NameServers[]'
echo ""

echo "📝 Next Steps:"
echo "=============="
echo "1. Update your domain registrar with the nameservers shown above"
echo "   - For collegeathletebase-dev.com, use the development nameservers"
echo "   - For collegeathletebase.com, use the production nameservers"
echo ""
echo "2. Wait for DNS propagation (usually 24-48 hours)"
echo ""
echo "3. Update your .env file with these hosted zone IDs:"
echo ""
echo "   DEV_HOSTED_ZONE_ID=$DEV_ZONE_ID"
echo "   PROD_HOSTED_ZONE_ID=$PROD_ZONE_ID"
echo ""
echo "4. Verify DNS propagation with:"
echo "   dig NS collegeathletebase-dev.com"
echo "   dig NS collegeathletebase.com"
echo ""
