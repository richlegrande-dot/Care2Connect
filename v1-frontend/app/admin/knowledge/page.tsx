'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPasswordGate } from '@/components/AdminPasswordGate';

interface KnowledgeSource {
  id: string;
  title: string;
  sourceType: string;
  url: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  _count: {
    chunks: number;
  };
}

export default function KnowledgeVaultPage() {
  const router = useRouter();
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dbOverview, setDbOverview] = useState<any>(null);
  const [showNewSourceModal, setShowNewSourceModal] = useState(false);

  useEffect(() => {
    fetchSources();
    fetchDbOverview();
  }, [page, typeFilter, search]);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://api.care2connects.org';
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(typeFilter && { type: typeFilter }),
        ...(search && { search }),
      });

      const response = await fetch(`${apiUrl}/admin/knowledge/sources?${params}`, {
        headers: {
          'x-admin-password': token || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSources(data.sources);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDbOverview = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://api.care2connects.org';
      
      const response = await fetch(`${apiUrl}/admin/knowledge/database/overview`, {
        headers: {
          'x-admin-password': token || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDbOverview(data);
      }
    } catch (error) {
      console.error('Error fetching DB overview:', error);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This will soft-delete the source and keep it in the database.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://api.care2connects.org';
      
      const response = await fetch(`${apiUrl}/admin/knowledge/sources/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': token || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: `Deleted from Knowledge Vault admin interface`,
        }),
      });

      if (response.ok) {
        fetchSources();
      } else {
        alert('Failed to delete source');
      }
    } catch (error) {
      alert('Error deleting source');
    }
  };

  return (
    <AdminPasswordGate>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Knowledge Vault Admin
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage knowledge sources and chunks with full audit logging
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push('/admin/knowledge/incidents')}
                  className="px-4 py-2 border border-purple-300 bg-purple-50 rounded-md text-sm font-medium text-purple-700 hover:bg-purple-100"
                >
                  🔍 Incidents
                </button>
                <button
                  onClick={() => router.push('/admin/knowledge/audit')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  View Audit Logs
                </button>
                <button
                  onClick={() => setShowNewSourceModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  New Source
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Database Overview */}
          {dbOverview && (
            <div className="bg-white rounded-lg shadow mb-6 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Database Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {dbOverview.tables.map((table: any) => (
                  <div key={table.name} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {table.count}
                    </div>
                    <div className="text-xs text-gray-500">{table.name}</div>
                    {table.deleted !== undefined && (
                      <div className="text-xs text-red-500">
                        ({table.deleted} deleted)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search by title or URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="DOCUMENTATION">Documentation</option>
                <option value="WEBSITE">Website</option>
                <option value="API">API</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Sources Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading sources...</p>
              </div>
            ) : sources.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No knowledge sources found</p>
                <button
                  onClick={() => setShowNewSourceModal(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 underline"
                >
                  Create your first source
                </button>
              </div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chunks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sources.map((source) => (
                      <tr
                        key={source.id}
                        className={source.isDeleted ? 'opacity-50 bg-red-50' : 'hover:bg-gray-50'}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {source.title}
                            {source.isDeleted && (
                              <span className="ml-2 text-xs text-red-600">(Deleted)</span>
                            )}
                          </div>
                          {source.url && (
                            <div className="text-sm text-gray-500 truncate max-w-md">
                              {source.url}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {source.sourceType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {source._count.chunks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(source.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => router.push(`/admin/knowledge/${source.id}`)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          {!source.isDeleted && (
                            <button
                              onClick={() => handleDelete(source.id, source.title)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* New Source Modal - Placeholder */}
      {showNewSourceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Source</h3>
            <p className="text-gray-600 mb-4">
              Feature coming soon: Full source creation form with title, type, URL, and license fields.
            </p>
            <button
              onClick={() => setShowNewSourceModal(false)}
              className="w-full px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AdminPasswordGate>
  );
}
