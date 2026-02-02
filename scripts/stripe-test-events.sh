#!/bin/bash
# Stripe Test Event Trigger for CareConnect
# This script triggers test Stripe events for webhook testing

echo "🧪 CareConnect Stripe Test Event Trigger"
echo "========================================"
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI not found! Please install it first."
    echo "📥 Download: https://stripe.com/docs/stripe-cli"
    exit 1
fi

echo "Available test events:"
echo "1. ✅ Successful checkout session"
echo "2. ❌ Failed payment"
echo "3. 🔄 Custom event"
echo ""

read -p "Select test event (1-3): " choice

case $choice in
    1)
        echo "🚀 Triggering successful checkout session..."
        stripe trigger checkout.session.completed \
            --override checkout.session.completed.data.object.metadata.clientSlug=test-client \
            --override checkout.session.completed.data.object.amount_total=2500 \
            --override checkout.session.completed.data.object.currency=usd
        ;;
    2)
        echo "🚀 Triggering failed payment..."
        stripe trigger payment_intent.payment_failed \
            --override payment_intent.payment_failed.data.object.metadata.clientSlug=test-client
        ;;
    3)
        echo "Available events:"
        echo "  • checkout.session.completed"
        echo "  • payment_intent.succeeded" 
        echo "  • payment_intent.payment_failed"
        echo "  • customer.created"
        echo ""
        read -p "Enter event name: " event_name
        echo "🚀 Triggering $event_name..."
        stripe trigger "$event_name"
        ;;
    *)
        echo "Invalid selection"
        exit 1
        ;;
esac

echo ""
echo "✅ Test event sent!"
echo "💡 Check your server logs and admin dashboard for the webhook processing."
echo "🔍 You can also view events in your Stripe Dashboard > Developers > Events"