'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface DonationVerification {
  id: string
  amount: number
  date: string
  donorName: string
  clientProfile: string
  verified: boolean
  organizationInfo: {
    name: string
    ein: string
    address: string
  }
}

export default function DonationVerifyPage() {
  const params = useParams()
  const donationId = params.id as string
  
  const [verification, setVerification] = useState<DonationVerification | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (donationId) {
      verifyDonation()
    }
  }, [donationId])

  const verifyDonation = async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch(`/api/verify/donation/${donationId}`)
      
      if (response.ok) {
        const data = await response.json()
        setVerification(data)
      } else if (response.status === 404) {
        setError('Donation not found or verification failed')
      } else {
        setError('Unable to verify donation at this time')
      }
    } catch (err) {
      console.error('Verification error:', err)
      setError('Network error - please try again')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="animate-pulse space-y-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded mx-auto w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mx-auto w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Verification Failed
          </h1>
          
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          
          <div className="bg-red-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-red-900 mb-2">Possible Reasons:</h3>
            <ul className="text-sm text-red-800 text-left space-y-1">
              <li>• The donation ID is invalid or doesn't exist</li>
              <li>• The receipt may have been issued by a different organization</li>
              <li>• There may be a temporary system issue</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={verifyDonation}
              className="btn-secondary"
            >
              🔄 Try Again
            </button>
            <Link href="/" className="btn-primary block">
              🏠 Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        {/* Verification Success */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            ✅ Donation Verified
          </h1>
          
          <p className="text-lg text-gray-600">
            This is a valid tax-deductible donation receipt
          </p>
        </div>

        {/* Donation Details */}
        {verification && (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-green-900 mb-4">
                Verified Donation Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-green-700">Donation ID:</span>
                    <div className="font-mono text-sm bg-white px-2 py-1 rounded border">
                      {verification.id}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-green-700">Amount:</span>
                    <div className="text-2xl font-bold text-green-900">
                      ${verification.amount.toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-green-700">Date:</span>
                    <div className="text-gray-900">
                      {new Date(verification.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-green-700">Donor:</span>
                    <div className="text-gray-900">
                      {verification.donorName}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-green-700">Beneficiary:</span>
                    <div className="text-gray-900">
                      {verification.clientProfile}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-green-700">Status:</span>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <span className="text-gray-900 font-medium">Verified & Valid</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Organization Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Issuing Organization
              </h2>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Organization:</span>
                  <div className="text-gray-900 font-medium">
                    {verification.organizationInfo.name}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Tax ID (EIN):</span>
                  <div className="font-mono text-gray-900">
                    {verification.organizationInfo.ein}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Address:</span>
                  <div className="text-gray-900">
                    {verification.organizationInfo.address}
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Information */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-bold text-blue-900 mb-4">
                📋 Tax Information
              </h2>
              
              <div className="space-y-3 text-sm">
                <p>
                  <strong>IRS Compliance:</strong> This receipt meets IRS requirements for 
                  charitable contribution documentation under Publication 1771.
                </p>
                
                <p>
                  <strong>Deductibility:</strong> No goods or services were provided in 
                  exchange for this contribution, making it fully tax-deductible.
                </p>
                
                <p>
                  <strong>Recommendation:</strong> Please retain this receipt for your tax 
                  records and consult your tax advisor regarding charitable deductions.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-3 pt-4">
              <Link 
                href={`/api/receipts/view/${verification.id}`}
                target="_blank"
                className="btn-primary text-center"
              >
                📄 View Full Receipt
              </Link>
              
              <button
                onClick={() => window.print()}
                className="btn-secondary"
              >
                🖨️ Print This Verification
              </button>
              
              <Link href="/" className="btn-secondary text-center">
                🏠 Return to Home
              </Link>
            </div>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Secure Verification
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              IRS Compliant
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              CareConnect Verified
            </div>
          </div>
          
          <p className="text-center text-xs text-gray-400 mt-3">
            Verification completed on {new Date().toLocaleDateString('en-US')} via CareConnect
          </p>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .btn-primary, .btn-secondary {
            display: none !important;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  )
}