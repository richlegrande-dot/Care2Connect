'use client'

import { useState } from 'react';
import { AdminAuthGate } from '@/components/AdminAuthGate';
import { SystemHealthTab } from '@/components/admin/SystemHealthTab';
import { KnowledgeVaultTab } from '@/components/admin/KnowledgeVaultTab';
import { AuditLogTab } from '@/components/admin/AuditLogTab';

type TabType = 'health' | 'knowledge' | 'audit';

/**
 * Unified Admin Portal
 * 
 * Single password-protected area containing:
 * - System Health (existing functionality)
 * - Knowledge Vault (CRUD for knowledge sources/chunks)
 * - Audit Log (change history for Knowledge Vault)
 * 
 * Anchored at /health as requested (System Health was here first)
 */
export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState<TabType>('health');

  return (
    <AdminAuthGate>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    System management, health monitoring, and knowledge administration
                  </p>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('adminToken');
                    window.location.reload();
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  🔒 Lock Portal
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="mt-6 flex space-x-1 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('health')}
                  className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === 'health'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    System Health
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveTab('knowledge')}
                  className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === 'knowledge'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                    Knowledge Vault
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === 'audit'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Audit Log
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'health' && <SystemHealthTab />}
          {activeTab === 'knowledge' && <KnowledgeVaultTab />}
          {activeTab === 'audit' && <AuditLogTab />}
        </div>
      </div>
    </AdminAuthGate>
  );
}
