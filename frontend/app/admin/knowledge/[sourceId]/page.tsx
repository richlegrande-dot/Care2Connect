'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPasswordGate } from '@/components/AdminPasswordGate';

interface KnowledgeSource {
  id: string;
  title: string;
  sourceType: string;
  url: string | null;
  licenseNote: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  chunks: KnowledgeChunk[];
}

interface KnowledgeChunk {
  id: string;
  chunkText: string;
  tags: string[];
  language: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export default function KnowledgeSourceDetailPage({
  params,
}: {
  params: { sourceId: string };
}) {
  const router = useRouter();
  const [source, setSource] = useState<KnowledgeSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedUrl, setEditedUrl] = useState('');
  const [editedLicense, setEditedLicense] = useState('');

  useEffect(() => {
    fetchSource();
  }, [params.sourceId]);

  const fetchSource = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/knowledge/sources/${params.sourceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSource(data);
        setEditedTitle(data.title);
        setEditedUrl(data.url || '');
        setEditedLicense(data.licenseNote || '');
      } else if (response.status === 404) {
        alert('Source not found');
        router.push('/admin/knowledge');
      }
    } catch (error) {
      console.error('Error fetching source:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!source) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/knowledge/sources/${source.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedTitle,
          url: editedUrl || null,
          licenseNote: editedLicense || null,
          reason: 'Updated from Knowledge Vault admin interface',
        }),
      });

      if (response.ok) {
        await fetchSource();
        alert('Source updated successfully');
      } else {
        alert('Failed to update source');
      }
    } catch (error) {
      alert('Error updating source');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChunk = async (chunkId: string) => {
    if (!confirm('Delete this chunk? It will be soft-deleted and kept in the database.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/knowledge/chunks/${chunkId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Deleted from Knowledge Vault admin interface',
        }),
      });

      if (response.ok) {
        await fetchSource();
      } else {
        alert('Failed to delete chunk');
      }
    } catch (error) {
      alert('Error deleting chunk');
    }
  };

  if (loading) {
    return (
      <AdminPasswordGate>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading source...</p>
          </div>
        </div>
      </AdminPasswordGate>
    );
  }

  if (!source) {
    return (
      <AdminPasswordGate>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Source not found</p>
            <button
              onClick={() => router.push('/admin/knowledge')}
              className="mt-4 text-blue-600 hover:text-blue-700 underline"
            >
              Back to Knowledge Vault
            </button>
          </div>
        </div>
      </AdminPasswordGate>
    );
  }

  return (
    <AdminPasswordGate>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <button
                  onClick={() => router.push('/admin/knowledge')}
                  className="text-sm text-blue-600 hover:text-blue-700 mb-2 flex items-center"
                >
                  ← Back to Knowledge Vault
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                  Edit Knowledge Source
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {source.id}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push(`/admin/knowledge/audit?entityId=${source.id}`)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  View Audit History
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Source Details */}
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Source Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source Type
                </label>
                <div className="px-4 py-2 bg-gray-100 rounded-md text-gray-700">
                  {source.sourceType}
                  <span className="ml-2 text-sm text-gray-500">(cannot be changed)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL (optional)
                </label>
                <input
                  type="url"
                  value={editedUrl}
                  onChange={(e) => setEditedUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Note (optional)
                </label>
                <textarea
                  value={editedLicense}
                  onChange={(e) => setEditedLicense(e.target.value)}
                  rows={3}
                  placeholder="e.g., MIT License, CC BY 4.0, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(source.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Updated:</span>{' '}
                  {new Date(source.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Chunks */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Knowledge Chunks ({source.chunks.filter(c => !c.isDeleted).length})
              </h2>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                onClick={() => alert('Add chunk feature coming soon')}
              >
                Add Chunk
              </button>
            </div>

            {source.chunks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No chunks yet. Add your first chunk to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {source.chunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    className={`border rounded-lg p-4 ${
                      chunk.isDeleted ? 'bg-red-50 border-red-200 opacity-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">
                          {chunk.language && (
                            <span className="mr-3">Language: {chunk.language}</span>
                          )}
                          {chunk.tags.length > 0 && (
                            <span>
                              Tags:{' '}
                              {chunk.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1"
                                >
                                  {tag}
                                </span>
                              ))}
                            </span>
                          )}
                        </div>
                        <div className="text-gray-900 whitespace-pre-wrap">
                          {chunk.chunkText}
                        </div>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => alert('Edit chunk feature coming soon')}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Edit
                        </button>
                        {!chunk.isDeleted && (
                          <button
                            onClick={() => handleDeleteChunk(chunk.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Updated: {new Date(chunk.updatedAt).toLocaleString()}
                      {chunk.isDeleted && (
                        <span className="ml-2 text-red-600 font-medium">(Deleted)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminPasswordGate>
  );
}
