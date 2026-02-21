'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DiagnosticCheck {
  status: string
  [key: string]: any
}

interface Diagnostics {
  timestamp: string
  duration: number
  overall: string
  checks: {
    network?: DiagnosticCheck
    dns?: DiagnosticCheck
    webhook?: DiagnosticCheck
    disk?: DiagnosticCheck
    eventLoop?: DiagnosticCheck
    memory?: DiagnosticCheck
    cpu?: DiagnosticCheck
  }
}

interface TroubleshootingAction {
  timestamp: string
  action: string
  status: string
  details?: any
}

interface SystemHealthData {
  timestamp: string
  diagnostics: Diagnostics
  watchdog: {
    isRunning: boolean
    recoveryCount: number
    lastRecovery: number | null
  }
  troubleshooting: {
    recentActions: TroubleshootingAction[]
    lastActions: { [key: string]: TroubleshootingAction }
  }
}

export default function SystemHealthPage() {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/system-health')
      const data = await response.json()
      setHealthData(data)
      setLastUpdate(new Date())
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch system health:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemHealth()
    
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(fetchSystemHealth, 10000) // Refresh every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'success':
        return 'text-green-600 bg-green-100'
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100'
      case 'critical':
      case 'fail':
      case 'failed':
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'success':
        return '🟢'
      case 'warning':
      case 'degraded':
        return '🟡'
      case 'critical':
      case 'fail':
      case 'failed':
      case 'error':
        return '🔴'
      default:
        return '⚪'
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!healthData) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card text-center text-red-600">
          <h2 className="text-2xl font-bold mb-2">❌ Unable to Connect</h2>
          <p>Cannot reach backend server at http://localhost:3001</p>
          <button onClick={fetchSystemHealth} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { diagnostics, watchdog, troubleshooting } = healthData

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛡️ System Health Monitor
          </h1>
          <p className="text-gray-600">
            Real-time diagnostics and auto-healing status
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link 
            href="/admin/knowledge/incidents" 
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
          >
            📊 Incidents
          </Link>
          
          <Link 
            href="/admin/knowledge" 
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
          >
            📚 Knowledge
          </Link>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-600">Auto-refresh</span>
          </label>
          
          <button onClick={fetchSystemHealth} className="btn-secondary">
            🔄 Refresh Now
          </button>
          
          <Link href="/admin/donations" className="btn-secondary">
            ← Back to Admin
          </Link>
        </div>
      </div>

      {/* Last Update */}
      {lastUpdate && (
        <div className="text-sm text-gray-500 text-right">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      {/* Overall Status */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Overall System Status</h2>
            <p className="text-sm text-gray-600">
              Auto-healing: {watchdog.isRunning ? '✅ Active' : '❌ Inactive'}
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-block px-6 py-3 rounded-lg text-lg font-bold ${getStatusColor(diagnostics.overall)}`}>
              {getStatusIcon(diagnostics.overall)} {diagnostics.overall.toUpperCase()}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Scan completed in {diagnostics.duration}ms
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Network Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700">🌐 Network</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(diagnostics.checks.network?.status || 'unknown')}`}>
              {diagnostics.checks.network?.status || 'Unknown'}
            </span>
          </div>
          {diagnostics.checks.network && (
            <div className="text-sm text-gray-600">
              <div>Reachable: {diagnostics.checks.network.reachable?.length || 0}</div>
              <div>Failed: {diagnostics.checks.network.failed?.length || 0}</div>
              <div>Latency: {diagnostics.checks.network.latency}ms</div>
            </div>
          )}
        </div>

        {/* DNS Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700">🔍 DNS</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(diagnostics.checks.dns?.status || 'unknown')}`}>
              {diagnostics.checks.dns?.status || 'Unknown'}
            </span>
          </div>
          {diagnostics.checks.dns && (
            <div className="text-sm text-gray-600">
              <div>Reachable: {diagnostics.checks.dns.reachable?.length || 0}</div>
              <div>Failed: {diagnostics.checks.dns.failed?.length || 0}</div>
              {troubleshooting.lastActions?.dns_fallback && (
                <div className="text-green-600 mt-1">
                  ✅ Fallback DNS active
                </div>
              )}
            </div>
          )}
        </div>

        {/* Webhook Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700">💳 Stripe Webhook</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(diagnostics.checks.webhook?.status || 'unknown')}`}>
              {diagnostics.checks.webhook?.status || 'Unknown'}
            </span>
          </div>
          {diagnostics.checks.webhook && (
            <div className="text-sm text-gray-600">
              <div>Configured: {diagnostics.checks.webhook.configured ? 'Yes' : 'No'}</div>
              <div>Reachable: {diagnostics.checks.webhook.reachable ? 'Yes' : 'No'}</div>
              {troubleshooting.lastActions?.webhook_reregister && (
                <div className="text-blue-600 mt-1">
                  🔄 Last reconnect: {new Date(troubleshooting.lastActions.webhook_reregister.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Event Loop Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700">⚡ Event Loop</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(diagnostics.checks.eventLoop?.status || 'unknown')}`}>
              {diagnostics.checks.eventLoop?.status || 'Unknown'}
            </span>
          </div>
          {diagnostics.checks.eventLoop && (
            <div className="text-sm text-gray-600">
              <div>Lag: {diagnostics.checks.eventLoop.lagMs}ms</div>
              <div>Threshold: {diagnostics.checks.eventLoop.threshold}ms</div>
              {troubleshooting.lastActions?.snapshot_capture && (
                <div className="text-purple-600 mt-1">
                  📸 Snapshot captured
                </div>
              )}
            </div>
          )}
        </div>

        {/* Memory Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700">💾 Memory</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(diagnostics.checks.memory?.status || 'unknown')}`}>
              {diagnostics.checks.memory?.status || 'Unknown'}
            </span>
          </div>
          {diagnostics.checks.memory && (
            <div className="text-sm text-gray-600">
              <div>Used: {diagnostics.checks.memory.heapUsed}MB / {diagnostics.checks.memory.heapTotal}MB</div>
              <div>Usage: {diagnostics.checks.memory.heapUsagePercent}%</div>
              {troubleshooting.lastActions?.garbage_collection && (
                <div className="text-green-600 mt-1">
                  ♻️ GC ran: {new Date(troubleshooting.lastActions.garbage_collection.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CPU Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700">🖥️ CPU</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(diagnostics.checks.cpu?.status || 'unknown')}`}>
              {diagnostics.checks.cpu?.status || 'Unknown'}
            </span>
          </div>
          {diagnostics.checks.cpu && (
            <div className="text-sm text-gray-600">
              <div>Cores: {diagnostics.checks.cpu.cpuCount}</div>
              <div>Load: {diagnostics.checks.cpu.loadAverage1m}</div>
              <div>Utilization: {diagnostics.checks.cpu.utilization}%</div>
            </div>
          )}
        </div>

        {/* Disk Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700">💿 Disk</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(diagnostics.checks.disk?.status || 'unknown')}`}>
              {diagnostics.checks.disk?.status || 'Unknown'}
            </span>
          </div>
          {diagnostics.checks.disk && (
            <div className="text-sm text-gray-600">
              <div>Memory: {diagnostics.checks.disk.usage?.memory?.usedPercent}% used</div>
              {diagnostics.checks.disk.warnings?.length > 0 && (
                <div className="text-yellow-600 mt-1">
                  ⚠️ {diagnostics.checks.disk.warnings.length} warning(s)
                </div>
              )}
              {troubleshooting.lastActions?.disk_cleanup && (
                <div className="text-green-600 mt-1">
                  🗑️ Cleanup ran
                </div>
              )}
            </div>
          )}
        </div>

        {/* Watchdog Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700">🐕 Watchdog</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${watchdog.isRunning ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
              {watchdog.isRunning ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <div>Recoveries: {watchdog.recoveryCount}</div>
            {watchdog.lastRecovery && (
              <div>Last: {new Date(watchdog.lastRecovery).toLocaleString()}</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Auto-Fix Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🔧 Recent Auto-Fix Actions</h2>
        {troubleshooting.recentActions && troubleshooting.recentActions.length > 0 ? (
          <div className="space-y-2">
            {troubleshooting.recentActions.slice(-10).reverse().map((action, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <span className={`text-2xl ${action.status === 'success' ? '✅' : action.status === 'failed' ? '❌' : '🔧'}`}>
                    {action.status === 'success' ? '✅' : action.status === 'failed' ? '❌' : '🔧'}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900">{action.action.replace(/_/g, ' ').toUpperCase()}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(action.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(action.status)}`}>
                  {action.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No auto-fix actions recorded yet
          </div>
        )}
      </div>

      {/* System Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-2">📊 Auto-Healing</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Status: {watchdog.isRunning ? '🟢 Active' : '🔴 Inactive'}</div>
            <div>Total Recoveries: {watchdog.recoveryCount}</div>
            <div>Last Recovery: {watchdog.lastRecovery ? new Date(watchdog.lastRecovery).toLocaleString() : 'Never'}</div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-2">🔍 Diagnostics</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Overall: {getStatusIcon(diagnostics.overall)} {diagnostics.overall.toUpperCase()}</div>
            <div>Scan Duration: {diagnostics.duration}ms</div>
            <div>Last Scan: {new Date(diagnostics.timestamp).toLocaleString()}</div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-2">🔧 Troubleshooting</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Recent Actions: {troubleshooting.recentActions?.length || 0}</div>
            <div>DNS Fallback: {troubleshooting.lastActions?.dns_fallback ? '✅ Active' : '⚪ Inactive'}</div>
            <div>Webhook Status: {troubleshooting.lastActions?.webhook_reregister ? '🔄 Reconnected' : '⚪ Normal'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
