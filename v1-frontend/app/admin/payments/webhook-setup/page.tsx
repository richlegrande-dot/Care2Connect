'use client'

import { useState, useEffect } from 'react'

export default function WebhookSetupPage() {
  const [currentDomain, setCurrentDomain] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [isTestingWebhook, setIsTestingWebhook] = useState(false)
  const [webhookStatus, setWebhookStatus] = useState<'unknown' | 'working' | 'failed'>('unknown')
  const [message, setMessage] = useState('')
  const [step, setStep] = useState(1)

  useEffect(() => {
    // Get current domain for webhook URL
    if (typeof window !== 'undefined') {
      const isDev = window.location.hostname === 'localhost'
      setCurrentDomain(isDev ? 'http://localhost:3001' : `https://${window.location.hostname}`)
    }
  }, [])

  const webhookUrl = `${currentDomain}/api/payments/stripe-webhook`

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setMessage('✅ Copied to clipboard!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Failed to copy. Please copy manually.')
    }
  }

  const handleSaveWebhookSecret = async () => {
    if (!webhookSecret) {
      setMessage('Please enter the webhook secret')
      return
    }

    try {
      const response = await fetch('/api/admin/stripe/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          publishableKey: 'KEEP_EXISTING',
          secretKey: 'KEEP_EXISTING', 
          webhookSecret
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('✅ Webhook secret saved! Please restart your server to apply changes.')
        setStep(4)
      } else {
        setMessage(`❌ ${data.error || 'Failed to save webhook secret'}`)
      }
    } catch (error) {
      console.error('Save error:', error)
      setMessage('❌ Failed to save webhook secret. Please try again.')
    }
  }

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true)
    setMessage('')

    try {
      // This would trigger a test webhook event
      const response = await fetch('/api/admin/stripe/test-webhook', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setWebhookStatus('working')
        setMessage('✅ Webhook test successful!')
      } else {
        setWebhookStatus('failed')
        setMessage(`❌ Webhook test failed: ${data.error}`)
      }
    } catch (error) {
      setWebhookStatus('failed')
      setMessage('❌ Failed to test webhook. Check your server and try again.')
    } finally {
      setIsTestingWebhook(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Webhook Setup Wizard
        </h1>
        <p className="text-gray-600">
          Set up your Stripe webhook to receive payment confirmations and update donation records automatically.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`w-12 h-1 mx-2 ${
                  step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Copy URL</span>
          <span>Create Endpoint</span>
          <span>Get Secret</span>
          <span>Test & Verify</span>
        </div>
      </div>

      {/* Step 1: Copy Webhook URL */}
      <div className="card mb-6">
        <div className="flex items-center mb-4">
          <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">1</span>
          <h2 className="text-xl font-bold text-gray-900">Copy Your Webhook URL</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          This is the URL Stripe will send payment confirmations to:
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <code className="text-sm font-mono text-gray-800 break-all">
              {webhookUrl}
            </code>
            <button
              onClick={() => copyToClipboard(webhookUrl)}
              className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Important:</strong> In production, make sure your domain uses HTTPS and is accessible from the internet.
          </p>
        </div>

        <button
          onClick={() => setStep(2)}
          className="btn-primary mt-4"
        >
          Next: Create Stripe Endpoint
        </button>
      </div>

      {/* Step 2: Create Stripe Endpoint */}
      {step >= 2 && (
        <div className="card mb-6">
          <div className="flex items-center mb-4">
            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">2</span>
            <h2 className="text-xl font-bold text-gray-900">Create Webhook Endpoint in Stripe</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-yellow-800 text-sm mb-2">
                <strong>Follow these steps in your Stripe Dashboard:</strong>
              </p>
            </div>

            <ol className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">1</span>
                <div>
                  <p>Go to <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Stripe Dashboard → Developers → Webhooks</a></p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">2</span>
                <div>
                  <p>Click <strong>"Add endpoint"</strong></p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">3</span>
                <div>
                  <p>Paste this URL in the <strong>"Endpoint URL"</strong> field:</p>
                  <code className="block bg-gray-100 p-2 rounded mt-1 text-xs font-mono break-all">
                    {webhookUrl}
                  </code>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">4</span>
                <div>
                  <p>In <strong>"Select events"</strong>, choose:</p>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• <code className="bg-gray-100 px-1 rounded text-xs">checkout.session.completed</code> ✅ <strong>(Required)</strong></li>
                    <li>• <code className="bg-gray-100 px-1 rounded text-xs">payment_intent.succeeded</code> (Optional)</li>
                    <li>• <code className="bg-gray-100 px-1 rounded text-xs">payment_intent.payment_failed</code> (Optional)</li>
                  </ul>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">5</span>
                <div>
                  <p>Click <strong>"Add endpoint"</strong> to create it</p>
                </div>
              </li>
            </ol>
          </div>

          <button
            onClick={() => setStep(3)}
            className="btn-primary mt-4"
          >
            Next: Get Signing Secret
          </button>
        </div>
      )}

      {/* Step 3: Get Webhook Secret */}
      {step >= 3 && (
        <div className="card mb-6">
          <div className="flex items-center mb-4">
            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">3</span>
            <h2 className="text-xl font-bold text-gray-900">Get Your Webhook Signing Secret</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-yellow-800 text-sm mb-2">
                <strong>After creating your endpoint:</strong>
              </p>
            </div>

            <ol className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">1</span>
                <div>
                  <p>Click on your newly created webhook endpoint</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">2</span>
                <div>
                  <p>In the endpoint details, find <strong>"Signing secret"</strong></p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">3</span>
                <div>
                  <p>Click <strong>"Reveal"</strong> to show the secret</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">4</span>
                <div>
                  <p>Copy the secret and paste it below (starts with <code>whsec_</code>)</p>
                </div>
              </li>
            </ol>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Signing Secret
              </label>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="whsec_..."
                  className="form-input flex-1"
                />
                <button
                  onClick={handleSaveWebhookSecret}
                  disabled={!webhookSecret}
                  className="btn-primary"
                >
                  Save Secret
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Test & Verify */}
      {step >= 4 && (
        <div className="card mb-6">
          <div className="flex items-center mb-4">
            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">4</span>
            <h2 className="text-xl font-bold text-gray-900">Test Your Webhook</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Test your webhook configuration to ensure payment confirmations will work properly.
            </p>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Testing Methods:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-blue-700">
                <li>• Use the Stripe CLI to send test events</li>
                <li>• Make a test donation with a test card</li>
                <li>• Check the webhook endpoint logs</li>
              </ul>
            </div>

            {/* Stripe CLI Instructions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Option 1: Stripe CLI (Recommended for Development)</h4>
              <div className="space-y-2 text-sm">
                <p>1. Install the <a href="https://stripe.com/docs/stripe-cli" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Stripe CLI</a></p>
                <p>2. Run this command to test your webhook:</p>
                <code className="block bg-white p-2 rounded border text-xs font-mono">
                  stripe trigger checkout.session.completed --override checkout.session.completed.data.object.metadata.clientSlug=test-client
                </code>
              </div>
            </div>

            {/* Manual Test */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Option 2: Manual Test Donation</h4>
              <div className="space-y-2 text-sm">
                <p>1. Go to a <a href="/donate/test-client" className="text-blue-600 hover:text-blue-700 underline">donation page</a></p>
                <p>2. Make a test donation with card <code>4242 4242 4242 4242</code></p>
                <p>3. Complete the payment and check if donation appears in admin dashboard</p>
              </div>
            </div>

            <button
              onClick={handleTestWebhook}
              disabled={isTestingWebhook}
              className="btn-primary"
            >
              {isTestingWebhook ? 'Testing Webhook...' : 'Test Webhook Endpoint'}
            </button>

            {webhookStatus === 'working' && (
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  ✅ <strong>Webhook is working!</strong> Your Stripe integration is fully configured and ready for donations.
                </p>
              </div>
            )}

            {webhookStatus === 'failed' && (
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  ❌ <strong>Webhook test failed.</strong> Check your server logs and webhook configuration in Stripe.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.includes('✅') ? 'bg-green-50 text-green-800' :
          message.includes('❌') ? 'bg-red-50 text-red-800' :
          'bg-blue-50 text-blue-800'
        }`}>
          {message}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <a
          href="/admin/payments/configure"
          className="text-blue-600 hover:text-blue-700"
        >
          ← Back to Stripe Configuration
        </a>
        {step >= 4 && (
          <a
            href="/admin/donations"
            className="btn-primary"
          >
            View Admin Dashboard →
          </a>
        )}
      </div>
    </div>
  )
}