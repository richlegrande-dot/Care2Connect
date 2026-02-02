/**
 * CareConnect V1.7 - Email Provider Abstraction Layer
 * 
 * Supports: SendGrid, Mailgun, AWS SES, and TEST/NO_KEYS mode
 * Default behavior: Logs email payload without sending (safe for development)
 */

const fs = require('fs').promises;
const path = require('path');

// Email provider types
const EMAIL_PROVIDERS = {
  SENDGRID: 'sendgrid',
  MAILGUN: 'mailgun',
  SES: 'ses',
  NONE: 'none'
};

// Email status types
const EMAIL_STATUS = {
  SENT: 'sent',
  FAILED: 'failed',
  SKIPPED_NO_KEYS: 'skipped_no_keys',
  LOGGED_ONLY: 'logged_only'
};

// Email types
const EMAIL_TYPES = {
  RECEIPT: 'receipt',
  ANNUAL: 'annual',
  VERIFICATION: 'verification'
};

class EmailClient {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'none';
    this.emailLogs = []; // In-memory log for V1 (would be DB in production)
    
    // Initialize provider-specific clients
    this.sendgridClient = null;
    this.mailgunClient = null;
    this.sesClient = null;
    
    this.initializeProviders();
  }

  initializeProviders() {
    try {
      // SendGrid initialization
      if (this.provider === EMAIL_PROVIDERS.SENDGRID && process.env.SENDGRID_API_KEY) {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.sendgridClient = sgMail;
        console.log('✅ SendGrid email provider configured');
      }
      
      // Mailgun initialization
      else if (this.provider === EMAIL_PROVIDERS.MAILGUN && process.env.MAILGUN_API_KEY) {
        const formData = require('form-data');
        const Mailgun = require('mailgun.js');
        const mailgun = new Mailgun(formData);
        this.mailgunClient = mailgun.client({
          username: 'api',
          key: process.env.MAILGUN_API_KEY
        });
        console.log('✅ Mailgun email provider configured');
      }
      
      // AWS SES initialization
      else if (this.provider === EMAIL_PROVIDERS.SES && process.env.SES_ACCESS_KEY) {
        const AWS = require('aws-sdk');
        AWS.config.update({
          accessKeyId: process.env.SES_ACCESS_KEY,
          secretAccessKey: process.env.SES_SECRET_KEY,
          region: process.env.SES_REGION || 'us-east-1'
        });
        this.sesClient = new AWS.SES({ apiVersion: '2010-12-01' });
        console.log('✅ AWS SES email provider configured');
      }
      
      // No-keys/Test mode
      else {
        console.log('⚠️  Email provider set to TEST/NO_KEYS mode - emails will be logged only');
      }
    } catch (error) {
      console.warn('⚠️  Email provider initialization warning:', error.message);
      console.log('📧 Falling back to TEST mode - emails will be logged only');
      this.provider = EMAIL_PROVIDERS.NONE;
    }
  }

  /**
   * Send donation receipt email with PDF attachment
   */
  async sendDonationReceiptEmail(donorEmail, donationData, pdfPath, verificationLink) {
    const emailPayload = {
      to: donorEmail,
      from: process.env.ORG_EMAIL || 'receipts@careconnect.org',
      subject: 'Your Donation Receipt – Thank You from CareConnect',
      html: this.generateReceiptEmailHTML(donationData, verificationLink),
      text: this.generateReceiptEmailText(donationData, verificationLink),
      attachments: pdfPath ? [{
        filename: `donation_receipt_${donationData.id}.pdf`,
        path: pdfPath,
        type: 'application/pdf'
      }] : []
    };

    return this.sendEmail(emailPayload, EMAIL_TYPES.RECEIPT, donorEmail);
  }

  /**
   * Send annual donation summary email with PDF attachment
   */
  async sendAnnualSummaryEmail(donorEmail, summaryData, pdfBuffer, year) {
    const emailPayload = {
      to: donorEmail,
      from: process.env.ORG_EMAIL || 'receipts@careconnect.org',
      subject: `Your Annual Donation Summary for ${year} – Tax Reporting`,
      html: this.generateAnnualSummaryEmailHTML(summaryData, year),
      text: this.generateAnnualSummaryEmailText(summaryData, year),
      attachments: [{
        filename: `annual_donation_statement_${year}_${donorEmail.replace('@', '_at_')}.pdf`,
        content: pdfBuffer,
        type: 'application/pdf'
      }]
    };

    return this.sendEmail(emailPayload, EMAIL_TYPES.ANNUAL, donorEmail);
  }

  /**
   * Core email sending logic with provider routing
   */
  async sendEmail(emailPayload, emailType, recipientEmail) {
    const logEntry = {
      id: Date.now(),
      donorEmail: recipientEmail,
      subject: emailPayload.subject,
      type: emailType,
      status: EMAIL_STATUS.LOGGED_ONLY,
      timestamp: new Date().toISOString(),
      provider: this.provider
    };

    try {
      // Route to appropriate provider
      if (this.provider === EMAIL_PROVIDERS.SENDGRID && this.sendgridClient) {
        await this.sendViaSendGrid(emailPayload);
        logEntry.status = EMAIL_STATUS.SENT;
        console.log(`✅ Email sent via SendGrid to ${recipientEmail}`);
      }
      else if (this.provider === EMAIL_PROVIDERS.MAILGUN && this.mailgunClient) {
        await this.sendViaMailgun(emailPayload);
        logEntry.status = EMAIL_STATUS.SENT;
        console.log(`✅ Email sent via Mailgun to ${recipientEmail}`);
      }
      else if (this.provider === EMAIL_PROVIDERS.SES && this.sesClient) {
        await this.sendViaSES(emailPayload);
        logEntry.status = EMAIL_STATUS.SENT;
        console.log(`✅ Email sent via AWS SES to ${recipientEmail}`);
      }
      else {
        // NO-KEYS MODE - Log only, do not send
        logEntry.status = EMAIL_STATUS.SKIPPED_NO_KEYS;
        console.log('📧 EMAIL LOG (No-Keys Mode):');
        console.log(JSON.stringify({
          to: emailPayload.to,
          from: emailPayload.from,
          subject: emailPayload.subject,
          attachments: emailPayload.attachments?.map(a => a.filename),
          textPreview: emailPayload.text?.substring(0, 100) + '...',
          timestamp: logEntry.timestamp
        }, null, 2));
        console.log('⚠️  Email delivery not enabled - keys not configured');
      }

      // Store log entry
      this.emailLogs.push(logEntry);
      
      return {
        success: true,
        status: logEntry.status,
        message: logEntry.status === EMAIL_STATUS.SENT 
          ? 'Email sent successfully' 
          : 'Email logged - delivery not enabled',
        logId: logEntry.id
      };

    } catch (error) {
      console.error('❌ Email sending error:', error);
      logEntry.status = EMAIL_STATUS.FAILED;
      logEntry.error = error.message;
      this.emailLogs.push(logEntry);

      return {
        success: false,
        status: EMAIL_STATUS.FAILED,
        message: error.message,
        logId: logEntry.id
      };
    }
  }

  /**
   * SendGrid implementation
   */
  async sendViaSendGrid(emailPayload) {
    const msg = {
      to: emailPayload.to,
      from: emailPayload.from,
      subject: emailPayload.subject,
      text: emailPayload.text,
      html: emailPayload.html
    };

    // Handle attachments for SendGrid
    if (emailPayload.attachments && emailPayload.attachments.length > 0) {
      msg.attachments = [];
      for (const attachment of emailPayload.attachments) {
        if (attachment.path) {
          const fileContent = await fs.readFile(attachment.path);
          msg.attachments.push({
            content: fileContent.toString('base64'),
            filename: attachment.filename,
            type: attachment.type,
            disposition: 'attachment'
          });
        } else if (attachment.content) {
          msg.attachments.push({
            content: attachment.content.toString('base64'),
            filename: attachment.filename,
            type: attachment.type,
            disposition: 'attachment'
          });
        }
      }
    }

    await this.sendgridClient.send(msg);
  }

  /**
   * Mailgun implementation
   */
  async sendViaMailgun(emailPayload) {
    const messageData = {
      from: emailPayload.from,
      to: emailPayload.to,
      subject: emailPayload.subject,
      text: emailPayload.text,
      html: emailPayload.html
    };

    // Handle attachments for Mailgun
    if (emailPayload.attachments && emailPayload.attachments.length > 0) {
      messageData.attachment = [];
      for (const attachment of emailPayload.attachments) {
        if (attachment.path) {
          const fileContent = await fs.readFile(attachment.path);
          messageData.attachment.push({
            filename: attachment.filename,
            data: fileContent
          });
        } else if (attachment.content) {
          messageData.attachment.push({
            filename: attachment.filename,
            data: attachment.content
          });
        }
      }
    }

    await this.mailgunClient.messages.create(
      process.env.MAILGUN_DOMAIN,
      messageData
    );
  }

  /**
   * AWS SES implementation
   */
  async sendViaSES(emailPayload) {
    // Note: SES with attachments requires raw email format
    // For simplicity in V1.7, we'll use text/html only
    // Full MIME support would be added in production
    
    const params = {
      Source: emailPayload.from,
      Destination: {
        ToAddresses: [emailPayload.to]
      },
      Message: {
        Subject: {
          Data: emailPayload.subject
        },
        Body: {
          Html: {
            Data: emailPayload.html
          },
          Text: {
            Data: emailPayload.text
          }
        }
      }
    };

    await this.sesClient.sendEmail(params).promise();
  }

  /**
   * Generate HTML email body for donation receipt
   */
  generateReceiptEmailHTML(donationData, verificationLink) {
    const orgName = process.env.ORG_LEGAL_NAME || 'CareConnect Foundation';
    const orgEIN = process.env.ORG_EIN || '00-0000000';
    const amount = (donationData.amountCents / 100).toFixed(2);
    
    // Handle fiscal sponsorship status
    const isFiscalSponsored = process.env.ORG_STATUS === 'fiscal_sponsor';
    const fiscalText = isFiscalSponsored 
      ? `<p><em>Donation processed under fiscal sponsorship of ${process.env.FISCAL_SPONSOR_NAME || 'Sponsor Organization'}, EIN: ${process.env.FISCAL_SPONSOR_EIN || '00-0000000'}</em></p>`
      : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2c5282; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border: 1px solid #dee2e6; }
    .amount { font-size: 28px; font-weight: bold; color: #2d5a27; text-align: center; padding: 20px; background: white; border: 2px solid #2d5a27; margin: 20px 0; }
    .irs-notice { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; background: #2c5282; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Thank You for Your Donation!</h1>
    <p>${orgName}</p>
  </div>
  
  <div class="content">
    <p>Dear ${donationData.donorName || 'Valued Donor'},</p>
    
    <p>Thank you for your charitable contribution to ${orgName}. Your generosity helps us continue our mission of connecting people in need with community support.</p>
    
    <div class="amount">
      Donation Amount: $${amount}
    </div>
    
    <p><strong>Donation Details:</strong></p>
    <ul>
      <li><strong>Date:</strong> ${new Date(donationData.createdAt).toLocaleDateString('en-US')}</li>
      <li><strong>Receipt ID:</strong> ${donationData.id}</li>
      <li><strong>Beneficiary:</strong> ${donationData.clientSlug || 'General Support'}</li>
    </ul>
    
    <div class="irs-notice">
      <p><strong>IRS Tax Information:</strong></p>
      <p><strong>No goods or services were provided in exchange for this donation.</strong></p>
      <p>This receipt is provided for your tax records in accordance with IRS Publication 1771. ${orgName} is recognized as tax-exempt under Section 501(c)(3) of the Internal Revenue Code (EIN: ${orgEIN}).</p>
      ${fiscalText}
      <p><em>Please consult your tax advisor regarding the deductibility of charitable contributions.</em></p>
    </div>
    
    <p><strong>Your official tax receipt is attached to this email as a PDF.</strong></p>
    
    <p>You can also verify this donation online:</p>
    <p style="text-align: center;">
      <a href="${verificationLink}" class="button">Verify Donation Online</a>
    </p>
    
    <p>Thank you again for your support!</p>
    
    <p>Warm regards,<br>
    <strong>The CareConnect Team</strong></p>
  </div>
  
  <div class="footer">
    <p>${orgName}<br>
    ${process.env.ORG_ADDRESS || '123 Main St, City, ST ZIP'}<br>
    ${process.env.ORG_PHONE || '(555) 123-4567'} | ${process.env.ORG_WEBSITE || 'www.careconnect.org'}</p>
    <p>This is an automated message. Please do not reply to this email.</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate plain text email body for donation receipt
   */
  generateReceiptEmailText(donationData, verificationLink) {
    const orgName = process.env.ORG_LEGAL_NAME || 'CareConnect Foundation';
    const orgEIN = process.env.ORG_EIN || '00-0000000';
    const amount = (donationData.amountCents / 100).toFixed(2);
    
    const isFiscalSponsored = process.env.ORG_STATUS === 'fiscal_sponsor';
    const fiscalText = isFiscalSponsored 
      ? `\nDonation processed under fiscal sponsorship of ${process.env.FISCAL_SPONSOR_NAME || 'Sponsor Organization'}, EIN: ${process.env.FISCAL_SPONSOR_EIN || '00-0000000'}`
      : '';

    return `
Thank You for Your Donation!
${orgName}

Dear ${donationData.donorName || 'Valued Donor'},

Thank you for your charitable contribution to ${orgName}. Your generosity helps us continue our mission of connecting people in need with community support.

DONATION AMOUNT: $${amount}

Donation Details:
- Date: ${new Date(donationData.createdAt).toLocaleDateString('en-US')}
- Receipt ID: ${donationData.id}
- Beneficiary: ${donationData.clientSlug || 'General Support'}

IRS TAX INFORMATION:
No goods or services were provided in exchange for this donation.

This receipt is provided for your tax records in accordance with IRS Publication 1771. ${orgName} is recognized as tax-exempt under Section 501(c)(3) of the Internal Revenue Code (EIN: ${orgEIN}).${fiscalText}

Please consult your tax advisor regarding the deductibility of charitable contributions.

Your official tax receipt is attached to this email as a PDF.

Verify this donation online:
${verificationLink}

Thank you again for your support!

Warm regards,
The CareConnect Team

${orgName}
${process.env.ORG_ADDRESS || '123 Main St, City, ST ZIP'}
${process.env.ORG_PHONE || '(555) 123-4567'} | ${process.env.ORG_WEBSITE || 'www.careconnect.org'}

This is an automated message. Please do not reply to this email.
    `.trim();
  }

  /**
   * Generate HTML email body for annual summary
   */
  generateAnnualSummaryEmailHTML(summaryData, year) {
    const orgName = process.env.ORG_LEGAL_NAME || 'CareConnect Foundation';
    const orgEIN = process.env.ORG_EIN || '00-0000000';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2c5282; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border: 1px solid #dee2e6; }
    .summary-box { background: white; padding: 20px; border: 2px solid #2d5a27; margin: 20px 0; }
    .total { font-size: 28px; font-weight: bold; color: #2d5a27; }
    .irs-notice { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Your ${year} Annual Donation Summary</h1>
    <p>${orgName}</p>
  </div>
  
  <div class="content">
    <p>Dear ${summaryData.donorName || 'Valued Donor'},</p>
    
    <p>Thank you for your continued support throughout ${year}. This annual statement summarizes your charitable contributions for tax reporting purposes.</p>
    
    <div class="summary-box">
      <p><strong>Annual Summary for ${year}:</strong></p>
      <div class="total">Total Donations: $${summaryData.totalAmount.toFixed(2)}</div>
      <p><strong>Number of Donations:</strong> ${summaryData.donations.length}</p>
    </div>
    
    <div class="irs-notice">
      <p><strong>For Tax Reporting:</strong></p>
      <p>Attached is your itemized annual donation record prepared in accordance with IRS Publication 1771.</p>
      <p><strong>No goods or services were provided in exchange for any portion of these contributions.</strong></p>
      <p>${orgName} is a tax-exempt organization under Section 501(c)(3) of the Internal Revenue Code (EIN: ${orgEIN}).</p>
      <p><em>Please retain this statement for your tax records and consult your tax advisor regarding charitable contribution deductions.</em></p>
    </div>
    
    <p>Your complete itemized statement is attached to this email as a PDF document.</p>
    
    <p>Thank you for making a difference in our community!</p>
    
    <p>With gratitude,<br>
    <strong>The CareConnect Team</strong></p>
  </div>
  
  <div class="footer">
    <p>${orgName}<br>
    ${process.env.ORG_ADDRESS || '123 Main St, City, ST ZIP'}<br>
    EIN: ${orgEIN}</p>
    <p>This is an automated tax document. Please save for your records.</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate plain text email body for annual summary
   */
  generateAnnualSummaryEmailText(summaryData, year) {
    const orgName = process.env.ORG_LEGAL_NAME || 'CareConnect Foundation';
    const orgEIN = process.env.ORG_EIN || '00-0000000';

    return `
Your ${year} Annual Donation Summary
${orgName}

Dear ${summaryData.donorName || 'Valued Donor'},

Thank you for your continued support throughout ${year}. This annual statement summarizes your charitable contributions for tax reporting purposes.

ANNUAL SUMMARY FOR ${year}:
Total Donations: $${summaryData.totalAmount.toFixed(2)}
Number of Donations: ${summaryData.donations.length}

FOR TAX REPORTING:
Attached is your itemized annual donation record prepared in accordance with IRS Publication 1771.

No goods or services were provided in exchange for any portion of these contributions.

${orgName} is a tax-exempt organization under Section 501(c)(3) of the Internal Revenue Code (EIN: ${orgEIN}).

Please retain this statement for your tax records and consult your tax advisor regarding charitable contribution deductions.

Your complete itemized statement is attached to this email as a PDF document.

Thank you for making a difference in our community!

With gratitude,
The CareConnect Team

${orgName}
${process.env.ORG_ADDRESS || '123 Main St, City, ST ZIP'}
EIN: ${orgEIN}

This is an automated tax document. Please save for your records.
    `.trim();
  }

  /**
   * Get email logs for admin review
   */
  getEmailLogs(filters = {}) {
    let logs = [...this.emailLogs];

    // Filter by email type
    if (filters.type) {
      logs = logs.filter(log => log.type === filters.type);
    }

    // Filter by status
    if (filters.status) {
      logs = logs.filter(log => log.status === filters.status);
    }

    // Filter by date range
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      logs = logs.filter(log => new Date(log.timestamp) >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      logs = logs.filter(log => new Date(log.timestamp) <= end);
    }

    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Get email provider status
   */
  getProviderStatus() {
    return {
      provider: this.provider,
      configured: this.provider !== EMAIL_PROVIDERS.NONE && (
        (this.provider === EMAIL_PROVIDERS.SENDGRID && !!this.sendgridClient) ||
        (this.provider === EMAIL_PROVIDERS.MAILGUN && !!this.mailgunClient) ||
        (this.provider === EMAIL_PROVIDERS.SES && !!this.sesClient)
      ),
      mode: this.provider === EMAIL_PROVIDERS.NONE || 
            (!this.sendgridClient && !this.mailgunClient && !this.sesClient)
        ? 'TEST/NO_KEYS'
        : 'LIVE',
      capabilities: {
        canSendEmails: !!(this.sendgridClient || this.mailgunClient || this.sesClient),
        canAttachPDFs: true,
        loggingEnabled: true
      }
    };
  }
}

// Export singleton instance
const emailClient = new EmailClient();

module.exports = {
  emailClient,
  EMAIL_PROVIDERS,
  EMAIL_STATUS,
  EMAIL_TYPES
};
