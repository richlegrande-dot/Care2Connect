# Webhook Testing Guide for CareConnect V1.5

## 🎯 Overview

This guide shows you how to test Stripe webhooks to ensure donation confirmations work properly. Webhooks are essential for updating donation records when payments are completed.

## 🔧 Testing Methods

### Method 1: Stripe CLI (Recommended for Development)

The Stripe CLI is the easiest way to test webhooks during development.

#### Setup:

1. **Install Stripe CLI**: 
   - Download from [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
   - Or install via package manager:
     ```bash
     # macOS
     brew install stripe/stripe-cli/stripe
     
     # Windows  
     choco install stripe-cli
     
     # Linux - see Stripe docs for distribution-specific instructions
     ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```
   This opens your browser to authenticate with Stripe.

3. **Start Webhook Listener**:
   ```bash
   # Using CareConnect provided script (recommended)
   ./scripts/stripe-webhook-listen.sh
   
   # Or run directly
   stripe listen --forward-to localhost:3001/api/payments/stripe-webhook
   ```

4. **Copy Webhook Secret**:
   The CLI will output a webhook signing secret like:
   ```
   whsec_1234567890abcdef...
   ```
   Copy this and add it to your `.env` file:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
   ```

#### Triggering Test Events:

**Using CareConnect Script** (recommended):
```bash
# Interactive script with menu options
./scripts/stripe-test-events.sh
```

**Manual CLI Commands**:
```bash
# Trigger successful donation
stripe trigger checkout.session.completed \
  --override checkout.session.completed.data.object.metadata.clientSlug=test-client \
  --override checkout.session.completed.data.object.amount_total=2500

# Trigger failed payment  
stripe trigger payment_intent.payment_failed \
  --override payment_intent.payment_failed.data.object.metadata.clientSlug=test-client

# Trigger custom event
stripe trigger checkout.session.completed
```

### Method 2: Live Test Donations

Test webhooks with actual Stripe Checkout flow using test cards.

#### Setup:

1. **Ensure Servers are Running**:
   ```bash
   # Backend
   cd v1-backend && npm start
   
   # Frontend
   cd v1-frontend && npm run dev
   ```

2. **Configure Webhook in Stripe Dashboard**:
   - Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
   - Add endpoint: `http://localhost:3001/api/payments/stripe-webhook`
   - Select events: `checkout.session.completed`
   - Copy webhook secret to your `.env` file

#### Testing Process:

1. **Visit Donation Page**: 
   ```
   http://localhost:3000/donate/test-client
   ```

2. **Enter Test Amount**: 
   - Select preset amount (e.g., $25)
   - Or enter custom amount

3. **Use Test Card**:
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: Any future date (e.g., 12/25)
   CVC: Any 3 digits (e.g., 123)
   Name: Any name
   ```

4. **Complete Payment**:
   - Click "Donate with Card"
   - Fill out Stripe Checkout form
   - Submit payment

5. **Verify Success**:
   - Should redirect to success page
   - Check server logs for webhook event
   - Verify donation appears in admin dashboard

### Method 3: Stripe Dashboard Event Replay

Replay real events from your Stripe Dashboard.

#### Process:

1. **Go to Stripe Events**:
   - Visit [Stripe Dashboard > Developers > Events](https://dashboard.stripe.com/events)

2. **Find Event**:
   - Look for `checkout.session.completed` events
   - Click on an event to view details

3. **Send to Webhook**:
   - Click "Send to webhook endpoint" 
   - Enter your webhook URL: `http://localhost:3001/api/payments/stripe-webhook`
   - Click "Send"

4. **Check Results**:
   - Monitor server logs
   - Verify donation record update

## 🔍 What to Look For

### Successful Webhook Processing:

**Server Logs Should Show**:
```
✅ Stripe secret key configured
✅ Stripe webhook secret configured
✅ Checkout session completed: cs_1234567890
💰 Donation completed: $25.00 for test-client
```

**Admin Dashboard Should Show**:
- New donation record
- Status: "succeeded"  
- Correct amount and client
- Stripe payment ID populated
- Donor information (if provided)

**Database Should Contain**:
```javascript
{
  id: "unique-donation-id",
  clientSlug: "test-client", 
  amountCents: 2500,
  stripeSessionId: "cs_1234567890",
  stripePaymentId: "pi_1234567890", 
  status: "succeeded",
  donorEmail: "donor@example.com",
  donorName: "Test Donor",
  createdAt: "2025-12-04T..."
}
```

### Failed Webhook Processing:

**Common Error Messages**:
```
❌ Webhook signature verification failed
❌ Stripe webhook secret not configured
❌ Failed to process webhook event
❌ Database connection error
```

**Troubleshooting Steps**:
1. Check webhook secret is correct
2. Verify endpoint URL is accessible  
3. Check server logs for detailed errors
4. Test webhook secret with `stripe listen`
5. Verify database connection

## 🧪 Test Event Examples

### Successful Donation Event:

**Trigger**:
```bash
stripe trigger checkout.session.completed \
  --override checkout.session.completed.data.object.id=cs_test_123 \
  --override checkout.session.completed.data.object.payment_status=paid \
  --override checkout.session.completed.data.object.amount_total=5000 \
  --override checkout.session.completed.data.object.currency=usd \
  --override checkout.session.completed.data.object.metadata.clientSlug=john-doe \
  --override checkout.session.completed.data.object.customer_details.email=donor@example.com \
  --override checkout.session.completed.data.object.customer_details.name="Jane Smith"
```

**Expected Result**:
- Donation record created with $50.00 amount
- Client: john-doe
- Donor: Jane Smith (donor@example.com)
- Status: succeeded

### Failed Payment Event:

**Trigger**:
```bash
stripe trigger payment_intent.payment_failed \
  --override payment_intent.payment_failed.data.object.metadata.clientSlug=test-client \
  --override payment_intent.payment_failed.data.object.last_payment_error.decline_code=insufficient_funds
```

**Expected Result**:
- Server logs payment failure
- No donation record created (or status marked as failed)
- Appropriate error handling

## 📊 Webhook Testing Checklist

### Pre-Test Setup:
- [ ] Stripe CLI installed and authenticated
- [ ] Backend server running on port 3001
- [ ] Frontend server running on port 3000  
- [ ] Webhook secret configured in environment
- [ ] Database connection working

### Test Scenarios:
- [ ] Successful checkout session completion
- [ ] Payment with different amounts ($1, $25, $100, $1000)
- [ ] Payment with different client slugs
- [ ] Payment failure scenarios
- [ ] Duplicate webhook event handling
- [ ] Invalid webhook signature rejection

### Post-Test Verification:
- [ ] Donation records created correctly
- [ ] Admin dashboard shows new donations
- [ ] Email notifications sent (if configured)
- [ ] Stripe Dashboard shows webhook deliveries
- [ ] Server logs show no errors
- [ ] Database integrity maintained

## 🚨 Troubleshooting Common Issues

### Issue: Webhook Events Not Received

**Symptoms**:
- Donations complete but don't appear in dashboard
- No webhook logs in server output
- Stripe shows "failed" webhook deliveries

**Solutions**:
1. **Check Endpoint URL**:
   ```bash
   # Test if endpoint is reachable
   curl -X POST http://localhost:3001/api/payments/stripe-webhook
   ```

2. **Verify Firewall/Network**:
   - Ensure port 3001 is open
   - Check for proxy/load balancer issues
   - Test with ngrok for external access

3. **Check Webhook Configuration**:
   - Verify URL in Stripe Dashboard
   - Ensure correct events are selected
   - Check endpoint is enabled

### Issue: Signature Verification Fails

**Symptoms**:
- Error: "Webhook signature verification failed"
- Events received but not processed
- 400 status codes in Stripe webhook logs

**Solutions**:
1. **Check Webhook Secret**:
   ```bash
   echo $STRIPE_WEBHOOK_SECRET
   # Should start with whsec_
   ```

2. **Verify Raw Body Processing**:
   - Ensure webhook endpoint receives raw request body
   - Check for middleware that modifies body
   - Verify Content-Type header handling

3. **Test with Stripe CLI**:
   ```bash
   stripe listen --forward-to localhost:3001/api/payments/stripe-webhook
   # Copy the generated webhook secret
   ```

### Issue: Database Updates Not Working

**Symptoms**:
- Webhooks received and processed
- No errors in logs
- Donation records not created/updated

**Solutions**:
1. **Check Database Connection**:
   ```bash
   # Test health endpoint
   curl http://localhost:3001/health
   ```

2. **Verify Database Schema**:
   - Ensure donation table exists
   - Check required columns are present
   - Test manual database operations

3. **Check Processing Logic**:
   - Review webhook handler code
   - Verify clientSlug extraction
   - Check data transformation logic

## 📈 Monitoring Webhook Health

### Real-Time Monitoring:

**Server Logs**:
```bash
# Monitor webhook events in real-time
tail -f server.log | grep -i webhook
```

**Stripe Dashboard**:
- Go to [Developers > Webhooks](https://dashboard.stripe.com/webhooks)
- Click your endpoint to see delivery attempts
- Review failed deliveries and retry them

### Performance Metrics:

**Track These KPIs**:
- Webhook delivery success rate (should be >99%)
- Average processing time (<2 seconds)
- Failed webhook retry success rate
- Time between payment and database update

**Set Up Alerts For**:
- Webhook signature verification failures
- Database connection errors  
- Webhook processing timeouts
- Unusual event volumes

Remember: Webhooks are critical for donation tracking - monitor them closely and test regularly!