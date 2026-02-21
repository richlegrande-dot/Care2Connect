'use client'

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api';

interface KnowledgeSource {
  id: string;
  title: string;
  description: string | null;
  sourceType: string;
  url: string | null;
  filePath: string | null;
  metadata: any;
  chunkCount?: number;
  _count?: {
    chunks: number;
  };
  lastIndexedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Knowledge Vault Tab
 * 
 * CRUD interface for:
 * - Knowledge Sources (documents, URLs, files)
 * - Knowledge Chunks (searchable content pieces)
 * 
 * All edits create audit log entries
 */
interface KnowledgeChunk {
  id: string;
  chunkText: string;
  tags: string[];
  language: string | null;
  createdAt: string;
}

export function KnowledgeVaultTab() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(null);
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [showChunks, setShowChunks] = useState(false);
  
  // Create chunk state
  const [showCreateChunk, setShowCreateChunk] = useState(false);
  const [newChunkText, setNewChunkText] = useState('');
  const [newChunkTags, setNewChunkTags] = useState('');
  const [newChunkLanguage, setNewChunkLanguage] = useState('');
  const [creatingChunk, setCreatingChunk] = useState(false);

  // Create source state
  const [showCreateSource, setShowCreateSource] = useState(false);
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceDescription, setNewSourceDescription] = useState('');
  const [newSourceType, setNewSourceType] = useState('DOC');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [creatingSource, setCreatingSource] = useState(false);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await fetch(getApiUrl('admin/knowledge/sources'), {
        headers: {
          'x-admin-password': localStorage.getItem('adminToken') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSources(data.sources || []);
        setError('');
      } else {
        setError(`Failed to fetch sources (HTTP ${response.status})`);
      }
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChunks = async (sourceId: string) => {
    setLoadingChunks(true);
    try {
      const response = await fetch(getApiUrl(`admin/knowledge/sources/${sourceId}/chunks?limit=100`), {
        headers: {
          'x-admin-password': localStorage.getItem('adminToken') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChunks(data.chunks || []);
        setShowChunks(true);
      } else {
        setError(`Failed to fetch chunks (HTTP ${response.status})`);
      }
    } catch (err) {
      setError(`Failed to load chunks: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoadingChunks(false);
    }
  };

  const createChunk = async () => {
    if (!selectedSource || !newChunkText.trim()) {
      setError('Please provide chunk text');
      return;
    }

    setCreatingChunk(true);
    try {
      const tagsArray = newChunkTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await fetch(
        getApiUrl(`admin/knowledge/sources/${selectedSource.id}/chunks`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': localStorage.getItem('adminToken') || '',
          },
          body: JSON.stringify({
            chunkText: newChunkText,
            tags: tagsArray,
            language: newChunkLanguage || null,
          }),
        }
      );

      if (response.ok) {
        const newChunk = await response.json();
        
        // Update chunks list
        setChunks(prev => [...prev, newChunk]);
        
        // Update source chunk count
        setSources(prev =>
          prev.map(s =>
            s.id === selectedSource.id
              ? {
                  ...s,
                  _count: {
                    chunks: (s._count?.chunks || 0) + 1,
                  },
                }
              : s
          )
        );
        
        // Update selected source
        setSelectedSource(prev => prev ? {
          ...prev,
          _count: {
            chunks: (prev._count?.chunks || 0) + 1,
          },
        } : null);

        // Reset form
        setNewChunkText('');
        setNewChunkTags('');
        setNewChunkLanguage('');
        setShowCreateChunk(false);
        setError('');
        
        // Show success message briefly
        setError('Chunk created successfully!');
        setTimeout(() => setError(''), 3000);
      } else {
        const errorData = await response.json();
        setError(`Failed to create chunk: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      setError(`Failed to create chunk: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setCreatingChunk(false);
    }
  };

  const createSource = async () => {
    if (!newSourceTitle.trim()) {
      setError('Please provide a source title');
      return;
    }

    setCreatingSource(true);
    try {
      const response = await fetch(
        getApiUrl('admin/knowledge/sources'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': localStorage.getItem('adminToken') || '',
          },
          body: JSON.stringify({
            title: newSourceTitle,
            description: newSourceDescription || null,
            sourceType: newSourceType,
            url: newSourceUrl || null,
          }),
        }
      );

      if (response.ok) {
        const newSource = await response.json();
        
        // Add to sources list
        setSources(prev => [newSource, ...prev]);
        
        // Reset form
        setNewSourceTitle('');
        setNewSourceDescription('');
        setNewSourceType('DOC');
        setNewSourceUrl('');
        setShowCreateSource(false);
        setError('');
        
        // Show success message
        setError('Source created successfully!');
        setTimeout(() => setError(''), 3000);
      } else {
        const errorData = await response.json();
        setError(`Failed to create source: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      setError(`Failed to create source: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setCreatingSource(false);
    }
  };

  const filteredSources = sources.filter(source =>
    source.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading knowledge sources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Knowledge Vault</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage documentation, guides, and knowledge sources for system troubleshooting
          </p>
        </div>
        <button
          onClick={() => setShowCreateSource(!showCreateSource)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {showCreateSource ? '✕ Cancel' : '➕ Add Source'}
        </button>
      </div>

      {/* Error/Success Banner */}
      {error && (
        <div className={`${error.includes('success') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
          <div className="flex items-start">
            <svg className={`h-5 w-5 ${error.includes('success') ? 'text-green-600' : 'text-red-600'} mt-0.5 mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className={`text-sm ${error.includes('success') ? 'text-green-800' : 'text-red-800'}`}>{error}</p>
          </div>
        </div>
      )}

      {/* Create Source Form */}
      {showCreateSource && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Create New Knowledge Source</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newSourceTitle}
                onChange={(e) => setNewSourceTitle(e.target.value)}
                placeholder="e.g., Stripe Payment Integration Guide"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newSourceDescription}
                onChange={(e) => setNewSourceDescription(e.target.value)}
                placeholder="Brief description of this knowledge source..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source Type
                </label>
                <select
                  value={newSourceType}
                  onChange={(e) => setNewSourceType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="DOC">Document</option>
                  <option value="URL">URL</option>
                  <option value="NOTE">Note</option>
                  <option value="IMPORT">Import</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL (optional)
                </label>
                <input
                  type="text"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={createSource}
                disabled={creatingSource || !newSourceTitle.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {creatingSource ? 'Creating...' : 'Create Source'}
              </button>
              <button
                onClick={() => {
                  setShowCreateSource(false);
                  setNewSourceTitle('');
                  setNewSourceDescription('');
                  setNewSourceType('DOC');
                  setNewSourceUrl('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search knowledge sources..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Sources List */}
      {filteredSources.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 text-center">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Knowledge Sources Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? `No sources match "${searchTerm}"` : 'Get started by adding your first knowledge source'}
          </p>
          {!searchTerm && (
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Add First Source
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSources.map((source) => (
            <div
              key={source.id}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedSource(source)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">{source.title}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                  {source.sourceType}
                </span>
              </div>
              {source.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{source.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{source._count?.chunks || 0} chunks</span>
                <span>{new Date(source.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Source Detail Modal */}
      {selectedSource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Source Details</h3>
              <button
                onClick={() => setSelectedSource(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={selectedSource.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={selectedSource.description || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  readOnly
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <input
                    type="text"
                    value={selectedSource.sourceType}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chunks</label>
                  <input
                    type="text"
                    value={selectedSource._count?.chunks || 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    readOnly
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Edit Source
                </button>
                <button 
                  onClick={() => {
                    setShowCreateChunk(!showCreateChunk);
                    if (!showChunks) {
                      fetchChunks(selectedSource.id);
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {showCreateChunk ? '✕ Cancel Create' : '➕ Create Chunk'}
                </button>
                <button 
                  onClick={() => fetchChunks(selectedSource.id)}
                  disabled={loadingChunks}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loadingChunks ? 'Loading...' : 'View Chunks'}
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Delete
                </button>
              </div>

              {/* Create Chunk Form */}
              {showCreateChunk && (
                <div className="mt-6 border-t pt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h5 className="font-medium text-gray-900 mb-3">Create New Chunk</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Chunk Text <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={newChunkText}
                          onChange={(e) => setNewChunkText(e.target.value)}
                          placeholder="Enter the knowledge chunk content..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={6}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {newChunkText.length} characters
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={newChunkTags}
                          onChange={(e) => setNewChunkTags(e.target.value)}
                          placeholder="e.g., troubleshooting, database, stripe"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Language (optional)
                        </label>
                        <input
                          type="text"
                          value={newChunkLanguage}
                          onChange={(e) => setNewChunkLanguage(e.target.value)}
                          placeholder="e.g., javascript, python, markdown"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={createChunk}
                          disabled={creatingChunk || !newChunkText.trim()}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          {creatingChunk ? 'Creating...' : 'Create Chunk'}
                        </button>
                        <button
                          onClick={() => {
                            setShowCreateChunk(false);
                            setNewChunkText('');
                            setNewChunkTags('');
                            setNewChunkLanguage('');
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chunks List */}
              {showChunks && (
                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">
                      Content Chunks ({chunks.length})
                    </h4>
                  </div>

                  {chunks.length === 0 ? (
                    <p className="text-gray-500 text-sm">No chunks found for this source.</p>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {chunks.map((chunk, index) => (
                        <div key={chunk.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">Chunk {index + 1}</span>
                            <div className="flex gap-1">
                              {chunk.tags.map(tag => (
                                <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-gray-200 max-h-48 overflow-y-auto">
                            {chunk.chunkText}
                          </pre>
                          <div className="mt-2 text-xs text-gray-500">
                            {chunk.language && <span>Language: {chunk.language}</span>}
                            <span className="ml-2">Created: {new Date(chunk.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
