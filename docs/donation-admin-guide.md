# Donation Admin Guide for CareConnect V1.5

## 👥 Overview

The CareConnect Admin Dashboard provides caseworkers and administrators with comprehensive tools to monitor donations, track client progress, and manage the donation system.

## 🚀 Accessing the Admin Dashboard

**URL**: `http://localhost:3000/admin/donations` (development)  
**URL**: `https://yourdomain.com/admin/donations` (production)

> **Note**: In V1.5, the admin dashboard uses mock data for demonstration. In production deployments, this will connect to your real database.

## 📊 Dashboard Features

### Donation Statistics

The top of the dashboard displays key metrics:

- **Total Raised**: Sum of all successful donations
- **Total Donations**: Number of completed donation transactions
- **Average Donation**: Mean donation amount across all transactions
- **Active Clients**: Number of clients with donation pages

### Donation Management Table

View and manage all donations with these columns:

| Column | Description |
|--------|-------------|
| **Client** | Name/slug of the person receiving donations |
| **Amount** | Donation amount in USD |
| **Donor** | Name and email of the person who donated |
| **Status** | Payment status (pending, succeeded, failed) |
| **Date** | When the donation was made |
| **Payment ID** | Stripe payment ID for reconciliation |

### Filtering & Search

**Filter by Status**:
- All donations
- Succeeded only
- Pending only
- Failed only

**Search by Client**: Find donations for specific individuals

**Date Range**: Filter donations by time period (future enhancement)

## 📈 Understanding Donation Statuses

### Status Types

**✅ Succeeded**:
- Payment completed successfully
- Funds will be deposited to your account
- Donor was charged
- Email confirmation sent

**⏳ Pending**:
- Payment initiated but not completed
- Waiting for webhook confirmation
- May indicate webhook configuration issues
- Check Stripe Dashboard for details

**❌ Failed**:
- Payment was declined or failed
- Donor was not charged
- Common causes: insufficient funds, declined card
- Donor may retry with different payment method

### Troubleshooting Status Issues

**Too Many Pending Donations**:
- Check webhook configuration in Stripe Dashboard
- Verify `STRIPE_WEBHOOK_SECRET` is correctly set
- Ensure webhook endpoint is accessible
- Check server logs for webhook errors

**Missing Recent Donations**:
- Check Stripe Dashboard for successful payments
- Verify webhook events are being delivered
- Check for server downtime during donation period
- Review webhook delivery logs in Stripe

## 💰 Payment Reconciliation

### Matching CareConnect to Stripe

Each donation record includes:
- **Stripe Session ID**: Links to checkout session in Stripe
- **Payment Intent ID**: Links to actual payment in Stripe
- **Timestamp**: When donation was initiated

### Reconciliation Process

1. **Export CareConnect Data**: Copy donation table data
2. **Download Stripe Report**: Get payments report from Stripe Dashboard
3. **Match Records**: Use Payment Intent IDs to match transactions
4. **Identify Discrepancies**: Look for unmatched records
5. **Resolve Issues**: Check webhook delivery for missing records

### Monthly Reconciliation Checklist

- [ ] Download Stripe payments report
- [ ] Export CareConnect donation data
- [ ] Match all succeeded donations with Stripe payments
- [ ] Investigate any unmatched Stripe payments
- [ ] Review failed donations and reasons
- [ ] Calculate total fees paid to Stripe
- [ ] Verify bank deposits match expected amounts

## 📧 Donor Communication

### Information Available

From completed donations, you have access to:
- Donor name (if provided)
- Donor email address
- Donation amount and date
- Client/recipient information

### Communication Best Practices

**Thank You Messages**:
- Send within 24 hours of donation
- Include specific amount and recipient
- Mention tax deductibility (if applicable)
- Provide organization contact information

**Impact Updates**:
- Share how donations are being used
- Provide updates on client progress
- Include photos or stories (with permission)
- Send quarterly impact reports

**Privacy Considerations**:
- Never share donor information with recipients
- Respect donor anonymity preferences
- Follow data protection regulations
- Secure storage of donor data

## 🔄 Client Management

### Adding New Clients

While V1.5 uses a simple file-based system:

1. **Create Client Page**: Add entry to client directory
2. **Generate QR Code**: Use QR generator tool
3. **Test Donation Flow**: Verify page works correctly
4. **Share QR Code**: Distribute to caseworkers and client

### Client Information Updates

**Updating Client Stories**:
- Edit client information in system
- Update donation page content
- Regenerate QR codes if URLs change
- Notify caseworkers of updates

**Donation Goal Tracking**:
- Monitor progress toward client goals
- Update goal amounts as needed
- Celebrate milestones with donors
- Close campaigns when goals are met

## 🛡️ Security & Privacy

### Data Protection

**Sensitive Information**:
- Never store full card numbers
- Protect donor email addresses
- Secure donation records
- Regular data backups

**Access Controls**:
- Limit admin dashboard access
- Use secure passwords
- Regular access reviews
- Audit trail for sensitive actions

### Compliance Requirements

**Financial Regulations**:
- Keep records for required periods
- Report large donations if required
- Maintain donation receipts
- Follow tax reporting requirements

**Privacy Regulations**:
- GDPR compliance for EU donors
- Data retention policies
- Donor consent management
- Right to data deletion

## 📞 Support & Troubleshooting

### Common Issues

**Donation Not Showing in Dashboard**:
1. Check Stripe Dashboard for payment
2. Verify webhook configuration
3. Check server logs for errors
4. Manually sync if needed

**Wrong Donation Amount**:
1. Verify in Stripe Dashboard
2. Check for currency conversion issues
3. Review donation form for bugs
4. Contact donor to confirm intended amount

**Duplicate Donations**:
1. Check for double-charging in Stripe
2. Review webhook delivery logs
3. Identify source of duplication
4. Refund duplicate charges if needed

### Getting Help

**Technical Support**:
- Check server logs first
- Review Stripe Dashboard
- Test webhook delivery
- Contact technical team with specific error messages

**Process Questions**:
- Review this documentation
- Check organizational policies
- Consult with supervisor
- Document solutions for future reference

## 📋 Daily Operations Checklist

### Morning Review (5 minutes)
- [ ] Check dashboard for overnight donations
- [ ] Review any failed payment alerts
- [ ] Confirm webhook status is healthy
- [ ] Note any unusual donation patterns

### Weekly Tasks (30 minutes)
- [ ] Export donation data for records
- [ ] Review top donors and clients
- [ ] Check for needed client updates
- [ ] Send thank you messages to recent donors

### Monthly Tasks (2 hours)
- [ ] Full reconciliation with Stripe
- [ ] Generate donation impact reports
- [ ] Review and update client information
- [ ] Backup donation records
- [ ] Review security and access logs

## 🎯 Success Metrics

### Key Performance Indicators

**Donation Metrics**:
- Total amount raised per month
- Number of unique donors
- Average donation size
- Conversion rate (page views to donations)

**Client Metrics**:
- Number of active clients
- Average time to reach goals
- Client success stories
- Goal completion rate

**System Metrics**:
- Payment success rate
- Page load times
- Error rates
- Webhook delivery success

### Reporting and Analysis

**Monthly Reports Should Include**:
- Total donations and donor count
- Top performing client campaigns
- Payment failure analysis
- System uptime and performance
- Donor retention and repeat donations

Use this dashboard effectively to maximize the impact of CareConnect's donation system and provide the best possible support to your clients and donors.