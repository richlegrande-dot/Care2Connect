'use client';

import React, { useState } from 'react';
import { Download, Printer, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';

interface PrintKitStepProps {
  data: any;
  onBack: () => void;
  clientId: string;
}

export default function PrintKitStep({ data, onBack, clientId }: PrintKitStepProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadQR = () => {
    if (!data.qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = data.qrCodeUrl;
    link.download = `donation-qr-${data.publicSlug || clientId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadWord = async () => {
    setDownloading('word');
    try {
      const response = await fetch(`/api/export/word/${clientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.gofundmeDraft || {})
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gofundme-draft-${clientId}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('[PrintKitStep] Error downloading Word doc:', error);
    } finally {
      setDownloading(null);
    }
  };

  const handlePrintSummary = () => {
    // Generate print-friendly HTML summary
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const draft = data.gofundmeDraft || {};

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fundraising Campaign Summary - ${data.fullName || 'CareConnect'}</title>
          <style>
            @page {
              margin: 1in;
              size: letter;
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
              color: #1a1a1a;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 10px;
            }
            h2 {
              font-size: 18px;
              margin-top: 30px;
              margin-bottom: 10px;
              color: #2563eb;
            }
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .field-label {
              font-weight: bold;
              color: #666;
              font-size: 12px;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .field-value {
              background: #f5f5f5;
              padding: 10px;
              border-radius: 5px;
              margin-bottom: 15px;
              border-left: 3px solid #2563eb;
            }
            .qr-section {
              text-align: center;
              margin: 30px 0;
              padding: 20px;
              border: 2px dashed #ccc;
              page-break-inside: avoid;
            }
            .qr-section img {
              max-width: 300px;
              margin: 15px auto;
            }
            .url {
              font-size: 12px;
              word-break: break-all;
              background: #f0f0f0;
              padding: 10px;
              border-radius: 5px;
              margin-top: 10px;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #ccc;
              font-size: 10px;
              color: #999;
              text-align: center;
            }
            .checklist {
              list-style: none;
              padding-left: 0;
            }
            .checklist li {
              padding: 5px 0;
              padding-left: 25px;
              position: relative;
            }
            .checklist li:before {
              content: "☐";
              position: absolute;
              left: 0;
              font-size: 18px;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <h1>Fundraising Campaign Summary</h1>
          
          <div class="section">
            <h2>Personal Information</h2>
            <div class="field-label">Full Name</div>
            <div class="field-value">${data.fullName || 'Not provided'}</div>
            
            <div class="field-label">ZIP Code</div>
            <div class="field-value">${data.zipCode || 'Not provided'}</div>
            
            <div class="field-label">Email</div>
            <div class="field-value">${data.email || 'Not provided'}</div>
          </div>

          <div class="section">
            <h2>Campaign Details</h2>
            <div class="field-label">Campaign Title</div>
            <div class="field-value">${draft.title || 'Not provided'}</div>
            
            <div class="field-label">Fundraising Goal</div>
            <div class="field-value">$${draft.goal || '5000'}</div>
            
            <div class="field-label">Category</div>
            <div class="field-value">${draft.category || 'Not provided'}</div>
            
            <div class="field-label">Location</div>
            <div class="field-value">${draft.location || 'Not provided'}</div>
            
            <div class="field-label">Beneficiary</div>
            <div class="field-value">${draft.beneficiary || 'Not provided'}</div>
          </div>

          <div class="section">
            <h2>Campaign Story</h2>
            <div class="field-value" style="white-space: pre-wrap;">${draft.story || 'Not provided'}</div>
          </div>

          ${data.qrCodeUrl ? `
            <div class="qr-section">
              <h2>Donation QR Code</h2>
              <p>Scan this code to donate</p>
              <img src="${data.qrCodeUrl}" alt="Donation QR Code" />
              <div class="url">${data.donationPageUrl || ''}</div>
            </div>
          ` : ''}

          <div class="section">
            <h2>Next Steps Checklist</h2>
            <ul class="checklist">
              <li>Create GoFundMe account at gofundme.com/c/start</li>
              <li>Enter campaign details from this document</li>
              <li>Upload cover photo or video</li>
              <li>Review and publish campaign</li>
              <li>Connect bank account for withdrawals</li>
              <li>Share campaign using QR code and social media</li>
              <li>Post regular updates to engage donors</li>
            </ul>
          </div>

          <div class="footer">
            <p>Generated by CareConnect on ${new Date().toLocaleDateString()}</p>
            <p>For support, contact: workflown8n@gmail.com</p>
          </div>

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
              Print This Page
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownloadAll = async () => {
    setDownloading('all');
    // Download QR
    handleDownloadQR();
    // Download Word doc
    await new Promise(resolve => setTimeout(resolve, 500));
    await handleDownloadWord();
    setDownloading(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Download Print Kit</h2>
        <p className="text-gray-600">
          Get all your fundraising materials in one place. Download, print, and share!
        </p>
      </div>

      {/* Success Message */}
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="flex items-start">
          <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              🎉 Congratulations! Your funding setup is complete.
            </h3>
            <p className="text-green-800">
              You've successfully prepared all the materials needed to launch your fundraising campaign.
              Download your print kit below and follow the GoFundMe wizard instructions to publish your campaign.
            </p>
          </div>
        </div>
      </div>

      {/* Download Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR Code */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
          <div className="flex items-center mb-4">
            <ImageIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">QR Code (PNG)</h3>
              <p className="text-xs text-gray-600">High-resolution donation QR code</p>
            </div>
          </div>
          <button
            onClick={handleDownloadQR}
            disabled={!data.qrCodeUrl}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PNG
          </button>
        </div>

        {/* Word Document */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6 hover:border-green-500 transition-colors">
          <div className="flex items-center mb-4">
            <FileText className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Campaign Draft (.docx)</h3>
              <p className="text-xs text-gray-600">Formatted GoFundMe document</p>
            </div>
          </div>
          <button
            onClick={handleDownloadWord}
            disabled={downloading === 'word'}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading === 'word' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download .docx
              </>
            )}
          </button>
        </div>
      </div>

      {/* Print Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start flex-1">
            <Printer className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">One-Page Print Summary</h3>
              <p className="text-sm text-gray-600">
                Print-optimized page with all your campaign details, QR code, and next steps checklist.
                Perfect for keeping on hand or sharing with support coordinators.
              </p>
            </div>
          </div>
          <button
            onClick={handlePrintSummary}
            className="ml-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center whitespace-nowrap"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Summary
          </button>
        </div>
      </div>

      {/* Download All Button */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Everything</h3>
          <p className="text-sm text-gray-600 mb-4">
            Get all files at once (QR code PNG + Word document)
          </p>
          <button
            onClick={handleDownloadAll}
            disabled={downloading === 'all'}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium text-lg flex items-center justify-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading === 'all' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download All Files
              </>
            )}
          </button>
        </div>
      </div>

      {/* What's Included */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">📦 What's Included in Your Print Kit</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start">
            <span className="mr-2">✓</span>
            <span><strong>QR Code PNG:</strong> High-resolution image for printing on flyers, posters, or business cards</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">✓</span>
            <span><strong>Campaign Draft (Word):</strong> Formatted document with title, story, goal, and all details</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">✓</span>
            <span><strong>Donation Page URL:</strong> Direct link to your CareConnect donation page</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">✓</span>
            <span><strong>Print Summary:</strong> One-page overview with QR code and checklist</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-yellow-900 mb-3">🚀 Next Steps</h3>
        <ol className="space-y-2 text-sm text-yellow-800">
          <li className="flex items-start">
            <span className="mr-2 font-bold">1.</span>
            <span>Visit <a href="https://www.gofundme.com/c/start" target="_blank" rel="noopener noreferrer" className="underline">gofundme.com/c/start</a> and create your campaign using the draft</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 font-bold">2.</span>
            <span>Upload photos or videos to your GoFundMe campaign</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 font-bold">3.</span>
            <span>Publish your GoFundMe and connect your bank account</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 font-bold">4.</span>
            <span>Share your CareConnect QR code and donation link everywhere!</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 font-bold">5.</span>
            <span>Post regular updates to keep donors engaged</span>
          </li>
        </ol>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          Back
        </button>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
