'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MagnifyingGlassIcon, 
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Link from 'next/link'

// API base URL resolution
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3003';
    }
    
    if (hostname === 'care2connects.org' || hostname === 'www.care2connects.org') {
      return 'https://api.care2connects.org';
    }
  }
  
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
};

interface ProfileTicket {
  id: string
  name?: string
  location?: string
  status: string
  createdAt: string
  updatedAt: string
  qrCodeUrl?: string
  gofundmeDraftUrl?: string
  story?: string
}

export default function ProfilesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ProfileTicket[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSupportForm, setShowSupportForm] = useState(false)

  // Support form state
  const [supportCategory, setSupportCategory] = useState('general')
  const [supportMessage, setSupportMessage] = useState('')
  const [supportContact, setSupportContact] = useState('')
  const [supportTicketId, setSupportTicketId] = useState('')
  const [isSubmittingSupportTicket, setIsSubmittingSupportTicket] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a ticket ID to search')
      return
    }

    setIsSearching(true)

    try {
      const apiBaseUrl = getApiBaseUrl()
      const response = await fetch(`${apiBaseUrl}/api/story/${searchQuery.trim()}/status`)

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Ticket not found. Please check the ID and try again.')
          setSearchResults([])
        } else {
          throw new Error('Failed to search for ticket')
        }
      } else {
        const data = await response.json()

        // Get full ticket details
        const ticketResponse = await fetch(`${apiBaseUrl}/api/profile/${searchQuery.trim()}`)
        let ticketData = null
        if (ticketResponse.ok) {
          ticketData = await ticketResponse.json()
        }

        // Combine status and details
        setSearchResults([
          {
            id: searchQuery.trim(),
            status: data.status,
            name: ticketData?.name,
            location: ticketData?.location,
            createdAt: ticketData?.createdAt || new Date().toISOString(),
            updatedAt: ticketData?.updatedAt || new Date().toISOString(),
            qrCodeUrl: data.assetsReady ? `${apiBaseUrl}/api/profile/${searchQuery.trim()}/qrcode.png` : undefined,
            gofundmeDraftUrl: data.assetsReady ? `${apiBaseUrl}/api/profile/${searchQuery.trim()}/gofundme-draft.docx` : undefined,
            story: ticketData?.story,
          },
        ])

        toast.success('Ticket found!')
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Failed to search. Please try again.')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleResume = (ticketId: string) => {
    router.push(`/profile/${ticketId}`)
  }

  const handleSubmitSupportTicket = async () => {
    if (!supportMessage.trim()) {
      toast.error('Please enter a message')
      return
    }

    setIsSubmittingSupportTicket(true)

    try {
      const apiBaseUrl = getApiBaseUrl()
      const response = await fetch(`${apiBaseUrl}/api/support/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: supportTicketId.trim() || null,
          category: supportCategory,
          message: supportMessage,
          contact: supportContact.trim() || null,
          systemSnapshot: {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit support ticket')
      }

      toast.success('Support ticket submitted successfully!')

      // Reset form
      setSupportCategory('general')
      setSupportMessage('')
      setSupportContact('')
      setSupportTicketId('')
      setShowSupportForm(false)
    } catch (error) {
      console.error('Support ticket error:', error)
      toast.error('Failed to submit support ticket. Please try again.')
    } finally {
      setIsSubmittingSupportTicket(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />
      case 'FAILED':
        return <XCircleIcon className="w-6 h-6 text-red-500" />
      case 'PROCESSING':
      case 'TRANSCRIBING':
      case 'ANALYZING':
      case 'GENERATING_QR':
      case 'GENERATING_DOC':
        return <ClockIcon className="w-6 h-6 text-yellow-500 animate-spin" />
      default:
        return <QuestionMarkCircleIcon className="w-6 h-6 text-gray-400" />
    }
  }

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      CREATED: 'Created',
      UPLOADING: 'Uploading',
      TRANSCRIBING: 'Transcribing',
      ANALYZING: 'Analyzing',
      GENERATING_QR: 'Generating QR Code',
      GENERATING_DOC: 'Generating Document',
      COMPLETED: 'Completed',
      FAILED: 'Failed',
    }
    return statusMap[status] || status
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Search Your Profile</h1>
          <p className="text-lg text-gray-600">
            Enter your ticket ID to find and resume your profile
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">
                Ticket ID
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter your ticket ID (e.g., abc123-def456-ghi789)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center"
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>
              <strong>Tip:</strong> Your ticket ID was provided after you recorded your story. Check your email or notes.
            </p>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Results</h2>

            {searchResults.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(ticket.status)}
                      <h3 className="text-xl font-semibold text-gray-900">
                        {ticket.name || 'Anonymous User'}
                      </h3>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      <p>
                        <strong>Ticket ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{ticket.id}</code>
                      </p>
                      {ticket.location && (
                        <p>
                          <strong>Location:</strong> {ticket.location}
                        </p>
                      )}
                      <p>
                        <strong>Status:</strong>{' '}
                        <span className={`font-medium ${
                          ticket.status === 'COMPLETED' ? 'text-green-600' :
                          ticket.status === 'FAILED' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {getStatusText(ticket.status)}
                        </span>
                      </p>
                      <p>
                        <strong>Created:</strong> {formatDate(ticket.createdAt)}
                      </p>
                      <p>
                        <strong>Last Updated:</strong> {formatDate(ticket.updatedAt)}
                      </p>
                    </div>

                    {/* Assets Available */}
                    {ticket.status === 'COMPLETED' && (
                      <div className="flex gap-2 mb-4 text-sm">
                        {ticket.qrCodeUrl && (
                          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            QR Code Ready
                          </span>
                        )}
                        {ticket.gofundmeDraftUrl && (
                          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Document Ready
                          </span>
                        )}
                        {ticket.story && (
                          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Transcript Available
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => handleResume(ticket.id)}
                      className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                      Resume
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {searchQuery && searchResults.length === 0 && !isSearching && (
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No profile found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find a profile with that ticket ID. Please check the ID and try again.
            </p>
            <Link
              href="/tell-your-story"
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
            >
              Create a New Profile
            </Link>
          </div>
        )}

        {/* Support Ticket Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-12">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Need Help?</h2>
              <p className="text-gray-600">
                Having trouble finding your profile or experiencing issues? Submit a support ticket.
              </p>
            </div>
            {!showSupportForm && (
              <button
                onClick={() => setShowSupportForm(true)}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Get Support
              </button>
            )}
          </div>

          {showSupportForm && (
            <div className="mt-6 space-y-4 border-t pt-6">
              <div>
                <label htmlFor="support-ticket-id" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Ticket ID (Optional)
                </label>
                <input
                  type="text"
                  id="support-ticket-id"
                  value={supportTicketId}
                  onChange={(e) => setSupportTicketId(e.target.value)}
                  placeholder="If you have one"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="support-category" className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Category
                </label>
                <select
                  id="support-category"
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="general">General Question</option>
                  <option value="cannot-find-profile">Can't Find My Profile</option>
                  <option value="processing-stuck">Processing Stuck/Failed</option>
                  <option value="missing-assets">Missing QR Code or Document</option>
                  <option value="technical-issue">Technical Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="support-message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="support-message"
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  rows={4}
                  placeholder="Please describe your issue..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="support-contact" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact (Email or Phone) (Optional)
                </label>
                <input
                  type="text"
                  id="support-contact"
                  value={supportContact}
                  onChange={(e) => setSupportContact(e.target.value)}
                  placeholder="How can we reach you?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmitSupportTicket}
                  disabled={isSubmittingSupportTicket}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isSubmittingSupportTicket ? 'Submitting...' : 'Submit Ticket'}
                </button>
                <button
                  onClick={() => setShowSupportForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
