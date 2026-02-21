'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { HeartIcon } from '@heroicons/react/24/solid'
import { ShareIcon, CreditCardIcon } from '@heroicons/react/24/outline'

const suggestedAmounts = [
  { amount: 10, label: '$10' },
  { amount: 25, label: '$25' },
  { amount: 50, label: '$50' },
  { amount: 100, label: '$100' }
]

interface ClientInfo {
  name: string;
  story: string;
  summary?: string;
  goalAmount?: number;
  amountRaised?: number;
  donationCount?: number;
}

export default function DonatePage() {
  const params = useParams()
  const publicSlug = (params?.slug as string) || ''
  
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25)
  const [customAmount, setCustomAmount] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [donorMessage, setDonorMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: 'Community Member',
    story: 'This person is seeking support from the community to improve their situation and work towards stability.',
    summary: 'Help provide essential support for someone in our community.',
    goalAmount: 2500,
    amountRaised: 0,
    donationCount: 0
  })
  const [stripeConfigured, setStripeConfigured] = useState(false)

  useEffect(() => {
    checkStripeConfiguration()
    // In a real app, you'd fetch client info from your API using the publicSlug
    setClientInfo(prev => ({
      ...prev,
      name: publicSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }))
  }, [publicSlug])

  const checkStripeConfiguration = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/qr/status`)
      const data = await response.json()
      
      if (data.success) {
        setStripeConfigured(data.data.configured)
      }
    } catch (error) {
      console.error('Error checking Stripe status:', error)
    }
  }

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount('')
    setShowCustom(false)
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedAmount(numValue)
    } else {
      setSelectedAmount(null)
    }
  }

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedAmount || selectedAmount < 0.50) {
      toast.error('Minimum donation amount is $0.50')
      return
    }

    if (!stripeConfigured) {
      toast.error('Payment system is not configured. Please try again later.')
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/qr/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicSlug,
          amount: selectedAmount,
          donorEmail: donorEmail || undefined
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to Stripe checkout
        window.location.href = data.data.checkoutUrl
      } else {
        toast.error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Donation error:', error)
      toast.error('Failed to process donation. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied to clipboard!')
  }

  const progressPercentage = clientInfo.goalAmount ? 
    Math.min((clientInfo.amountRaised || 0) / clientInfo.goalAmount * 100, 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to CareConnect</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Story Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Support {clientInfo.name}
              </h1>
              
              {clientInfo.summary && (
                <p className="text-lg text-gray-600 mb-4">
                  {clientInfo.summary}
                </p>
              )}

              {/* Progress bar */}
              {clientInfo.goalAmount && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>${(clientInfo.amountRaised || 0).toLocaleString()} raised</span>
                    <span>${clientInfo.goalAmount.toLocaleString()} goal</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{clientInfo.donationCount || 0} supporters</span>
                    <span>{Math.round(progressPercentage)}% of goal</span>
                  </div>
                </div>
              )}

              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {clientInfo.story}
                </p>
              </div>
            </div>

            {/* Share section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Share this campaign:</span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <ShareIcon className="w-4 h-4" />
                  Copy Link
                </button>
              </div>
            </div>
          </div>

          {/* Donation Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <HeartIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Make a Donation
              </h2>
              <p className="text-gray-600">
                Your support makes a real difference
              </p>
            </div>

            {!stripeConfigured && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> The payment system is currently being set up. 
                  Please check back soon to make a donation.
                </p>
              </div>
            )}

            <form onSubmit={handleDonate} className="space-y-6">
              {/* Amount Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Amount (USD)
                </label>
                
                {/* Suggested amounts */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {suggestedAmounts.map(({ amount, label }) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleAmountSelect(amount)}
                      className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                        selectedAmount === amount && !showCustom
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowCustom(!showCustom)}
                    className="text-blue-600 text-sm hover:text-blue-700 transition-colors"
                  >
                    {showCustom ? 'Hide custom amount' : 'Enter custom amount'}
                  </button>
                  
                  {showCustom && (
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="Enter amount"
                      min="0.50"
                      step="0.01"
                    />
                  )}
                </div>
              </div>

              {/* Optional donor info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="your@email.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For donation receipt (optional)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message (Optional)
                  </label>
                  <textarea
                    value={donorMessage}
                    onChange={(e) => setDonorMessage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    rows={3}
                    placeholder="Leave a message of support..."
                  />
                </div>
              </div>

              {/* Donation button */}
              <button
                type="submit"
                disabled={!selectedAmount || selectedAmount < 0.50 || !stripeConfigured || isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="w-5 h-5" />
                    <span>
                      Donate {selectedAmount ? `$${selectedAmount}` : ''} with Card
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Security notice */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                🔒 Secure payment powered by Stripe. Your card information is never stored by CareConnect.
              </p>
            </div>

            {/* Alternative ways to help */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Other ways to help:
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Share this page with friends and family</li>
                <li>• Connect with local support organizations</li>
                <li>• Offer resources or job opportunities if available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}