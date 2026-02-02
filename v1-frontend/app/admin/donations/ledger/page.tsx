'use client'

import { useState, useEffect } from 'react'

interface DonationLedgerEntry {
  donationId: string
  donorName: string
  donorEmail: string
  clientProfile: string
  amount: number
  date: string
  paymentIntentId: string
  receiptUrl?: string
  verificationLink: string
}

interface LedgerSummary {
  totalDonations: number
  totalAmount: number
  uniqueDonors: number
  dateRange: {
    start: string
    end: string
  }
}

interface ClientTotal {
  clientSlug: string
  donationCount: number
  totalAmount: number
}

interface LedgerData {
  ledgerEntries: DonationLedgerEntry[]
  summary: LedgerSummary
  clientTotals: ClientTotal[]
}

export default function DonationLedgerPage() {
  const [ledgerData, setLedgerData] = useState<LedgerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    clientSlug: ''
  })
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    loadLedgerData()
  }, [])

  const loadLedgerData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)  
      if (filters.clientSlug) params.append('clientSlug', filters.clientSlug)

      const response = await fetch(`/api/admin/donations/ledger?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLedgerData(data)
      } else {
        console.error('Failed to load ledger data')
      }
    } catch (error) {
      console.error('Ledger load error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const applyFilters = () => {
    loadLedgerData()
  }

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      clientSlug: ''
    })
    setTimeout(() => loadLedgerData(), 100)
  }

  const exportCSV = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.clientSlug) params.append('clientSlug', filters.clientSlug)

      const response = await fetch(`/api/admin/donations/export/csv?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `donation_ledger_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const generateReceipt = async (donationId: string) => {
    try {
      const response = await fetch(`/api/receipts/generate/${donationId}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        // Refresh ledger to show updated receipt URL
        loadLedgerData()
        
        // Open receipt in new tab
        window.open(`/api/receipts/view/${donationId}`, '_blank')
      } else {
        console.error('Failed to generate receipt')
      }
    } catch (error) {
      console.error('Receipt generation error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Donation Ledger
        </h1>
        <p className="text-gray-600">
          Complete record of all donations with filtering, export, and receipt generation.
        </p>
      </div>

      {/* Summary Cards */}
      {ledgerData?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">
              ${ledgerData.summary.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-600">Total Raised</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">
              {ledgerData.summary.totalDonations}
            </div>
            <div className="text-sm text-gray-600">Total Donations</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-600">
              {ledgerData.summary.uniqueDonors}
            </div>
            <div className="text-sm text-gray-600">Unique Donors</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-orange-600">
              ${ledgerData.summary.totalDonations > 0 ? (ledgerData.summary.totalAmount / ledgerData.summary.totalDonations).toFixed(2) : '0.00'}
            </div>
            <div className="text-sm text-gray-600">Average Donation</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="form-input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date  
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="form-input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <input
              type="text"
              placeholder="Client slug"
              value={filters.clientSlug}
              onChange={(e) => handleFilterChange('clientSlug', e.target.value)}
              className="form-input"
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={applyFilters}
              className="btn-primary"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="btn-secondary"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={exportCSV}
            disabled={isExporting}
            className="btn-secondary"
          >
            {isExporting ? 'Exporting...' : '📊 Export CSV'}
          </button>
        </div>
      </div>

      {/* Client Totals */}
      {ledgerData?.clientTotals && ledgerData.clientTotals.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Client Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ledgerData.clientTotals.map((client) => (
              <div key={client.clientSlug} className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-900">{client.clientSlug}</div>
                <div className="text-sm text-gray-600">
                  {client.donationCount} donations • ${client.totalAmount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Donations Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Donation Records ({ledgerData?.ledgerEntries.length || 0})
          </h2>
        </div>
        
        {ledgerData?.ledgerEntries && ledgerData.ledgerEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ledgerData.ledgerEntries.map((entry) => (
                  <tr key={entry.donationId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.date).toLocaleDateString('en-US')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.donorName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {entry.donorEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.clientProfile}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${entry.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {entry.paymentIntentId ? (
                        <span title={entry.paymentIntentId}>
                          {entry.paymentIntentId.substring(0, 20)}...
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {entry.receiptUrl ? (
                          <>
                            <a
                              href={`/api/receipts/view/${entry.donationId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              📄 View
                            </a>
                            <a
                              href={entry.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"  
                              className="text-green-600 hover:text-green-700"
                            >
                              📥 PDF
                            </a>
                          </>
                        ) : (
                          <button
                            onClick={() => generateReceipt(entry.donationId)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            📄 Generate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No donations found matching the current filters.
          </div>
        )}
      </div>
    </div>
  )
}