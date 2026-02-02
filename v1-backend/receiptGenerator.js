const puppeteer = require('puppeteer');
const QRCode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');

// Generate Receipt HTML
function generateReceiptHTML(donationData) {
  const organizationInfo = {
    legalName: process.env.ORG_LEGAL_NAME || 'CareConnect Foundation',
    address: process.env.ORG_ADDRESS || '123 Main St, City, ST ZIP',
    phone: process.env.ORG_PHONE || '(555) 123-4567',
    website: process.env.ORG_WEBSITE || 'www.careconnect.org',
    ein: process.env.ORG_EIN || '00-0000000'
  };

  const verificationUrl = `${process.env.APP_DOMAIN || 'http://localhost:3000'}/verify/donation/${donationData.donationId}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Donation Receipt - ${donationData.donationId}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        
        .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            border: 2px solid #333;
            padding: 30px;
            background: white;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #1a365d;
            margin: 0 0 10px 0;
        }
        
        .org-info {
            font-size: 12px;
            color: #666;
        }
        
        .receipt-details {
            margin: 20px 0;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px dotted #ccc;
        }
        
        .detail-label {
            font-weight: bold;
            width: 40%;
        }
        
        .detail-value {
            width: 55%;
            text-align: right;
        }
        
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: #2d5a27;
            text-align: center;
            padding: 20px;
            border: 3px solid #2d5a27;
            margin: 20px 0;
        }
        
        .tax-statement {
            background: #f8f9fa;
            border: 2px solid #333;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        
        .verification {
            text-align: center;
            margin: 30px 0;
        }
        
        .qr-code {
            margin: 20px 0;
        }
        
        .footer {
            text-align: center;
            font-size: 10px;
            color: #666;
            margin-top: 30px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <h1>Tax-Deductible Donation Receipt</h1>
            <div class="org-info">
                <strong>${organizationInfo.legalName}</strong><br>
                ${organizationInfo.address}<br>
                ${organizationInfo.phone} | ${organizationInfo.website}<br>
                <strong>EIN: ${organizationInfo.ein}</strong>
            </div>
        </div>

        <div class="receipt-details">
            <div class="detail-row">
                <span class="detail-label">Receipt Number:</span>
                <span class="detail-value">${donationData.donationId}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Donation Date:</span>
                <span class="detail-value">${new Date(donationData.date).toLocaleDateString('en-US')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Donor Name:</span>
                <span class="detail-value">${donationData.donorName || 'Anonymous Donor'}</span>
            </div>
            ${donationData.donorEmail ? `
            <div class="detail-row">
                <span class="detail-label">Donor Email:</span>
                <span class="detail-value">${donationData.donorEmail}</span>
            </div>` : ''}
            <div class="detail-row">
                <span class="detail-label">Beneficiary:</span>
                <span class="detail-value">${donationData.clientProfile || 'General Support'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">Online Payment</span>
            </div>
        </div>

        <div class="amount">
            DONATION AMOUNT: $${(donationData.amount / 100).toFixed(2)}
        </div>

        <div class="tax-statement">
            <h3>Important Tax Information</h3>
            <p><strong>No goods or services were provided in exchange for this contribution.</strong></p>
            <p>This receipt is provided for your tax records in accordance with IRS Publication 1771. 
            ${organizationInfo.legalName} is recognized as tax-exempt under Section 501(c)(3) of the Internal Revenue Code.</p>
            <p><strong>Please consult your tax advisor regarding the deductibility of charitable contributions.</strong></p>
        </div>

        <div class="verification">
            <div class="qr-code" id="qrcode"></div>
            <p><strong>Verify this receipt online:</strong><br>
            <small>${verificationUrl}</small></p>
        </div>

        <div class="footer">
            <p>This is an official tax-deductible donation receipt generated by CareConnect.</p>
            <p>Receipt generated on ${new Date().toLocaleDateString('en-US')} | Thank you for your generosity!</p>
        </div>
    </div>

    <script>
        // Generate QR code (this will be replaced server-side)
    </script>
</body>
</html>
  `;
}

// Generate Receipt PDF
async function generateReceiptPDF(donationData) {
  try {
    let html = generateReceiptHTML(donationData);
    
    // Generate QR Code
    const verificationUrl = `${process.env.APP_DOMAIN || 'http://localhost:3000'}/verify/donation/${donationData.donationId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 150,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Replace QR code placeholder
    html = html.replace(
      '<div class="qr-code" id="qrcode"></div>',
      `<div class="qr-code"><img src="${qrCodeDataUrl}" alt="Verification QR Code" style="width: 150px; height: 150px;"></div>`
    );

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.75in',
        bottom: '0.5in',
        left: '0.75in'
      }
    });

    await browser.close();

    // Save PDF to receipts directory
    const receiptsDir = path.join(__dirname, 'receipts');
    try {
      await fs.access(receiptsDir);
    } catch {
      await fs.mkdir(receiptsDir, { recursive: true });
    }

    const pdfPath = path.join(receiptsDir, `${donationData.donationId}.pdf`);
    await fs.writeFile(pdfPath, pdf);

    console.log(`✅ Receipt PDF generated: ${pdfPath}`);
    return pdf;

  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    throw error;
  }
}

// Generate Annual Statement HTML
function generateStatementHTML(statement) {
  const organizationInfo = {
    legalName: process.env.ORG_LEGAL_NAME || 'CareConnect Foundation',
    address: process.env.ORG_ADDRESS || '123 Main St, City, ST ZIP',
    phone: process.env.ORG_PHONE || '(555) 123-4567',
    website: process.env.ORG_WEBSITE || 'www.careconnect.org',
    ein: process.env.ORG_EIN || '00-0000000'
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Annual Donation Statement - ${statement.donorName}</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            margin: 0;
            padding: 40px;
            line-height: 1.6;
            color: #333;
            background: white;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #333;
            padding-bottom: 30px;
            margin-bottom: 40px;
        }
        
        .header h1 {
            font-size: 24px;
            font-weight: bold;
            color: #1a365d;
            margin: 0 0 20px 0;
        }
        
        .org-info {
            font-size: 12px;
            line-height: 1.4;
            color: #666;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1a365d;
            margin-bottom: 15px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        
        .donor-info {
            background-color: #f8f9fa;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .donor-info div {
            margin-bottom: 8px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 12px;
        }
        
        th, td {
            border: 1px solid #333;
            padding: 12px 8px;
            text-align: left;
        }
        
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        
        .amount {
            text-align: right;
            font-family: 'Courier New', monospace;
        }
        
        .total-row {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        
        .tax-info {
            border: 2px solid #333;
            padding: 25px;
            background-color: #f8f9fa;
            margin: 30px 0;
        }
        
        .tax-info h3 {
            margin-top: 0;
            color: #1a365d;
        }
        
        .signature-section {
            margin-top: 50px;
            text-align: center;
            border-top: 1px solid #ddd;
            padding-top: 30px;
        }
        
        .signature-line {
            width: 300px;
            border-bottom: 1px solid #333;
            margin: 0 auto 10px auto;
            height: 40px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 10px;
            color: #666;
        }
        
        @media print {
            body { margin: 0; padding: 20px; }
            .header { page-break-after: avoid; }
            table { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Annual Donation Statement</h1>
        <div class="org-info">
            <strong>${organizationInfo.legalName}</strong><br>
            ${organizationInfo.address}<br>
            Phone: ${organizationInfo.phone} | Web: ${organizationInfo.website}<br>
            <strong>EIN: ${organizationInfo.ein}</strong>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Donor Information</div>
        <div class="donor-info">
            <div><strong>Donor Name:</strong> ${statement.donorName}</div>
            <div><strong>Email Address:</strong> ${statement.donorEmail}</div>
            <div><strong>Statement Period:</strong> ${
              statement.dateRange.start && statement.dateRange.end 
                ? `${new Date(statement.dateRange.start).toLocaleDateString('en-US')} through ${new Date(statement.dateRange.end).toLocaleDateString('en-US')}`
                : 'All available donation records'
            }</div>
            <div><strong>Statement Generated:</strong> ${new Date().toLocaleDateString('en-US')}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Itemized Donation Summary</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 15%">Date</th>
                    <th style="width: 65%">Donation Purpose</th>
                    <th style="width: 20%" class="amount">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${statement.donations.map(donation => `
                    <tr>
                        <td>${new Date(donation.date).toLocaleDateString('en-US')}</td>
                        <td>Charitable support for ${donation.clientProfile}</td>
                        <td class="amount">$${donation.amount.toFixed(2)}</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td colspan="2"><strong>TOTAL DONATIONS</strong></td>
                    <td class="amount"><strong>$${statement.totalAmount.toFixed(2)}</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="tax-info">
        <h3>Important Tax Information</h3>
        <p><strong>For Tax Year ${new Date().getFullYear()}:</strong></p>
        <p>This statement summarizes your charitable contributions to ${organizationInfo.legalName} 
        (EIN: ${organizationInfo.ein}) for the period indicated above.</p>
        
        <p><strong>IRS Compliance Notice:</strong> No goods or services were provided in exchange for 
        any portion of these contributions. This organization is recognized as tax-exempt under 
        Section 501(c)(3) of the Internal Revenue Code.</p>
        
        <p><strong>Deductibility:</strong> These contributions may be deductible for federal income 
        tax purposes. Please consult your tax advisor regarding the deductibility of charitable 
        contributions and retain this statement for your tax records.</p>
        
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ccc; font-size: 11px;">
            <strong>Summary for Tax Purposes:</strong><br>
            Total Charitable Contributions: $${statement.totalAmount.toFixed(2)}<br>
            Number of Separate Donations: ${statement.donations.length}<br>
            All contributions were made as cash donations (no property or securities)
        </div>
    </div>

    <div class="signature-section">
        <div class="signature-line"></div>
        <div style="font-size: 12px; color: #666;">Authorized Representative, ${organizationInfo.legalName}</div>
    </div>

    <div class="footer">
        <div>${organizationInfo.legalName} | ${organizationInfo.address}</div>
        <div>Annual Donation Statement | Generated ${new Date().toLocaleDateString('en-US')}</div>
    </div>
</body>
</html>
  `;
}

// Generate Annual Statement PDF
async function generateStatementPDF(html, donorEmail) {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set page content
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.75in',
        bottom: '0.5in',
        left: '0.75in'
      }
    });

    await browser.close();
    return pdf;

  } catch (error) {
    console.error('Error generating statement PDF:', error);
    throw error;
  }
}

// Export functions
module.exports = {
  generateReceiptPDF,
  generateReceiptHTML,
  generateStatementPDF,
  generateStatementHTML
};