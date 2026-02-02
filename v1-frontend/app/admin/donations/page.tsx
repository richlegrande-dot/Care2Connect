'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SkeletonCard, SkeletonTable } from '@/components/GlobalStates'

interface Donation {
  id: string;
  clientSlug: string;
  amountCents: number;
  status: string;
  stripeSessionId?: string;
  stripePaymentId?: string;
  donorEmail?: string;
  donorName?: string;
  createdAt: string;
}

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    succeeded: 0,
    pending: 0,
    failed: 0
  })

  useEffect(() => {
    loadDonations()
  }, [])

  const loadDonations = async () => {
    try {
      setLoading(true)
      
      // MINOR-02 Fix: Check if we should force empty state for testing
      const forceEmpty = typeof window !== 'undefined' && 
        window.localStorage.getItem('TEST_EMPTY_STATE') === 'true'
      
      if (forceEmpty) {
        setDonations([])
        setStats({ total: 0, totalAmount: 0, succeeded: 0, pending: 0, failed: 0 })
        return
      }
      
      // For V1, we'll use mock data since we don't have a full backend endpoint
      // In production, this would be: const response = await fetch('/api/admin/donations')
      
      // Mock data for demonstration
      const mockDonations: Donation[] = [
        {
          id: '1',
          clientSlug: 'marcus-123',
          amountCents: 2500,
          status: 'succeeded',
          stripeSessionId: 'cs_test_123',
          stripePaymentId: 'pi_test_123',
          donorEmail: 'donor@example.com',
          donorName: 'John Smith',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          clientSlug: 'sarah-456',
          amountCents: 5000,
          status: 'succeeded',
          stripeSessionId: 'cs_test_456',
          stripePaymentId: 'pi_test_456',
          donorEmail: 'helper@example.com',
          donorName: 'Jane Doe',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          clientSlug: 'alex-789',
          amountCents: 1000,
          status: 'pending',
          stripeSessionId: 'cs_test_789',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ]
      
      setDonations(mockDonations)
      
      // Calculate stats
      const total = mockDonations.length
      const totalAmount = mockDonations
        .filter(d => d.status === 'succeeded')
        .reduce((sum, d) => sum + d.amountCents, 0) / 100
      const succeeded = mockDonations.filter(d => d.status === 'succeeded').length
      const pending = mockDonations.filter(d => d.status === 'pending').length
      const failed = mockDonations.filter(d => d.status === 'failed').length
      
      setStats({ total, totalAmount, succeeded, pending, failed })
      
    } catch (error) {
      console.error('Failed to load donations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDonations = donations.filter(donation => {
    const matchesFilter = donation.clientSlug.toLowerCase().includes(filter.toLowerCase()) ||
                         donation.donorEmail?.toLowerCase().includes(filter.toLowerCase()) ||
                         donation.donorName?.toLowerCase().includes(filter.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || donation.status === statusFilter
    
    return matchesFilter && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatAmount = (amountCents: number) => {
    return `$${(amountCents / 100).toFixed(2)}`
  }

  // MINOR-01 Fix: Use design system skeleton components
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={5} columns={6} />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          💰 Donation Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor and manage donations across all CareConnect clients
        </p>
        
        {/* Navigation Links */}
        <div className="flex space-x-4 mt-4">
          <Link href="/admin/donations/ledger" className="btn-secondary">
            📊 Donation Ledger
          </Link>
          <Link href="/admin/donations/statements" className="btn-secondary">
            📄 Donor Statements
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Donations</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">${stats.totalAmount.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Raised</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.succeeded}</div>
          <div className="text-sm text-gray-600">Successful</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by client, donor name, or email..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Statuses</option>
              <option value="succeeded">Succeeded</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <button
              onClick={loadDonations}
              className="btn-secondary whitespace-nowrap"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium text-gray-700">Client</th>
                <th className="text-left p-3 font-medium text-gray-700">Amount</th>
                <th className="text-left p-3 font-medium text-gray-700">Status</th>
                <th className="text-left p-3 font-medium text-gray-700">Donor</th>
                <th className="text-left p-3 font-medium text-gray-700">Date</th>
                <th className="text-left p-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No donations found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredDonations.map((donation) => (
                  <tr key={donation.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium text-gray-900">{donation.clientSlug}</div>
                      <div className="text-sm text-gray-500">ID: {donation.id}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-900">
                        {formatAmount(donation.amountCents)}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {donation.donorName ? (
                        <div>
                          <div className="font-medium text-gray-900">{donation.donorName}</div>
                          <div className="text-sm text-gray-500">{donation.donorEmail}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Anonymous</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-gray-900">
                        {formatDate(donation.createdAt)}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Link
                          href={`/donate/${donation.clientSlug}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Page
                        </Link>
                        {donation.stripeSessionId && (
                          <button className="text-gray-600 hover:text-gray-800 text-sm">
                            View Details
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <Link href="/" className="btn-secondary">
          ← Back to Home
        </Link>
        
        <div className="space-x-4">
          <button className="btn-secondary">
            📊 Export Report
          </button>
          <button className="btn-primary">
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  )
}
