'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface DonationInfo {
  recordingId: string
  title: string
  excerpt: string
  goal: number | null
  firstName: string
  createdAt: string
}

export default function DonatePage() {
  const params = useParams()
  const recordingId = params.id as string
  
  const [donation, setDonation] = useState<DonationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [donationAmount, setDonationAmount] = useState('25')
  const [isProcessing, setIsProcessing] = useState(false)
  const [stripeConfigured, setStripeConfigured] = useState(true)

  useEffect(() => {
    fetchDonationInfo()
  }, [recordingId])

  const fetchDonationInfo = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/donations/recording/${recordingId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('This donation page has not been set up yet.')
        }
        throw new Error('Failed to load donation information')
      }
      
      const data = await response.json()
      setDonation(data.donation)
    } catch (err: any) {
      console.error('Failed to fetch donation info:', err)
      setError(err.message || 'Failed to load donation information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    try {
      const amountCents = parseInt(donationAmount) * 100
      
      // Create Stripe checkout session
      const response = await fetch('http://localhost:3001/api/payments/create-donation-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordingId,
          amountCents,
          metadata: {
            title: donation?.title || 'Story Donation',
            recordingId
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.code === 'STRIPE_NOT_CONFIGURED') {
          setStripeConfigured(false)
          return
        }
        throw new Error('Failed to create payment session')
      }

      const data = await response.json()
      
      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl
      
    } catch (err) {
      console.error('Donation error:', err)
      setError('Failed to process donation. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading donation page...</p>
        </div>
      </div>
    )
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card bg-red-50 border-2 border-red-200 text-center">
            <svg className="w-16 h-16 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-red-900 mb-2">Page Not Available</h2>
            <p className="text-red-800 mb-6">{error}</p>
            <Link href="/" className="btn-primary">
              Go to Home Page
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-semibold">CareConnect</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Stripe Not Configured Banner */}
        {!stripeConfigured && (
          <div className="card bg-yellow-50 border-2 border-yellow-300 mb-8 animate-fade-in">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-bold text-yellow-900 mb-1">Donations Not Enabled</h3>
                <p className="text-yellow-800 text-sm">
                  Donations are not currently enabled in this environment. This page is for preview/testing only.
                  In production, you'll be able to donate securely with a credit or debit card.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Story Section */}
          <div className="md:col-span-2 space-y-6">
            {/* Title Card */}
            <div className="card animate-slide-down">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {donation.title}
                  </h1>
                  <p className="text-gray-600">
                    Supporting {donation.firstName}'s journey
                  </p>
                </div>
              </div>
            </div>

            {/* Story Content */}
            <div className="card animate-fade-in" style={{animationDelay: '100ms'}}>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Their Story
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {donation.excerpt}
                </p>
              </div>
            </div>

            {/* Shared via CareConnect */}
            <div className="card bg-blue-50 border-2 border-blue-100">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-900">
                    <strong>Shared via CareConnect Portal</strong> — This story was recorded to help connect people experiencing homelessness with housing, basic needs, and stability.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Donation Form Sidebar */}
          <div className="md:col-span-1">
            <div className="card sticky top-4 animate-fade-in" style={{animationDelay: '200ms'}}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Make a Donation</h2>
              
              {donation.goal && (
                <div className="mb-6 pb-6 border-b-2 border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Fundraising Goal</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    ${(donation.goal / 100).toLocaleString()}
                  </p>
                </div>
              )}

              <form onSubmit={handleDonate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Donation Amount (USD)
                  </label>
                  
                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {['10', '25', '50'].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setDonationAmount(amount)}
                        className={`px-4 py-2 rounded-lg border-2 font-semibold transition-all ${
                          donationAmount === amount
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount Input */}
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    min="1"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg font-semibold"
                    placeholder="Enter amount"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Or enter a custom amount
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !stripeConfigured}
                  className="btn-primary w-full text-lg py-4"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : stripeConfigured ? (
                    'Donate with Card'
                  ) : (
                    'Donations Not Available'
                  )}
                </button>

                <div className="text-center pt-4 border-t-2 border-gray-100">
                  <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secure payment via Stripe
                  </p>
                </div>
              </form>
            </div>

            {/* Share Section */}
            <div className="card mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Share This Story</h3>
              <p className="text-sm text-gray-600 mb-4">
                Help spread the word by sharing this page with others.
              </p>
              <button
                onClick={() => {
                  const url = window.location.href
                  navigator.clipboard.writeText(url)
                  alert('Link copied to clipboard!')
                }}
                className="btn-secondary w-full inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t-2 border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} CareConnect. Helping connect people with housing and basic needs.
          </p>
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Learn More About CareConnect
          </Link>
        </div>
      </footer>
    </div>
  )
}
