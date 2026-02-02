'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  QrCodeIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { api, RecordingTicket, DonationTotal, Donation } from '@/lib/api';

export default function ProfilePage() {
  const params = useParams();
  const ticketId = (params?.id as string) || '';

  const [ticket, setTicket] = useState<RecordingTicket | null>(null);
  const [donationTotal, setDonationTotal] = useState<DonationTotal | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dbHealthy, setDbHealthy] = useState(true);

  // Donation flow state
  const [showDonateForm, setShowDonateForm] = useState(false);
  const [donationAmount, setDonationAmount] = useState('25');
  const [donationCurrency, setDonationCurrency] = useState('USD');
  const [donationDescription, setDonationDescription] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrError, setQrError] = useState('');

  useEffect(() => {
    loadProfileData();
  }, [ticketId]);

  const loadProfileData = async () => {
    setLoading(true);
    setError('');

    try {
      // Check DB health
      const health = await api.checkDbHealth();
      setDbHealthy(health.ready);

      if (!health.ready) {
        setError('System offline due to database connectivity');
        return;
      }

      // Load ticket data
      const ticketData = await api.get<RecordingTicket>(`/tickets/${ticketId}`);
      setTicket(ticketData);

      // Load donation totals
      try {
        const totals = await api.get<DonationTotal>(`/tickets/${ticketId}/donations/total`);
        setDonationTotal(totals);
      } catch (err) {
        console.error('Failed to load donation totals:', err);
      }

      // Load donation ledger
      try {
        const donationList = await api.get<Donation[]>(`/tickets/${ticketId}/donations`);
        setDonations(donationList);
      } catch (err) {
        console.error('Failed to load donations:', err);
      }
    } catch (error: any) {
      if (error.status === 404) {
        setError('Profile not found');
      } else if (error.status === 503) {
        setError('System unavailable due to database connectivity');
        setDbHealthy(false);
      } else {
        setError(error.message || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    setIsGeneratingQR(true);
    setQrError('');
    setQrCode(null);
    setCheckoutUrl(null);

    try {
      const amount = parseFloat(donationAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid donation amount');
      }

      const payload = {
        amount,
        currency: donationCurrency,
        description: donationDescription || `Support for ${ticket?.displayName || 'profile'}`,
      };

      const response = await api.post<{ qrCodeBase64: string; checkoutUrl: string }>(
        `/tickets/${ticketId}/create-payment`,
        payload
      );

      setQrCode(response.qrCodeBase64);
      setCheckoutUrl(response.checkoutUrl);
    } catch (error: any) {
      setQrError(error.message || 'Failed to generate donation QR code');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleLoadExistingQR = async () => {
    setIsGeneratingQR(true);
    setQrError('');

    try {
      const response = await api.get<{ qrCodeBase64: string; checkoutUrl: string }>(
        `/tickets/${ticketId}/qr-code`
      );
      setQrCode(response.qrCodeBase64);
      setCheckoutUrl(response.checkoutUrl);
      setShowDonateForm(true);
    } catch (error: any) {
      setQrError(error.message || 'No existing QR code found');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PAID': 'bg-green-100 text-green-800 border-green-300',
      'REFUNDED': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'DISPUTED': 'bg-red-100 text-red-800 border-red-300',
      'EXPIRED': 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/find"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/find"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Search
          </Link>
          
          <div className="flex items-center gap-4">
            <UserCircleIcon className="w-12 h-12 text-blue-600" />
            <div>
              <h1 className="text-3xl font-black text-gray-900">
                {ticket?.displayName || 'Anonymous Profile'}
              </h1>
              <p className="text-gray-600">Profile Details & Donations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* DB Offline Warning */}
        {!dbHealthy && (
          <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <p className="text-red-800 font-semibold">
              System offline - donation actions are temporarily disabled
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold text-gray-900">{ticket?.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-semibold text-gray-900">{formatDate(ticket?.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ticket ID</p>
                  <p className="font-mono text-xs text-gray-700 break-all">{ticket?.id}</p>
                </div>
              </div>
            </motion.div>

            {/* Donation Totals */}
            {donationTotal && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg p-6 border-2 border-green-200"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                  Donation Totals
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Total Received</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(donationTotal.totalPaid, donationTotal.currency)}
                    </p>
                  </div>
                  {donationTotal.totalRefunded > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Refunded</p>
                      <p className="text-lg font-semibold text-yellow-600">
                        {formatCurrency(donationTotal.totalRefunded, donationTotal.currency)}
                      </p>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-300">
                    <p className="text-sm text-gray-600">Net Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(donationTotal.netTotal, donationTotal.currency)}
                    </p>
                  </div>
                  {donationTotal.lastDonationAt && (
                    <div className="text-xs text-gray-500">
                      Last donation: {formatDate(donationTotal.lastDonationAt)}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Donations & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Donate Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Support This Profile</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Please verify:</strong> Only donate if you have verified this profile with the recipient. 
                  Care2Connect does not verify profile authenticity.
                </p>
              </div>

              {!showDonateForm ? (
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDonateForm(true)}
                    disabled={!dbHealthy}
                    className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
                  >
                    <QrCodeIcon className="w-6 h-6 inline mr-2" />
                    Generate Donation QR
                  </button>
                  <button
                    onClick={handleLoadExistingQR}
                    disabled={!dbHealthy || isGeneratingQR}
                    className="px-6 py-4 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Load Existing QR
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {!qrCode ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Amount
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                            <input
                              type="number"
                              value={donationAmount}
                              onChange={(e) => setDonationAmount(e.target.value)}
                              min="1"
                              step="0.01"
                              className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Currency
                          </label>
                          <select
                            value={donationCurrency}
                            onChange={(e) => setDonationCurrency(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                          >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Message (Optional)
                        </label>
                        <input
                          type="text"
                          value={donationDescription}
                          onChange={(e) => setDonationDescription(e.target.value)}
                          placeholder="Add a personal message"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                        />
                      </div>

                      {qrError && (
                        <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-red-800 text-sm">
                          {qrError}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={handleGenerateQR}
                          disabled={isGeneratingQR}
                          className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {isGeneratingQR ? 'Generating...' : 'Generate QR Code'}
                        </button>
                        <button
                          onClick={() => {
                            setShowDonateForm(false);
                            setQrCode(null);
                            setQrError('');
                          }}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="bg-white p-6 rounded-lg border-2 border-purple-300 inline-block">
                        <img
                          src={`data:image/png;base64,${qrCode}`}
                          alt="Donation QR Code"
                          className="w-64 h-64 mx-auto"
                        />
                      </div>
                      <div className="mt-4 space-y-3">
                        {checkoutUrl && (
                          <a
                            href={checkoutUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                          >
                            Open Checkout Page
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setShowDonateForm(false);
                            setQrCode(null);
                            loadProfileData();
                          }}
                          className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Donation Ledger */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Donation History</h2>
              
              {donations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No donations yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Donor</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Amount</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Status</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((donation) => (
                        <tr key={donation.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 text-sm">
                            {donation.donorLastName || 'Anonymous'}
                            {donation.donorCountry && (
                              <span className="text-xs text-gray-500 ml-1">({donation.donorCountry})</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-sm font-semibold">
                            {formatCurrency(donation.amount, donation.currency)}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(donation.status)}`}>
                              {donation.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-600">
                            {formatDate(donation.paidAt || donation.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
