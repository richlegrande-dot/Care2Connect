# Stripe Key Setup Guide for CareConnect V1.5

## 🎯 Overview

This guide walks you through obtaining your Stripe API keys and webhook secrets directly from your Stripe Dashboard. CareConnect provides admin tools to help you configure these keys securely.

## 📋 Prerequisites

- A Stripe account (free to create)
- Admin access to your CareConnect installation
- Access to update environment variables (for production deployments)

## 🏦 Step 1: Create/Access Your Stripe Account

### For New Users:

1. **Visit Stripe**: Go to [https://stripe.com](https://stripe.com)
2. **Click "Start now"** or **"Sign up"**
3. **Complete registration**:
   - Email address and password
   - Business/personal information
   - Phone verification
4. **Activate your account**: Follow email verification steps

### For Existing Users:

1. **Login**: Visit [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. **Select the correct account** if you have multiple

## 🔑 Step 2: Get Your API Keys from Stripe Dashboard

### Navigate to API Keys:

1. **Open Stripe Dashboard**: [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. **Switch to Test Mode**: Toggle in the top-left corner (for development)
3. **Go to API Keys**: Click `Developers` → `API Keys` in left sidebar

### Copy Your Keys:

#### Publishable Key:
- **Location**: "Publishable key" section
- **Format**: Starts with `pk_test_...` (test) or `pk_live_...` (live)
- **Safety**: Safe to expose in client-side code
- **Copy**: Click the key to select all, then copy

#### Secret Key:
- **Location**: "Secret key" section  
- **Format**: Starts with `sk_test_...` (test) or `sk_live_...` (live)
- **Safety**: ⚠️ **Never expose publicly** - server-side only
- **Copy**: Click "Reveal live key" button, then copy the full key

### Screenshots Guide:

```
Stripe Dashboard → Developers → API Keys

┌─────────────────────────────────────────┐
│ Publishable key                         │
│ pk_test_51Abc123...                     │ ← Copy this
│ [Copy] button                           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Secret key                              │
│ [Reveal live key] ← Click this first    │
│ sk_test_51Xyz789...                     │ ← Then copy this
└─────────────────────────────────────────┘
```

## 🪝 Step 3: Create Webhook Endpoint

### Why Webhooks Are Needed:

Webhooks allow Stripe to notify CareConnect when payments are completed, so donation records can be updated automatically.

### Create Webhook in Stripe:

1. **Go to Webhooks**: In Stripe Dashboard, click `Developers` → `Webhooks`
2. **Add Endpoint**: Click `+ Add endpoint` button
3. **Enter Endpoint URL**:
   - **Development**: `http://localhost:3001/api/payments/stripe-webhook`
   - **Production**: `https://yourdomain.com/api/payments/stripe-webhook`
4. **Select Events**: Choose these events to listen for:
   - ✅ `checkout.session.completed` **(Required)**
   - `payment_intent.succeeded` (Optional)
   - `payment_intent.payment_failed` (Optional)
5. **Add Endpoint**: Click `Add endpoint` to create

### Get Webhook Secret:

1. **Click your endpoint** in the webhooks list
2. **Find "Signing secret"** section
3. **Click "Reveal"** to show the secret
4. **Copy the secret**: Starts with `whsec_...`

## ⚙️ Step 4: Configure Keys in CareConnect

### Using the Admin Interface (Recommended):

1. **Access Admin Panel**: Go to `/admin/payments/configure` in your CareConnect installation
2. **Enter Keys**:
   - Paste **Publishable Key** in first field
   - Paste **Secret Key** in second field  
   - Paste **Webhook Secret** in third field (optional initially)
3. **Test Connection**: Click "Test Connection" to verify keys work
4. **Save Keys**: Click "Save Keys" to store configuration

### Manual Environment Configuration:

If you prefer to set environment variables directly:

#### Development (.env file):
```bash
# Add these to your .env file
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here  
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Other required variables
APP_DOMAIN=http://localhost:3000
NODE_ENV=development
PORT=3001
```

#### Production (Platform Environment Variables):
```bash
# Add these to your hosting platform's environment settings
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
APP_DOMAIN=https://yourdomain.com
NODE_ENV=production
```

## 🧪 Step 5: Test Your Configuration

### Method 1: Admin Interface Test

1. **Go to**: `/admin/payments/configure`
2. **Check Status**: Should show "Fully Configured ✓"
3. **Test Donation**: Visit `/donate/test-client`
4. **Make Test Payment**: Use card `4242 4242 4242 4242`

### Method 2: Stripe CLI Testing (Development)

1. **Install Stripe CLI**: [Download here](https://stripe.com/docs/stripe-cli)
2. **Login**: Run `stripe login`
3. **Listen for Events**: 
   ```bash
   # Use provided script
   ./scripts/stripe-webhook-listen.sh
   
   # Or run directly
   stripe listen --forward-to localhost:3001/api/payments/stripe-webhook
   ```
4. **Trigger Test Event**:
   ```bash
   # Use provided script
   ./scripts/stripe-test-events.sh
   
   # Or run directly  
   stripe trigger checkout.session.completed
   ```

### Method 3: Live Test Transaction

1. **Start Servers**: Backend and frontend running
2. **Visit Donation Page**: `/donate/test-client`  
3. **Enter Amount**: Select or enter donation amount
4. **Use Test Card**: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any billing details
5. **Complete Payment**: Should redirect to success page
6. **Verify Webhook**: Check server logs for webhook confirmation

## 🔒 Security Best Practices

### Key Management:

- ✅ **Use test keys** for development
- ✅ **Use live keys** only in production
- ❌ **Never commit keys** to version control
- ❌ **Never expose secret keys** in client-side code
- ✅ **Store keys** in environment variables
- ✅ **Rotate keys** periodically

### Environment Separation:

| Environment | Key Type | Webhook URL |
|-------------|----------|-------------|
| Development | `pk_test_...`, `sk_test_...` | `http://localhost:3001/...` |
| Staging | `pk_test_...`, `sk_test_...` | `https://staging.yourdomain.com/...` |
| Production | `pk_live_...`, `sk_live_...` | `https://yourdomain.com/...` |

### Webhook Security:

- ✅ **Always verify** webhook signatures (CareConnect does this automatically)
- ✅ **Use HTTPS** in production
- ✅ **Keep webhook secrets private**
- ✅ **Monitor webhook delivery** in Stripe Dashboard

## 🚀 Going Live (Production)

### Before Switching to Live Keys:

1. **Complete Stripe Account Setup**:
   - Add business bank account
   - Complete identity verification
   - Provide business information
   - Accept terms of service

2. **Test Thoroughly**: 
   - All donation flows work with test keys
   - Webhooks are receiving events
   - Admin dashboard shows donations
   - Email confirmations work

3. **Update Environment**:
   - Switch to live keys (`pk_live_...`, `sk_live_...`)
   - Update webhook URL to production domain
   - Ensure HTTPS is configured
   - Update `APP_DOMAIN` to production URL

### Production Checklist:

- [ ] Live Stripe keys configured
- [ ] Webhook endpoint uses HTTPS
- [ ] Webhook events are being received  
- [ ] Test live donation with real card (small amount)
- [ ] Donation appears in admin dashboard
- [ ] Bank account configured for payouts
- [ ] SSL certificate installed and valid
- [ ] Environment variables secured
- [ ] Monitoring and logging configured

## 🔧 Troubleshooting

### Common Issues:

**"Invalid API key" error**:
- Check key format (starts with correct prefix)
- Ensure no extra spaces or characters
- Verify you're using the right environment (test vs live)
- Check if key was regenerated in Stripe Dashboard

**"Webhook signature verification failed"**:
- Verify webhook secret is correct
- Check webhook URL is accessible
- Ensure webhook endpoint uses raw request body
- Check for proxy/load balancer modifications

**Donations not appearing in dashboard**:
- Check webhook events in Stripe Dashboard
- Verify webhook endpoint is receiving events
- Check server logs for webhook processing errors
- Ensure database connection is working

**Payment processing fails**:
- Check Stripe account status
- Verify business information is complete
- Check for account restrictions
- Review payment method compatibility

### Debug Commands:

```bash
# Check environment variables
echo $STRIPE_SECRET_KEY
echo $STRIPE_WEBHOOK_SECRET

# Test server health
curl http://localhost:3001/health

# Check webhook endpoint
curl -X POST http://localhost:3001/api/payments/stripe-webhook

# View Stripe CLI events
stripe logs tail
```

### Getting Help:

- **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: Available in Stripe Dashboard
- **CareConnect Admin Interface**: Built-in status monitoring
- **Server Logs**: Check for detailed error messages

## 📞 Support Resources

### Official Stripe Resources:
- [API Documentation](https://stripe.com/docs/api)
- [Webhook Documentation](https://stripe.com/docs/webhooks)
- [Test Cards](https://stripe.com/docs/testing#cards)
- [Stripe CLI Guide](https://stripe.com/docs/stripe-cli)

### CareConnect Resources:
- Admin Configuration Panel: `/admin/payments/configure`
- Webhook Setup Wizard: `/admin/payments/webhook-setup`
- System Health Check: `/health`
- Donation Dashboard: `/admin/donations`

Remember: Start with test mode, verify everything works, then switch to live mode for real donations!