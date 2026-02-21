#!/bin/bash
# Stripe Webhook Listener for CareConnect Development
# This script uses the Stripe CLI to forward webhook events to your local server

echo "🎯 CareConnect Stripe Webhook Listener"
echo "======================================="
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI not found!"
    echo ""
    echo "Please install Stripe CLI first:"
    echo "📥 Download: https://stripe.com/docs/stripe-cli"
    echo ""
    echo "Or install via package manager:"
    echo "  macOS: brew install stripe/stripe-cli/stripe"
    echo "  Windows: choco install stripe-cli"
    echo "  Linux: See https://stripe.com/docs/stripe-cli#install"
    echo ""
    exit 1
fi

# Check if user is logged in
if ! stripe config --list &> /dev/null; then
    echo "🔐 Please login to Stripe CLI first:"
    echo "   stripe login"
    echo ""
    exit 1
fi

echo "✅ Stripe CLI is ready!"
echo ""

# Set the webhook endpoint URL
WEBHOOK_URL="http://localhost:3001/api/payments/stripe-webhook"

echo "🚀 Starting webhook listener..."
echo "📡 Forwarding Stripe events to: $WEBHOOK_URL"
echo ""
echo "💡 This will:"
echo "   • Forward live Stripe events to your local server"
echo "   • Generate a webhook signing secret for development"
echo "   • Allow you to test webhooks without deploying"
echo ""
echo "🔑 Copy the webhook signing secret (whsec_...) that appears below"
echo "   and add it to your .env file as STRIPE_WEBHOOK_SECRET"
echo ""
echo "▶️  Starting listener (Press Ctrl+C to stop)..."
echo "================================================="
echo ""

# Start the Stripe CLI listener
stripe listen --forward-to "$WEBHOOK_URL"