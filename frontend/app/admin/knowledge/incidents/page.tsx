'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPasswordGate } from '@/components/AdminPasswordGate';

interface PipelineIncident {
  id: string;
  ticketId: string | null;
  stage: string;
  severity: string;
  errorMessage: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  ticket?: {
    id: string;
    displayName: string | null;
    contactType: string;
    status: string;
  };
  knowledgeBindings: Array<{
    id: string;
    knowledgeChunkId: string;
    score: number | null;
  }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface IncidentStats {
  total: number;
  byStage: Record<string, number>;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
}

const SEVERITY_COLORS = {
  INFO: 'bg-blue-100 text-blue-800',
  WARN: 'bg-yellow-100 text-yellow-800',
  ERROR: 'bg-red-100 text-red-800',
  CRITICAL: 'bg-purple-100 text-purple-800',
};

const STATUS_COLORS = {
  OPEN: 'bg-orange-100 text-orange-800',
  RESOLVED: 'bg-green-100 text-green-800',
  AUTO_RESOLVED: 'bg-teal-100 text-teal-800',
};

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<PipelineIncident[]>([]);
  const [stats, setStats] = useState<IncidentStats | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [ticketIdFilter, setTicketIdFilter] = useState<string>('');

  useEffect(() => {
    fetchIncidents();
    fetchStats();
  }, [pagination.page, statusFilter, stageFilter, severityFilter, ticketIdFilter]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found');
      }

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter) params.append('status', statusFilter);
      if (stageFilter) params.append('stage', stageFilter);
      if (severityFilter) params.append('severity', severityFilter);
      if (ticketIdFilter) params.append('ticketId', ticketIdFilter);

      const response = await fetch(`http://localhost:3005/admin/incidents?${params}`, {
        headers: {
          'x-admin-password': token,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch incidents: ${response.statusText}`);
      }

      const data = await response.json();
      setIncidents(data.incidents);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching incidents:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const params = new URLSearchParams();
      if (ticketIdFilter) params.append('ticketId', ticketIdFilter);

      const response = await fetch(`http://localhost:3005/admin/incidents/stats?${params}`, {
        headers: {
          'x-admin-password': token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleRowClick = (incidentId: string) => {
    router.push(`/admin/knowledge/incidents/${incidentId}`);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setStageFilter('');
    setSeverityFilter('');
    setTicketIdFilter('');
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <AdminPasswordGate>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pipeline Incidents</h1>
            <p className="text-gray-600">
              Monitor pipeline failures and quality issues with Knowledge Vault recommendations
            </p>
          </div>

          {/* Statistics Dashboard */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Total Incidents</div>
                <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Open</div>
                <div className="text-3xl font-bold text-orange-600">
                  {stats.byStatus.OPEN || 0}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Resolved</div>
                <div className="text-3xl font-bold text-green-600">
                  {stats.byStatus.RESOLVED || 0}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">Auto-Resolved</div>
                <div className="text-3xl font-bold text-teal-600">
                  {stats.byStatus.AUTO_RESOLVED || 0}
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              {(statusFilter || stageFilter || severityFilter || ticketIdFilter) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="OPEN">Open</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="AUTO_RESOLVED">Auto-Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stage
                </label>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="TRANSCRIPTION">Transcription</option>
                  <option value="ANALYSIS">Analysis</option>
                  <option value="DRAFT">Draft</option>
                  <option value="STRIPE">Stripe</option>
                  <option value="WEBHOOK">Webhook</option>
                  <option value="DB">Database</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="INFO">Info</option>
                  <option value="WARN">Warning</option>
                  <option value="ERROR">Error</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ticket ID
                </label>
                <input
                  type="text"
                  value={ticketIdFilter}
                  onChange={(e) => setTicketIdFilter(e.target.value)}
                  placeholder="Filter by ticket..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Incidents Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading && incidents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Loading incidents...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-600">
                Error: {error}
              </div>
            ) : incidents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No incidents found. Try adjusting your filters.
              </div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Knowledge
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {incidents.map((incident) => (
                      <tr
                        key={incident.id}
                        onClick={() => handleRowClick(incident.id)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(incident.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            {incident.stage}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              SEVERITY_COLORS[incident.severity as keyof typeof SEVERITY_COLORS] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {incident.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {incident.ticket ? (
                            <div>
                              <div className="font-medium text-gray-900">
                                {incident.ticket.displayName || 'Unnamed'}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {incident.ticketId?.substring(0, 8)}...
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">System-wide</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              STATUS_COLORS[incident.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {incident.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {incident.knowledgeBindings.length > 0 ? (
                            <span className="text-blue-600">
                              {incident.knowledgeBindings.length} match{incident.knowledgeBindings.length !== 1 ? 'es' : ''}
                            </span>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                      Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                        disabled={pagination.page >= pagination.totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminPasswordGate>
  );
}
