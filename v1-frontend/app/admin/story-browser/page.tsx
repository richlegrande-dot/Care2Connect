'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Recording {
  id: string;
  recordingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  audioUrl: string;
  duration: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface EventLog {
  id: string;
  event: string;
  metadata: any;
  createdAt: string;
}

interface RecordingDetail extends Recording {
  transcript: string | null;
  eventLogs: EventLog[];
}

export default function StoryBrowser() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<RecordingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  // Load recordings
  useEffect(() => {
    if (!loading) {
      loadRecordings();
    }
  }, [page, statusFilter]);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/me', {
        credentials: 'include',
      });

      if (!response.ok) {
        router.push('/admin/login');
        return;
      }

      setLoading(false);
    } catch (err) {
      console.error('Auth check failed:', err);
      router.push('/admin/login');
    }
  };

  const loadRecordings = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(
        `http://localhost:3001/api/admin/story-list?${params}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to load recordings');
      }

      const data = await response.json();
      setRecordings(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err) {
      console.error('Load recordings error:', err);
      setError('Failed to load recordings');
    }
  };

  const loadRecordingDetail = async (id: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/story/${id}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to load recording detail');
      }

      const data = await response.json();
      setSelectedRecording(data.data);
      setDrawerOpen(true);
    } catch (err) {
      console.error('Load recording detail error:', err);
      setError('Failed to load recording detail');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3001/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadRecordings();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Story Browser</h1>
              <p className="text-sm text-gray-600 mt-1">
                {total} total recordings
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search (Name/Email/Phone)
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">All</option>
                  <option value="NEW">New</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="COMPLETE">Complete</option>
                  <option value="TRANSCRIBED">Transcribed</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Recordings Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Contact (Masked)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Recording ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recordings.map((recording) => (
                  <tr
                    key={recording.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => loadRecordingDetail(recording.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {recording.userName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div>{recording.userEmail}</div>
                      <div>{recording.userPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                      {recording.recordingId.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDuration(recording.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        recording.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                        recording.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                        recording.status === 'COMPLETE' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {recording.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(recording.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          loadRecordingDetail(recording.id);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {recordings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No recordings found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Previous
            </button>
            
            <span className="text-gray-700 font-medium">
              Page {page} of {totalPages}
            </span>
            
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {drawerOpen && selectedRecording && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recording Detail</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Audio Player */}
              <div className="bg-gray-100 rounded-lg p-6 mb-6">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Audio Recording</h3>
                <audio
                  controls
                  className="w-full"
                  src={`http://localhost:3001${selectedRecording.audioUrl.replace('http://localhost:3001', '')}`}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">User Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Name:</span>
                    <p className="text-gray-900 font-medium">{selectedRecording.userName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Email (Masked):</span>
                    <p className="text-gray-900">{selectedRecording.userEmail}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Phone (Masked):</span>
                    <p className="text-gray-900">{selectedRecording.userPhone}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">User ID:</span>
                    <p className="text-xs font-mono text-gray-700">{selectedRecording.userId}</p>
                  </div>
                </div>
              </div>

              {/* Recording Info */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Recording Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Recording ID:</span>
                    <p className="text-xs font-mono text-gray-700">{selectedRecording.recordingId}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Duration:</span>
                    <p className="text-gray-900">{formatDuration(selectedRecording.duration)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Status:</span>
                    <p className="text-gray-900">{selectedRecording.status}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Created:</span>
                    <p className="text-gray-900">{formatDate(selectedRecording.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Updated:</span>
                    <p className="text-gray-900">{formatDate(selectedRecording.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Event Log */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Event History</h3>
                <div className="space-y-3">
                  {selectedRecording.eventLogs.map((log) => (
                    <div key={log.id} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-900">{log.event}</span>
                        <span className="text-xs text-gray-500">{formatDate(log.createdAt)}</span>
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="text-xs text-gray-600 mt-2">
                          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                  {selectedRecording.eventLogs.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No events recorded</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
