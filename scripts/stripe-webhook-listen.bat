@echo off
REM Stripe Webhook Listener for CareConnect Development (Windows)
REM This script uses the Stripe CLI to forward webhook events to your local server

echo 🎯 CareConnect Stripe Webhook Listener
echo =======================================
echo.

REM Check if Stripe CLI is installed
where stripe >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Stripe CLI not found!
    echo.
    echo Please install Stripe CLI first:
    echo 📥 Download: https://stripe.com/docs/stripe-cli
    echo.
    echo Or install via package manager:
    echo   Windows: choco install stripe-cli
    echo   Or download from: https://github.com/stripe/stripe-cli/releases
    echo.
    pause
    exit /b 1
)

REM Check if user is logged in
stripe config --list >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 🔐 Please login to Stripe CLI first:
    echo    stripe login
    echo.
    pause
    exit /b 1
)

echo ✅ Stripe CLI is ready!
echo.

REM Set the webhook endpoint URL
set WEBHOOK_URL=http://localhost:3001/api/payments/stripe-webhook

echo 🚀 Starting webhook listener...
echo 📡 Forwarding Stripe events to: %WEBHOOK_URL%
echo.
echo 💡 This will:
echo    • Forward live Stripe events to your local server
echo    • Generate a webhook signing secret for development
echo    • Allow you to test webhooks without deploying
echo.
echo 🔑 Copy the webhook signing secret (whsec_...) that appears below
echo    and add it to your .env file as STRIPE_WEBHOOK_SECRET
echo.
echo ▶️  Starting listener (Press Ctrl+C to stop)...
echo =================================================
echo.

REM Start the Stripe CLI listener
stripe listen --forward-to %WEBHOOK_URL%