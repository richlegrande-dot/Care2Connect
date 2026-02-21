const htmlPdf = require('html-pdf-node');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs-extra');

// Organization information from environment variables
const getOrgInfo = () => {
  return {
    legalName: process.env.ORG_LEGAL_NAME || '[Organization Legal Name Not Set]',
    ein: process.env.ORG_EIN || '[EIN Not Provided]',
    address: process.env.ORG_ADDRESS || '[Organization Address Not Set]',
    phone: process.env.ORG_PHONE || '[Phone Not Provided]',
    website: process.env.ORG_WEBSITE || process.env.APP_DOMAIN || 'https://careconnect.org',
    appDomain: process.env.APP_DOMAIN || 'http://localhost:3000'
  };
};

/**
 * Generate IRS-compliant donation receipt PDF
 * @param {Object} donation - Donation data
 * @param {string} donation.id - Internal donation ID
 * @param {string} donation.donorName - Full name of donor
 * @param {string} donation.donorEmail - Email of donor
 * @param {number} donation.amountCents - Donation amount in cents
 * @param {string} donation.clientSlug - Client/recipient identifier
 * @param {string} donation.stripeSessionId - Stripe session ID
 * @param {string} donation.stripePaymentId - Stripe payment intent ID
 * @param {string} donation.createdAt - ISO date string of donation
 */
async function generateReceiptPDF(donation) {
  try {
    const orgInfo = getOrgInfo();
    const donationAmount = (donation.amountCents / 100).toFixed(2);
    const donationDate = new Date(donation.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
    
    // Generate QR code for verification (optional)
    const verificationUrl = `${orgInfo.appDomain}/verify/donation/${donation.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 100,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // IRS-compliant receipt HTML template
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Official Donation Receipt</title>
      <style>
        body {
          font-family: 'Times New Roman', serif;
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
          line-height: 1.4;
          color: #000;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #000;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          font-size: 24px;
          font-weight: bold;
          margin: 0 0 10px 0;
          text-transform: uppercase;
        }
        
        .org-info {
          font-size: 14px;
          margin: 10px 0;
        }
        
        .receipt-details {
          margin: 30px 0;
        }
        
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        .details-table th,
        .details-table td {
          border: 1px solid #000;
          padding: 10px;
          text-align: left;
        }
        
        .details-table th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        
        .amount {
          font-size: 18px;
          font-weight: bold;
        }
        
        .irs-statement {
          margin: 30px 0;
          padding: 20px;
          border: 2px solid #000;
          background-color: #f9f9f9;
          font-size: 12px;
          font-style: italic;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 10px;
          border-top: 1px solid #ccc;
          padding-top: 20px;
        }
        
        .qr-section {
          float: right;
          text-align: center;
          margin-left: 20px;
        }
        
        .qr-section img {
          width: 80px;
          height: 80px;
        }
        
        .signature-line {
          margin-top: 40px;
          border-top: 1px solid #000;
          width: 300px;
          text-align: center;
          padding-top: 5px;
          font-size: 12px;
        }
        
        .clearfix::after {
          content: "";
          display: table;
          clear: both;
        }
        
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Official Donation Receipt</h1>
        <div class="org-info">
          <strong>${orgInfo.legalName}</strong><br>
          ${orgInfo.address}<br>
          ${orgInfo.phone ? `Phone: ${orgInfo.phone}<br>` : ''}
          ${orgInfo.website ? `Website: ${orgInfo.website}<br>` : ''}
          EIN: ${orgInfo.ein}
        </div>
      </div>

      <div class="receipt-details clearfix">
        <div class="qr-section">
          <img src="${qrCodeDataUrl}" alt="Verification QR Code">
          <div style="font-size: 10px; margin-top: 5px;">
            Scan to Verify
          </div>
        </div>

        <table class="details-table">
          <tr>
            <th>Donor Information</th>
            <td>
              <strong>${donation.donorName || 'Anonymous Donor'}</strong><br>
              ${donation.donorEmail || 'Email not provided'}
            </td>
          </tr>
          <tr>
            <th>Donation Date</th>
            <td>${donationDate}</td>
          </tr>
          <tr>
            <th>Donation Amount</th>
            <td class="amount">$${donationAmount} USD</td>
          </tr>
          <tr>
            <th>Beneficiary</th>
            <td>${donation.clientSlug ? `Support for ${donation.clientSlug}` : 'General Fund'}</td>
          </tr>
          <tr>
            <th>Transaction ID</th>
            <td>
              Internal: ${donation.id}<br>
              ${donation.stripeSessionId ? `Stripe Session: ${donation.stripeSessionId}` : ''}
              ${donation.stripePaymentId ? `<br>Payment ID: ${donation.stripePaymentId}` : ''}
            </td>
          </tr>
        </table>
      </div>

      <div class="irs-statement">
        <strong>IRS Tax-Deductible Donation Statement:</strong><br><br>
        Thank you for your charitable contribution. No goods or services were provided in exchange for this donation. 
        This receipt is provided for your tax records in accordance with IRS Publication 1771.
        <br><br>
        <strong>Important:</strong> Please consult your tax advisor regarding the deductibility of charitable contributions.
      </div>

      <div style="margin: 30px 0;">
        <div class="signature-line">
          Authorized Representative
        </div>
      </div>

      <div class="footer">
        <p>
          <strong>CareConnect Donation System</strong><br>
          This document is valid without signature. Generated on ${new Date().toLocaleDateString('en-US')}
        </p>
        <p style="margin-top: 10px; font-size: 8px;">
          Verification URL: ${verificationUrl}
        </p>
      </div>
    </body>
    </html>
    `;

    // PDF generation options
    const options = {
      format: 'A4',
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      displayHeaderFooter: false,
      printBackground: true
    };

    // Generate PDF
    const pdfBuffer = await htmlPdf.generatePdf({ content: htmlContent }, options);
    
    // Save PDF to file system
    const fileName = `receipt_${donation.id}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../uploads/receipts', fileName);
    
    // Ensure receipts directory exists
    await fs.ensureDir(path.dirname(filePath));
    
    // Write PDF buffer to file
    await fs.writeFile(filePath, pdfBuffer);
    
    const receiptUrl = `${process.env.APP_DOMAIN || 'http://localhost:3001'}/receipts/${fileName}`;
    
    console.log(`✅ Receipt generated: ${fileName} for donation ${donation.id}`);
    
    return {
      success: true,
      fileName,
      filePath,
      receiptUrl,
      verificationUrl
    };

  } catch (error) {
    console.error('❌ Receipt generation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate simple HTML receipt for immediate viewing
 */
function generateReceiptHTML(donation) {
  const orgInfo = getOrgInfo();
  const donationAmount = (donation.amountCents / 100).toFixed(2);
  const donationDate = new Date(donation.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });

  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc;">
      <h2 style="text-align: center; color: #2c5282;">Official Donation Receipt</h2>
      
      <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #2c5282;">
        <strong>${orgInfo.legalName}</strong><br>
        ${orgInfo.address}<br>
        EIN: ${orgInfo.ein}
      </div>

      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ccc; background: #f7fafc;"><strong>Donor:</strong></td>
          <td style="padding: 10px; border: 1px solid #ccc;">${donation.donorName || 'Anonymous'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ccc; background: #f7fafc;"><strong>Date:</strong></td>
          <td style="padding: 10px; border: 1px solid #ccc;">${donationDate}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ccc; background: #f7fafc;"><strong>Amount:</strong></td>
          <td style="padding: 10px; border: 1px solid #ccc; font-size: 18px; font-weight: bold;">$${donationAmount}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ccc; background: #f7fafc;"><strong>For:</strong></td>
          <td style="padding: 10px; border: 1px solid #ccc;">Support for ${donation.clientSlug || 'General Fund'}</td>
        </tr>
      </table>

      <div style="background: #f0f8f0; padding: 15px; margin: 20px 0; border-left: 4px solid #48bb78;">
        <p style="margin: 0; font-size: 14px; font-style: italic;">
          <strong>Tax Information:</strong> No goods or services were provided in exchange for this donation. 
          This receipt complies with IRS Publication 1771 requirements.
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
        Transaction ID: ${donation.id}<br>
        Generated: ${new Date().toLocaleDateString('en-US')}
      </div>
    </div>
  `;
}

module.exports = {
  generateReceiptPDF,
  generateReceiptHTML,
  getOrgInfo
};