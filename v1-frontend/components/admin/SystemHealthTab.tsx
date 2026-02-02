'use client'

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api';

interface HealthData {
  status: string;
  timestamp: string;
  services?: {
    database?: { status: string; latency?: number };
    storage?: { status: string };
    [key: string]: any;
  };
}

/**
 * System Health Tab
 * 
 * Displays:
 * - Real-time health metrics
 * - Service status indicators
 * - Self-heal capabilities
 * - Support log access
 * 
 * This reuses existing System Health functionality
 */
export function SystemHealthTab() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    try {
      const response = await fetch(getApiUrl('health/status'), {
        headers: {
          'x-admin-password': localStorage.getItem('adminToken') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHealthData(data);
        setLastRefresh(new Date());
        setError('');
      } else {
        setError(`Failed to fetch health data (HTTP ${response.status})`);
      }
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'ok':
      case 'operational':
        return 'text-green-600 bg-green-50';
      case 'degraded':
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'down':
      case 'error':
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
          <p className="text-sm text-gray-600 mt-1">
            Real-time monitoring and diagnostics for Care2Connect production system
          </p>
        </div>
        <button
          onClick={fetchHealthData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-red-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Overall Status Card */}
      {healthData && (
        <div className={`rounded-lg p-6 ${getStatusColor(healthData.status)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-75">Overall System Status</p>
              <p className="text-3xl font-bold mt-1">{healthData.status || 'Unknown'}</p>
            </div>
            <div className="text-5xl">
              {healthData.status?.toLowerCase() === 'healthy' ? '✅' : '⚠️'}
            </div>
          </div>
          <p className="text-sm mt-4 opacity-75">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Services Grid */}
      {healthData?.services && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(healthData.services).map(([serviceName, serviceData]) => (
            <div key={serviceName} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 capitalize">{serviceName}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(serviceData?.status || 'unknown')}`}>
                  {serviceData?.status || 'Unknown'}
                </span>
              </div>
              {serviceData?.latency && (
                <p className="text-sm text-gray-600">
                  Latency: {serviceData.latency}ms
                </p>
              )}
              {serviceData?.version && (
                <p className="text-sm text-gray-600">
                  Version: {serviceData.version}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">System Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors">
            🔧 Run Self-Heal
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors">
            📋 View Support Logs
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors">
            📊 View Metrics
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors">
            🔍 Run Full Diagnostics
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">About System Health</h4>
        <p className="text-sm text-blue-800">
          This dashboard monitors all critical services in real-time. Health checks run automatically every 5 minutes.
          Use the self-heal function to automatically resolve common issues, or view support logs for detailed troubleshooting.
        </p>
      </div>
    </div>
  );
}
