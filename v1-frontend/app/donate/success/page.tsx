'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface DonationInfo {
  id: string
  amount: number
  clientSlug: string
  confirmed: boolean
  donorName?: string
  donorEmail?: string
  receiptUrl?: string
  verificationLink?: string
  receiptAvailable?: boolean
  emailSent?: boolean
  emailStatus?: string
}

export default function DonationSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [donationInfo, setDonationInfo] = useState<DonationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [receiptGenerating, setReceiptGenerating] = useState(false)

  useEffect(() => {
    if (sessionId) {
      loadDonationInfo()
    } else {
      setIsLoading(false)
    }
  }, [sessionId])

  const loadDonationInfo = async () => {
    try {
      setIsLoading(true)
      // Try to find donation by session ID from our mock data
      const response = await fetch('/api/admin/donations/ledger')
      
      if (response.ok) {
        const data = await response.json()
        const donation = data.ledgerEntries.find((entry: any) => entry.sessionId === sessionId)
        
        if (donation) {
          setDonationInfo({
            id: donation.donationId,
            amount: donation.amount,
            clientSlug: donation.clientProfile,
            confirmed: true,
            donorName: donation.donorName,
            donorEmail: donation.donorEmail,
            receiptUrl: donation.receiptUrl,
            receiptAvailable: !!donation.receiptUrl,
            emailSent: donation.emailSent,
            emailStatus: donation.emailStatus
          })
        } else {
          // Still processing - show pending state
          setDonationInfo({
            id: '',
            amount: 0,
            clientSlug: 'recipient',
            confirmed: false
          })
        }
      }
    } catch (error) {
      console.error('Failed to load donation info:', error)
      setDonationInfo({
        id: '',
        amount: 0,
        clientSlug: 'recipient',
        confirmed: false
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateReceipt = async () => {
    if (!donationInfo?.id) return
    
    setReceiptGenerating(true)
    try {
      const response = await fetch(`/api/receipts/generate/${donationInfo.id}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        setDonationInfo(prev => prev ? {
          ...prev,
          receiptUrl: result.receiptUrl,
          receiptAvailable: true
        } : null)
        
        // Open receipt in new tab
        window.open(`/api/receipts/view/${donationInfo.id}`, '_blank')
      }
    } catch (error) {
      console.error('Receipt generation error:', error)
    } finally {
      setReceiptGenerating(false)
    }
  }

  const viewReceipt = () => {
    if (donationInfo?.id) {
      window.open(`/api/receipts/view/${donationInfo.id}`, '_blank')
    }
  }

  const downloadReceiptPDF = () => {
    if (donationInfo?.receiptUrl) {
      const link = document.createElement('a')
      link.href = donationInfo.receiptUrl
      link.download = `receipt_${donationInfo.id}.pdf`
      link.click()
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card">
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }\n\n  return (\n    <div className=\"max-w-2xl mx-auto text-center\">\n      <div className=\"card\">\n        {/* Success Icon */}\n        <div className=\"mb-6\">\n          <div className=\"w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center\">\n            <svg className=\"w-10 h-10 text-green-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n              <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M5 13l4 4L19 7\" />\n            </svg>\n          </div>\n        </div>\n\n        <h1 className=\"text-3xl font-bold text-green-600 mb-4\">\n          🎉 Thank You for Your Donation!\n        </h1>\n        \n        <p className=\"text-lg text-gray-600 mb-6\">\n          Your payment has been successfully processed and your donation is being recorded.\n        </p>\n\n        {sessionId && (\n          <div className=\"bg-green-50 rounded-lg p-4 mb-6\">\n            <h3 className=\"font-medium text-green-900 mb-2\">Payment Details</h3>\n            <div className=\"text-sm text-green-800 space-y-1\">\n              <p><strong>Session ID:</strong> {sessionId}</p>\n              <p><strong>Status:</strong> Payment Successful</p>\n              <p><strong>Processing:</strong> Your donation will be confirmed shortly</p>\n            </div>\n          </div>\n        )}\n\n        <div className=\"space-y-4\">\n          <div className=\"text-gray-600\">\n            <h3 className=\"font-medium mb-2\">What happens next?</h3>\n            <ul className=\"text-sm space-y-2 text-left\">\n              <li>• Your payment will be processed by Stripe</li>\n              <li>• The recipient will be notified of your donation</li>\n              <li>• You'll receive an email confirmation (if provided)</li>\n              <li>• The funds will be available to help immediately</li>\n            </ul>\n          </div>\n\n          <div className=\"pt-6 space-y-3\">\n            <Link href=\"/\" className=\"btn-primary block\">\n              🏠 Return to Home\n            </Link>\n            \n            <Link href=\"/gfm/1-location\" className=\"btn-secondary block\">\n              💰 Create Your Own Fundraiser\n            </Link>\n          </div>\n        </div>\n\n        {/* Social Sharing */}\n        <div className=\"mt-8 pt-6 border-t\">\n          <h3 className=\"font-medium text-gray-900 mb-3\">Help Spread the Word</h3>\n          <p className=\"text-sm text-gray-600 mb-4\">\n            Share CareConnect to help more people in need connect with support.\n          </p>\n          <div className=\"flex justify-center space-x-4\">\n            <button className=\"text-blue-600 hover:text-blue-800 text-sm\">\n              📘 Share on Facebook\n            </button>\n            <button className=\"text-blue-400 hover:text-blue-600 text-sm\">\n              🐦 Share on Twitter\n            </button>\n            <button className=\"text-gray-600 hover:text-gray-800 text-sm\">\n              📧 Share via Email\n            </button>\n          </div>\n        </div>\n      </div>\n    </div>\n  )\n}