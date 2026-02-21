'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface EmailLog {
  id: number
  donorEmail: string
  subject: string
  type: string
  status: string
  timestamp: string
  provider: string
}

export default function EmailStatementsPage() {
  const [donors, setDonors] = useState<string[]>([])
  const [selectedDonor, setSelectedDonor] = useState('')
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null)
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
  const [providerStatus, setProviderStatus] = useState<any>(null)

  useEffect(() => {
    loadDonors()
    loadEmailLogs()
    loadProviderStatus()
  }, [])

  const loadDonors = async () => {
    try {
      const response = await fetch('/api/admin/donations/ledger')
      if (response.ok) {
        const data = await response.json()
        const uniqueDonors = [...new Set(
          data.ledgerEntries
            .filter((entry: any) => entry.donorEmail && entry.donorEmail !== 'Not provided')
            .map((entry: any) => entry.donorEmail)
        )]
        setDonors(uniqueDonors.sort())
      }
    } catch (error) {
      console.error('Failed to load donors:', error)
    }
  }

  const loadEmailLogs = async () => {
    try {
      const response = await fetch('/api/admin/emails/logs?type=annual')
      if (response.ok) {
        const data = await response.json()
        setEmailLogs(data.logs)
      }
    } catch (error) {
      console.error('Failed to load email logs:', error)
    }
  }

  const loadProviderStatus = async () => {
    try {
      const response = await fetch('/api/admin/emails/status')
      if (response.ok) {
        const data = await response.json()
        setProviderStatus(data)
      }
    } catch (error) {
      console.error('Failed to load provider status:', error)
    }
  }

  const sendAnnualStatement = async () => {
    if (!selectedDonor) {
      setMessage({ type: 'error', text: 'Please select a donor' })
      return
    }

    setIsSending(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/donations/email-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorEmail: selectedDonor,
          year: parseInt(year)
        })
      })

      const result = await response.json()

      if (response.ok) {
        if (result.emailStatus === 'sent') {
          setMessage({ 
            type: 'success', 
            text: `Annual statement successfully emailed to ${selectedDonor}` 
          })
        } else if (result.emailStatus === 'skipped_no_keys') {
          setMessage({ 
            type: 'info', 
            text: 'Email provider not configured. Statement generated and logged, but not sent. Configure email keys to enable delivery.' 
          })
        } else {
          setMessage({ 
            type: 'error', 
            text: `Email failed: ${result.message || 'Unknown error'}` 
          })
        }
        
        // Refresh logs
        loadEmailLogs()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send statement' })
      }
    } catch (error) {
      console.error('Send statement error:', error)
      setMessage({ type: 'error', text: 'Network error - please try again' })
    } finally {
      setIsSending(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">✅ Sent</span>
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">❌ Failed</span>
      case 'skipped_no_keys':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">⚠️ No Keys</span>
      case 'logged_only':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">📝 Logged</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          📧 Email Annual Statements
        </h1>
        <p className="text-gray-600">
          Send itemized annual donation summaries to donors for tax reporting purposes.
        </p>
      </div>

      {/* Provider Status */}
      {providerStatus && (
        <div className={`card mb-8 ${providerStatus.mode === 'LIVE' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Email Provider Status</h3>
              <div className="text-sm space-y-1">
                <p><strong>Mode:</strong> {providerStatus.mode} {providerStatus.mode === 'LIVE' ? '✅' : '⚠️'}</p>
                <p><strong>Provider:</strong> {providerStatus.provider === 'none' ? 'Not configured' : providerStatus.provider}</p>
                <p><strong>Can Send Emails:</strong> {providerStatus.capabilities.canSendEmails ? 'Yes' : 'No (will log only)'}</p>
              </div>
            </div>
            {providerStatus.mode === 'TEST/NO_KEYS' && (
              <div className="text-sm text-yellow-800 bg-yellow-100 px-4 py-2 rounded">
                <strong>⚠️ Test Mode:</strong> Emails will be logged but not sent. Configure EMAIL_PROVIDER and API keys to enable delivery.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`card mb-6 ${
          message.type === 'success' ? 'bg-green-50 border-green-200' :
          message.type === 'error' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <p className={`${
            message.type === 'success' ? 'text-green-800' :
            message.type === 'error' ? 'text-red-800' :
            'text-blue-800'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Send Statement Form */}
      <div className="card mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Send Annual Statement</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Donor
            </label>
            <select
              value={selectedDonor}
              onChange={(e) => setSelectedDonor(e.target.value)}
              className="form-input"
              disabled={isSending}
            >
              <option value="">Choose donor...</option>
              {donors.map((donor) => (
                <option key={donor} value={donor}>
                  {donor}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="form-input"
              disabled={isSending}
            >
              {[...Array(5)].map((_, i) => {
                const y = new Date().getFullYear() - i
                return <option key={y} value={y}>{y}</option>
              })}
            </select>
          </div>
        </div>

        <button
          onClick={sendAnnualStatement}
          disabled={isSending || !selectedDonor}
          className="btn-primary"
        >
          {isSending ? '📧 Sending...' : '📧 Send Annual Statement'}
        </button>

        <p className="text-xs text-gray-500 mt-2">
          This will generate an itemized PDF statement and email it to the donor. 
          {providerStatus?.mode === 'TEST/NO_KEYS' && ' (Currently in test mode - will log only)'}
        </p>
      </div>

      {/* Email Logs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Email History</h2>
          <button
            onClick={loadEmailLogs}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            🔄 Refresh
          </button>
        </div>

        {emailLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-700">Date/Time</th>
                  <th className="text-left p-3 font-medium text-gray-700">Recipient</th>
                  <th className="text-left p-3 font-medium text-gray-700">Subject</th>
                  <th className="text-left p-3 font-medium text-gray-700">Type</th>
                  <th className="text-left p-3 font-medium text-gray-700">Status</th>
                  <th className="text-left p-3 font-medium text-gray-700">Provider</th>
                </tr>
              </thead>
              <tbody>
                {emailLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 text-sm">
                      {log.donorEmail}
                    </td>
                    <td className="p-3 text-sm">
                      {log.subject}
                    </td>
                    <td className="p-3 text-sm">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {log.type}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {log.provider}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>No email history yet</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex space-x-4">
        <Link href="/admin/donations/ledger" className="btn-secondary">
          ← Back to Ledger
        </Link>
        <Link href="/admin/donations/statements" className="btn-secondary">
          📊 View Statements
        </Link>
      </div>
    </div>
  )
}