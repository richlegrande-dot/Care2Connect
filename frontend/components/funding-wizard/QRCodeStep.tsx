'use client';

import React, { useState, useEffect } from 'react';
import { Download, Copy, Printer, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';

interface QRCodeStepProps {
  data: any;
  onComplete: (data: any) => void;
  onBack: () => void;
  onHelp: () => void;
  clientId: string;
}

export default function QRCodeStep({ data, onComplete, onBack, onHelp, clientId }: QRCodeStepProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [donationUrl, setDonationUrl] = useState<string>('');
  const [publicSlug, setPublicSlug] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, [clientId]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      // Generate or retrieve public slug for this client
      const slug = data.publicSlug || `donate-${clientId.slice(0, 8)}`;
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const url = `${baseUrl}/donate/${slug}`;

      setPublicSlug(slug);
      setDonationUrl(url);

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('[QRCodeStep] Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `donation-qr-${publicSlug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(donationUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('[QRCodeStep] Error copying URL:', error);
    }
  };

  const handlePrint = () => {
    // Create print-friendly window
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Donation QR Code - ${data.fullName || 'CareConnect'}</title>
          <style>
            @page {
              margin: 1in;
            }
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
            }
            p {
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
            }
            img {
              max-width: 300px;
              margin: 20px auto;
            }
            .url {
              font-size: 12px;
              word-break: break-all;
              margin-top: 20px;
              padding: 10px;
              background: #f5f5f5;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <h1>Support ${data.fullName || 'This Campaign'}</h1>
          <p>Scan this QR code to make a donation</p>
          <img src="${qrCodeDataUrl}" alt="Donation QR Code" />
          <p>Or visit:</p>
          <div class="url">${donationUrl}</div>
          <p style="margin-top: 40px; font-size: 10px; color: #999;">
            Powered by CareConnect
          </p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleNext = () => {
    onComplete({
      publicSlug,
      qrCodeUrl: qrCodeDataUrl,
      donationPageUrl: donationUrl
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Generate Donation QR Code</h2>
        <p className="text-gray-600">
          Create a scannable QR code that links to your secure donation page
        </p>
      </div>

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Generating your QR code...</p>
        </div>
      ) : (
        <>
          {/* QR Code Display */}
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
            <div className="flex flex-col items-center">
              {qrCodeDataUrl && (
                <>
                  <img
                    src={qrCodeDataUrl}
                    alt="Donation QR Code"
                    className="w-64 h-64 mb-6 bg-white p-4 rounded-lg shadow-sm"
                  />
                  <div className="bg-white rounded-lg p-4 w-full max-w-md shadow-sm">
                    <p className="text-sm text-gray-600 mb-2 text-center">Donation Page URL:</p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={donationUrl}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={handleCopyUrl}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                        title="Copy URL"
                      >
                        {copySuccess ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleDownloadQR}
              className="flex items-center justify-center px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PNG
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center px-6 py-3 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium transition-colors"
            >
              <Printer className="w-5 h-5 mr-2" />
              Print QR Code
            </button>
            <a
              href={donationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium transition-colors"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Test Link
            </a>
          </div>

          {/* How Donations Work Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-sm font-semibold text-blue-900">
                How donations work
              </h3>
              <span className="text-blue-600">{showInfo ? '−' : '+'}</span>
            </button>
            {showInfo && (
              <div className="mt-4 space-y-3 text-sm text-blue-800">
                <div className="flex items-start">
                  <span className="mr-2">1.</span>
                  <p>Donors scan your QR code or visit your donation page URL</p>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">2.</span>
                  <p>They're taken to your secure CareConnect donation page</p>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">3.</span>
                  <p>Donors enter their debit/credit card information via Stripe Checkout</p>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">4.</span>
                  <p><strong>No card data is stored by CareConnect</strong> — all payment processing is handled securely by Stripe</p>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">5.</span>
                  <p>You receive funds directly to your connected bank account</p>
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-300">
                  <p className="font-medium">✓ PCI-DSS compliant payment processing</p>
                  <p className="font-medium">✓ Industry-standard encryption</p>
                  <p className="font-medium">✓ No storage of sensitive card data</p>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-gray-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">Privacy & Security</p>
                <p>
                  This QR code links to your public donation page. Anyone with this code can view your campaign 
                  and make donations. Do not share with anyone you don't want to have access to your fundraising page.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <button
          type="button"
          onClick={onHelp}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Need help?
        </button>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={isGenerating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: GoFundMe Draft
            <CheckCircle className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
