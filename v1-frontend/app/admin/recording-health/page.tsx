'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface HealthSummary {
  totalIssuesLast24h: number;
  offlineSavesLast24h: number;
  mostCommonErrorName: string | null;
  issuesByErrorType: Record<string, number>;
  lastIssueAt: string | null;
}

interface RecordingIssue {
  id: string;
  kioskId: string;
  connectivity: string;
  errorName: string;
  permissionState: string | null;
  hasAudioInput: boolean | null;
  userAgentSnippet: string | null;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Error name to user-friendly description mapping
const ERROR_DESCRIPTIONS: Record<string, string> = {
  'NotAllowedError': 'Microphone access blocked',
  'PermissionDeniedError': 'Permission denied',
  'SecurityError': 'Security restriction',
  'NotFoundError': 'No microphone found',
  'DevicesNotFoundError': 'No audio devices',
  'NotReadableError': 'Microphone in use',
  'TrackStartError': 'Track start failed',
  'AbortError': 'Operation aborted',
  'OverconstrainedError': 'Settings mismatch',
  'ConstraintNotSatisfiedError': 'Constraint failed',
  'TypeError': 'Setup error',
};

export default function RecordingHealthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [summary, setSummary] = useState<HealthSummary | null>(null)
  const [issues, setIssues] = useState<RecordingIssue[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [errorNameFilter, setErrorNameFilter] = useState('')
  const [connectivityFilter, setConnectivityFilter] = useState('')
  const [timeWindowFilter, setTimeWindowFilter] = useState('24h')
  const [currentPage, setCurrentPage] = useState(1)

  // Check authentication
  useEffect(() => {
    checkAuth()
  }, [])

  // Fetch data on mount and every 60 seconds
  useEffect(() => {
    if (!isLoading) {
      fetchData()
      const interval = setInterval(fetchData, 60000) // 60 seconds
      return () => clearInterval(interval)
    }
  }, [isLoading, currentPage, errorNameFilter, connectivityFilter, timeWindowFilter])

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/me', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        router.push('/admin/login')
        return
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin/login')
    }
  }

  const fetchData = async () => {
    try {
      // Fetch summary
      const summaryRes = await fetch('http://localhost:3001/api/admin/recording-health-summary', {
        credentials: 'include'
      })
      
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json()
        setSummary(summaryData.summary)
      }
      
      // Build query params for issues
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: '20'
      })
      
      if (errorNameFilter) {
        params.append('errorName', errorNameFilter)
      }
      
      if (connectivityFilter) {
        params.append('connectivity', connectivityFilter)
      }
      
      if (timeWindowFilter !== 'all') {
        const since = new Date()
        if (timeWindowFilter === '1h') {
          since.setHours(since.getHours() - 1)
        } else if (timeWindowFilter === '24h') {
          since.setHours(since.getHours() - 24)
        } else if (timeWindowFilter === '7d') {
          since.setDate(since.getDate() - 7)
        }
        params.append('since', since.toISOString())
      }
      
      // Fetch issues
      const issuesRes = await fetch(`http://localhost:3001/api/admin/recording-issues?${params}`, {
        credentials: 'include'
      })
      
      if (issuesRes.ok) {
        const issuesData = await issuesRes.json()
        setIssues(issuesData.data)
        setPagination(issuesData.pagination)
      }
    } catch (error) {
      console.error('Data fetch error:', error)
      setError('Failed to load recording health data')
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const getErrorDescription = (errorName: string) => {
    return ERROR_DESCRIPTIONS[errorName] || errorName
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recording Health Monitor</h1>
              <p className="text-sm text-gray-600 mt-1">
                Track recording errors and network connectivity across kiosks
              </p>
            </div>
            <Link href="/admin/story-browser" className="btn-secondary">
              ← Back to Stories
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Privacy Note:</strong> These events help IT and staff monitor kiosks and network health. 
            They never include names, emails, or phone numbers.
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600">Issues (24h)</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{summary.totalIssuesLast24h}</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600">Offline Saves (24h)</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{summary.offlineSavesLast24h}</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600">Most Common Error</div>
              <div className="text-sm font-bold text-gray-900 mt-2">
                {summary.mostCommonErrorName ? getErrorDescription(summary.mostCommonErrorName) : 'None'}
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600">Last Issue</div>
              <div className="text-sm font-bold text-gray-900 mt-2">
                {summary.lastIssueAt ? formatTimeAgo(summary.lastIssueAt) : 'None'}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Window</label>
              <select
                value={timeWindowFilter}
                onChange={(e) => {
                  setTimeWindowFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Error Type</label>
              <select
                value={errorNameFilter}
                onChange={(e) => {
                  setErrorNameFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">All Errors</option>
                <option value="NotAllowedError">Permission Blocked</option>
                <option value="NotFoundError">No Microphone</option>
                <option value="NotReadableError">Microphone In Use</option>
                <option value="SecurityError">Security Error</option>
                <option value="AbortError">Aborted</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Connectivity</label>
              <select
                value={connectivityFilter}
                onChange={(e) => {
                  setConnectivityFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">All</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Issues Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Kiosk ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Connectivity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Error Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Permission
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No recording issues found
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatTimeAgo(issue.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {issue.kioskId}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          issue.connectivity === 'online' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {issue.connectivity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-700">
                        {issue.errorName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getErrorDescription(issue.errorName)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {issue.permissionState || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} issues
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
