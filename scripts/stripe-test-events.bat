@echo off
REM Stripe Test Event Trigger for CareConnect (Windows)
REM This script triggers test Stripe events for webhook testing

echo 🧪 CareConnect Stripe Test Event Trigger
echo ========================================
echo.

REM Check if Stripe CLI is installed
where stripe >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Stripe CLI not found! Please install it first.
    echo 📥 Download: https://stripe.com/docs/stripe-cli
    pause
    exit /b 1
)

echo Available test events:
echo 1. ✅ Successful checkout session
echo 2. ❌ Failed payment
echo 3. 🔄 Custom event
echo.

set /p choice="Select test event (1-3): "

if "%choice%"=="1" (
    echo 🚀 Triggering successful checkout session...
    stripe trigger checkout.session.completed --override checkout.session.completed.data.object.metadata.clientSlug=test-client --override checkout.session.completed.data.object.amount_total=2500 --override checkout.session.completed.data.object.currency=usd
) else if "%choice%"=="2" (
    echo 🚀 Triggering failed payment...
    stripe trigger payment_intent.payment_failed --override payment_intent.payment_failed.data.object.metadata.clientSlug=test-client
) else if "%choice%"=="3" (
    echo Available events:
    echo   • checkout.session.completed
    echo   • payment_intent.succeeded
    echo   • payment_intent.payment_failed
    echo   • customer.created
    echo.
    set /p event_name="Enter event name: "
    echo 🚀 Triggering %event_name%...
    stripe trigger "%event_name%"
) else (
    echo Invalid selection
    pause
    exit /b 1
)

echo.
echo ✅ Test event sent!
echo 💡 Check your server logs and admin dashboard for the webhook processing.
echo 🔍 You can also view events in your Stripe Dashboard ^> Developers ^> Events
pause