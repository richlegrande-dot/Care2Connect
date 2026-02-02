'use client'

import { useState, useEffect } from 'react'

interface StripeConfig {
  publishableKey: string
  secretKey: string
  webhookSecret: string
}

interface StripeStatus {
  configured: boolean
  secretKeyValid: boolean
  publishableKeyValid: boolean
  webhookSecretValid: boolean
  webhookSetupNeeded: boolean
  status: 'not-configured' | 'partial' | 'fully-configured' | 'invalid'
}

export default function StripeConfigurePage() {
  const [config, setConfig] = useState<StripeConfig>({
    publishableKey: '',
    secretKey: '',
    webhookSecret: ''
  })
  const [status, setStatus] = useState<StripeStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showKeys, setShowKeys] = useState(false)

  useEffect(() => {
    loadStripeStatus()
  }, [])

  const loadStripeStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/stripe/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to load Stripe status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof StripeConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
    setMessage('')
  }

  const handleSaveKeys = async () => {
    if (!config.publishableKey || !config.secretKey) {
      setMessage('Please enter both publishable key and secret key')
      return
    }

    setIsSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/stripe/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Stripe keys saved successfully!')
        await loadStripeStatus()
        // Clear sensitive data from state
        setConfig({
          publishableKey: '',
          secretKey: '',
          webhookSecret: ''
        })
      } else {
        setMessage(data.error || 'Failed to save Stripe keys')
      }
    } catch (error) {
      console.error('Save error:', error)
      setMessage('Failed to save Stripe keys. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    if (!config.publishableKey || !config.secretKey) {
      setMessage('Please enter keys before testing')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/stripe/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          publishableKey: config.publishableKey,
          secretKey: config.secretKey,
          webhookSecret: config.webhookSecret || undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus(data)
        if (data.secretKeyValid && data.publishableKeyValid) {
          setMessage('✅ Stripe connection successful!')
        } else {
          setMessage('❌ Some keys are invalid. Please check your entries.')
        }
      } else {
        setMessage(data.error || 'Failed to test Stripe connection')
      }
    } catch (error) {
      console.error('Test error:', error)
      setMessage('Failed to test connection. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusDisplay = () => {
    if (!status) return { text: 'Loading...', color: 'text-gray-500', bg: 'bg-gray-50' }
    
    switch (status.status) {
      case 'fully-configured':
        return { 
          text: 'Fully Configured ✓', 
          color: 'text-green-700', 
          bg: 'bg-green-50',
          detail: 'Ready for live donations'
        }
      case 'partial':
        return { 
          text: 'Partially Configured', 
          color: 'text-yellow-700', 
          bg: 'bg-yellow-50',
          detail: 'Webhook setup needed'
        }
      case 'invalid':
        return { 
          text: 'Invalid Configuration', 
          color: 'text-red-700', 
          bg: 'bg-red-50',
          detail: 'Please check your keys'
        }
      default:
        return { 
          text: 'Not Configured', 
          color: 'text-red-700', 
          bg: 'bg-red-50',
          detail: 'Actions required'
        }
    }
  }

  const statusDisplay = getStatusDisplay()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Stripe Payment Configuration
        </h1>
        <p className="text-gray-600">
          Configure your Stripe API keys and webhook settings to enable card donations.
        </p>
      </div>

      {/* Current Status Card */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Status</h2>
        
        <div className={`p-4 rounded-lg ${statusDisplay.bg} mb-4`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-lg font-medium ${statusDisplay.color}`}>
                Stripe Status: {statusDisplay.text}
              </div>
              {statusDisplay.detail && (
                <div className="text-sm text-gray-600 mt-1">
                  {statusDisplay.detail}
                </div>
              )}
            </div>
            <button
              onClick={loadStripeStatus}
              disabled={isLoading}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {status && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${status.secretKeyValid ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm">Secret Key</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${status.publishableKeyValid ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm">Publishable Key</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${status.webhookSecretValid ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              <span className="text-sm">Webhook Secret</span>
            </div>
          </div>
        )}

        {status?.webhookSetupNeeded && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Next Step:</strong> Set up your webhook endpoint to receive payment confirmations.
            </p>
          </div>
        )}
      </div>

      {/* Configuration Form */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">API Keys Configuration</h2>
        
        <div className="space-y-6">
          {/* Publishable Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stripe Publishable Key
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={config.publishableKey}
              onChange={(e) => handleInputChange('publishableKey', e.target.value)}
              placeholder="pk_test_... or pk_live_..."
              className="form-input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Safe for client-side use. Found in Stripe Dashboard → Developers → API Keys
            </p>
          </div>

          {/* Secret Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stripe Secret Key
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={config.secretKey}
              onChange={(e) => handleInputChange('secretKey', e.target.value)}
              placeholder="sk_test_... or sk_live_..."
              className="form-input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Server-side only. Click "Reveal live key" in Stripe Dashboard to show
            </p>
          </div>

          {/* Webhook Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook Secret (Optional)
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={config.webhookSecret}
              onChange={(e) => handleInputChange('webhookSecret', e.target.value)}
              placeholder="whsec_..."
              className="form-input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Generated when you create webhook endpoint. Can be added later.
            </p>
          </div>

          {/* Show/Hide Keys Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showKeys"
              checked={showKeys}
              onChange={(e) => setShowKeys(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="showKeys" className="text-sm text-gray-600">
              Show keys in plain text
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleTestConnection}
            disabled={isLoading || !config.publishableKey || !config.secretKey}
            className="btn-secondary"
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </button>
          
          <button
            onClick={handleSaveKeys}
            disabled={isSaving || !config.publishableKey || !config.secretKey}
            className="btn-primary"
          >
            {isSaving ? 'Saving...' : 'Save Keys'}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.includes('✅') ? 'bg-green-50 text-green-800' : 
            message.includes('❌') ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Need Help?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• <a href="/admin/payments/webhook-setup" className="text-blue-600 hover:text-blue-700">Set up webhook endpoint</a></p>
            <p>• <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">Get API keys from Stripe Dashboard</a></p>
            <p>• <a href="/docs/stripe-setup.md" className="text-blue-600 hover:text-blue-700">View complete setup guide</a></p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Security Notes</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Keys are stored securely in environment variables</p>
            <p>• Never commit API keys to version control</p>
            <p>• Use test keys for development</p>
            <p>• Webhook signatures are automatically verified</p>
          </div>
        </div>
      </div>
    </div>
  )
}