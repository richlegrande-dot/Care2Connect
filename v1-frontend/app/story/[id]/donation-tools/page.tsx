'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Recording {
  id: string
  userId: string
  audioUrl: string
  duration: number | null
  status: string
  createdAt: string
  donationTitle?: string | null
  donationExcerpt?: string | null
  donationGoal?: number | null
}

interface UserProfile {
  id: string
  name: string
  email: string | null
  phone: string | null
}

interface DonationTools {
  title: string
  goal: string
  description: string
  excerpt: string
  qrCodeUrl?: string
  donationUrl?: string
}

export default function DonationToolsPage() {
  const params = useParams()
  const recordingId = params.id as string
  
  const [recording, setRecording] = useState<Recording | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [title, setTitle] = useState('')
  const [goal, setGoal] = useState('')
  const [description, setDescription] = useState('')
  const [excerpt, setExcerpt] = useState('')
  
  // Generated tools state
  const [tools, setTools] = useState<DonationTools | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [showExcerpt, setShowExcerpt] = useState(false)
  
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    fetchRecordingData()
  }, [recordingId])

  const fetchRecordingData = async () => {
    try {
      // Fetch recording
      const recordingResponse = await fetch(`http://localhost:3001/api/recordings/${recordingId}`)
      if (!recordingResponse.ok) {
        throw new Error('Recording not found')
      }
      const recordingData = await recordingResponse.json()
      const rec = recordingData.recording
      setRecording(rec)

      // Check if donation settings already exist
      if (rec.donationTitle) {
        // Load existing donation settings
        setTitle(rec.donationTitle)
        setGoal(rec.donationGoal ? String(rec.donationGoal / 100) : '')
        setExcerpt(rec.donationExcerpt || '')
        
        // If we have an excerpt, show the tools section with QR code
        if (rec.donationExcerpt) {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
          const donationUrl = `${baseUrl}/donate/${recordingId}`
          setTools({
            title: rec.donationTitle,
            goal: rec.donationGoal ? String(rec.donationGoal / 100) : '',
            description: '',
            excerpt: rec.donationExcerpt,
            donationUrl
          })
          await generateQRCode(donationUrl)
        }
      }

      // Fetch linked profile for pre-fill suggestions
      if (rec.userId) {
        const profileResponse = await fetch(`http://localhost:3001/api/profiles/${rec.userId}`)
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setProfile(profileData.profile)
          
          // Only pre-fill if no existing donation settings
          if (!rec.donationTitle) {
            const firstName = profileData.profile.name.split(' ')[0]
            setTitle(`Support ${firstName}'s Journey`)
            setDescription(
              `I'm sharing my story to ask for help with housing, basic needs, and getting back on my feet.\n\n` +
              `Your support will make a real difference as I work toward stability and independence.`
            )
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Failed to load recording data')
    } finally {
      setIsLoading(false)
    }
  }

  const generateQRCode = async (url: string) => {
    // Use canvas to generate QR code
    const QRCode = (await import('qrcode')).default
    
    if (qrCanvasRef.current) {
      try {
        await QRCode.toCanvas(qrCanvasRef.current, url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        
        // Convert canvas to data URL for download
        const dataUrl = qrCanvasRef.current.toDataURL('image/png')
        setQrCodeDataUrl(dataUrl)
      } catch (err) {
        console.error('QR generation error:', err)
      }
    }
  }

  const generateExcerpt = (text: string): string => {
    // Split into words and take approximately 90 words
    const words = text.trim().split(/\s+/)
    const targetWords = Math.min(words.length, 90)
    const excerptWords = words.slice(0, targetWords)
    return excerptWords.join(' ')
  }

  const handleGenerateDraft = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Generate a ~90-word excerpt from the description
    const generatedExcerpt = generateExcerpt(description)
    setExcerpt(generatedExcerpt)
    setShowExcerpt(true)
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      // Save donation settings to the database
      const response = await fetch(`http://localhost:3001/api/recordings/${recordingId}/donation-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationTitle: title,
          donationGoal: goal ? parseInt(goal) * 100 : null, // Convert to cents
          donationExcerpt: excerpt
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save donation settings')
      }

      // Generate the canonical donation URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const donationUrl = `${baseUrl}/donate/${recordingId}`
      
      // Set tools state and generate QR code
      setTools({
        title,
        goal,
        description,
        excerpt,
        donationUrl
      })
      
      await generateQRCode(donationUrl)
      
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save donation settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const downloadQRCode = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a')
      link.download = `donation-qr-${recordingId}.png`
      link.href = qrCodeDataUrl
      link.click()
    }
  }

  const generateGoFundMeText = () => {
    if (!tools || !profile) return ''
    
    const firstName = profile.name.split(' ')[0]
    
    return `${tools.title}

Hi, my name is ${firstName} and I'm sharing my story through the CareConnect portal.

${tools.description}

What the Funds Will Help With:
• Housing and basic needs
• Transportation to work and appointments  
• Stability while getting back on my feet
${tools.goal ? `• Goal: $${tools.goal}\n` : ''}
Thank you for reading, sharing, or giving what you can. Every bit of support makes a difference.

— ${profile.name}`
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4 w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-300 rounded mb-2 w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !recording) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card bg-red-50 border-2 border-red-200 text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-800 mb-6">{error}</p>
          <Link href={`/story/${recordingId}`} className="btn-secondary">
            Back to Recording
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-slide-down">
        <div className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4 shadow-md">
          Fundraising Tools
        </div>
        <h1 className="cc-heading-lg mb-3">Generate Donation Tools</h1>
        <p className="cc-body-lg text-gray-600">
          Create a QR code and fundraising draft for your story
        </p>
      </div>

      {/* Form */}
      {!tools && (
        <div className="space-y-6">
          <form onSubmit={showExcerpt ? handleSaveSettings : handleGenerateDraft} className="space-y-6">
            <div className="card animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Campaign Details</h2>
              
              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Campaign Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Example: Support Jane's Journey"
                />
                <p className="text-sm text-gray-600 mt-1">
                  This will be the main heading for your donation page
                </p>
              </div>

              {/* Goal */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Funding Goal (USD)
                </label>
                <input
                  type="number"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Example: 1000"
                  min="1"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Optional: Enter your target amount (whole dollars only)
                </p>
              </div>

              {/* Description */}
              {!showExcerpt && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Short Description <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="Tell people why you're fundraising and what the funds will help with..."
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Write a longer description - we'll help you create a ~90-word excerpt for your donation page
                  </p>
                </div>
              )}

              {/* Editable Excerpt */}
              {showExcerpt && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Donation Page Excerpt (~90 words) <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="Edit your excerpt here..."
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600">
                      This text will appear on your public donation page
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {excerpt.split(/\s+/).filter(w => w).length} words
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowExcerpt(false)}
                    className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                  >
                    ← Back to edit description
                  </button>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSaving}
                className="btn-primary w-full"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : showExcerpt ? (
                  'Save & Generate QR Code'
                ) : (
                  'Generate Draft Excerpt'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Generated Tools */}
      {tools && (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="card bg-emerald-50 border-2 border-emerald-200 animate-fade-in">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold text-emerald-900 mb-1">Donation Tools Ready!</h3>
                <p className="text-emerald-800 text-sm">
                  Your donation page is now live at <code className="bg-white px-1 rounded text-xs">/donate/{recordingId}</code>
                </p>
              </div>
            </div>
          </div>

          {/* QR Code Card */}
          <div className="card animate-fade-in" style={{animationDelay: '50ms'}}>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Unique QR Code for This Story
            </h2>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 text-center">
              <canvas ref={qrCanvasRef} className="mx-auto mb-4 bg-white p-4 rounded-lg shadow-sm"></canvas>
              
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Donation Page URL:</p>
                <code className="text-xs text-gray-600 bg-white px-3 py-2 rounded border break-all inline-block max-w-full">
                  {tools.donationUrl}
                </code>
              </div>

              <button
                onClick={downloadQRCode}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download QR Code (PNG)
              </button>

              <p className="text-sm text-gray-600 mt-4">
                This QR code is unique to this recording. Print it, share it, or post it anywhere. 
                When scanned, it takes people directly to the donation page for this story.
              </p>
            </div>
          </div>

          {/* Excerpt Preview */}
          <div className="card animate-fade-in" style={{animationDelay: '100ms'}}>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              What Donors Will See
            </h2>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-100">
              <p className="text-sm font-semibold text-gray-700 mb-2">Page Title:</p>
              <p className="text-lg font-bold text-gray-900 mb-4">{tools.title}</p>
              
              <p className="text-sm font-semibold text-gray-700 mb-2">Excerpt ({tools.excerpt.split(/\s+/).filter(w => w).length} words):</p>
              <p className="text-gray-800 whitespace-pre-wrap bg-white p-4 rounded-lg border">
                {tools.excerpt}
              </p>

              {tools.goal && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm font-semibold text-gray-700">Funding Goal:</p>
                  <p className="text-2xl font-bold text-emerald-600">${tools.goal}</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <Link 
                href={`/donate/${recordingId}`}
                target="_blank"
                className="btn-secondary flex-1 inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Preview Donation Page
              </Link>
              <button
                onClick={() => {
                  // Reset to edit mode
                  setTools(null)
                  setShowExcerpt(true)
                }}
                className="btn-secondary flex-1"
              >
                Edit Settings
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Link href={`/story/${recordingId}`} className="btn-secondary">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Recording
              </span>
            </Link>

            <div className="flex gap-3">
              <Link href="/tell-your-story" className="btn-secondary flex-1 sm:flex-initial">
                Add Another Recording
              </Link>
              <Link href="/" className="btn-primary flex-1 sm:flex-initial">
                Go Home
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
