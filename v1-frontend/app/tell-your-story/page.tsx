'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import StepProgress from '@/components/StepProgress'
import { 
  runRecordingDiagnostics, 
  getRecordingErrorMessage, 
  isTransientError, 
  logRecordingError,
  checkMicrophonePermission,
  hasAudioInputDevice,
  DiagnosticResult 
} from '@/src/lib/recordingDiagnostics'
import { 
  savePendingRecording, 
  countPending 
} from '@/src/lib/offlineRecordingStore'
import { 
  initializeSyncService, 
  getSyncService,
  type ConnectivityStatus 
} from '@/src/lib/recordingSyncService'

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  recordedBlob: Blob | null;
  audioUrl: string | null;
  duration: number;
  justCompleted: boolean;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
}

interface Banner {
  type: 'error' | 'info' | 'success' | 'warning';
  message: string;
  visible: boolean;
}

export default function TellYourStoryPage() {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    recordedBlob: null,
    audioUrl: null,
    duration: 0,
    justCompleted: false
  })
  
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: ''
  })
  const [recordingId, setRecordingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [banner, setBanner] = useState<Banner>({ type: 'info', message: '', visible: false })
  const [isRetrying, setIsRetrying] = useState(false)
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null)
  const [recordingDisabled, setRecordingDisabled] = useState(false)
  const [connectivityStatus, setConnectivityStatus] = useState<ConnectivityStatus>('online')
  const [pendingUploadsCount, setPendingUploadsCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef<number>(0)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Reset retry counter on successful access
      retryCountRef.current = 0
      setBanner({ type: 'success', message: 'Microphone connected!', visible: true })
      setTimeout(() => setBanner(prev => ({ ...prev, visible: false })), 3000)
      
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setRecordingState(prev => ({
          ...prev,
          recordedBlob: blob,
          audioUrl: url,
          isRecording: false,
          justCompleted: true
        }))
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setRecordingState(prev => ({ ...prev, isRecording: true, duration: 0, justCompleted: false }))
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingState(prev => ({ ...prev, duration: prev.duration + 1 }))
      }, 1000)
      
    } catch (error) {
      const domException = error as DOMException
      const errorMessage = getRecordingErrorMessage(domException)
      
      console.error('Error starting recording:', error)
      
      // Log error to backend (non-blocking, best-effort)
      const permissionState = await checkMicrophonePermission()
      const hasAudio = await hasAudioInputDevice()
      logRecordingError(domException.name, permissionState, hasAudio).catch(() => {})
      
      // Check if this is a transient error worth retrying
      if (isTransientError(domException) && retryCountRef.current === 0) {
        retryCountRef.current += 1
        setBanner({ 
          type: 'info', 
          message: 'Microphone seems busy. Retrying in a moment...', 
          visible: true 
        })
        setIsRetrying(true)
        
        // Wait 1.5 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        try {
          const retryStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          
          // Retry successful
          retryCountRef.current = 0
          setIsRetrying(false)
          setBanner({ type: 'success', message: 'Microphone connected!', visible: true })
          setTimeout(() => setBanner(prev => ({ ...prev, visible: false })), 3000)
          
          mediaRecorderRef.current = new MediaRecorder(retryStream)
          chunksRef.current = []

          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunksRef.current.push(event.data)
            }
          }

          mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
            const url = URL.createObjectURL(blob)
            setRecordingState(prev => ({
              ...prev,
              recordedBlob: blob,
              audioUrl: url,
              isRecording: false,
              justCompleted: true
            }))
            retryStream.getTracks().forEach(track => track.stop())
          }

          mediaRecorderRef.current.start()
          setRecordingState(prev => ({ ...prev, isRecording: true, duration: 0, justCompleted: false }))
          
          timerRef.current = setInterval(() => {
            setRecordingState(prev => ({ ...prev, duration: prev.duration + 1 }))
          }, 1000)
          
        } catch (retryError) {
          const retryDomException = retryError as DOMException
          const retryMessage = getRecordingErrorMessage(retryDomException)
          setIsRetrying(false)
          setBanner({ type: 'error', message: retryMessage, visible: true })
          logRecordingError(retryDomException.name, permissionState, hasAudio).catch(() => {})
        }
      } else {
        // Not a transient error or already retried
        setBanner({ type: 'error', message: errorMessage, visible: true })
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop()
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const saveRecording = async () => {
    if (!recordingState.recordedBlob) return
    
    setIsSaving(true)
    setSaveError(null)
    
    const formData = new FormData()
    formData.append('audio', recordingState.recordedBlob, 'recording.webm')
    formData.append('duration', recordingState.duration.toString())
    
    try {
      const response = await fetch('http://localhost:3001/api/recordings', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        setRecordingId(result.recordingId)
        setShowProfileForm(true)
      } else {
        const error = await response.json()
        setSaveError(error.error || 'Upload failed. Please try again.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      
      // Check if it's a network error (backend unreachable)
      const isNetworkError = error instanceof TypeError && 
                             (error.message.includes('fetch') || error.message.includes('Failed to fetch'))
      
      if (isNetworkError || !navigator.onLine) {
        // Save offline
        try {
          await savePendingRecording(
            recordingState.recordedBlob,
            recordingState.duration,
            undefined // No profile yet
          )
          
          // Update pending count
          const count = await countPending()
          setPendingUploadsCount(count)
          
          setBanner({
            type: 'info',
            message: 'Your story has been saved on this device and will upload automatically when the connection returns. Please don\'t clear the browser data on this kiosk.',
            visible: true
          })
          
          // Show profile form anyway (will be attached when synced)
          setShowProfileForm(true)
          setRecordingId('offline-pending') // Placeholder
        } catch (offlineError) {
          console.error('Failed to save offline:', offlineError)
          setSaveError('Failed to save recording. Please try again.')
        }
      } else {
        setSaveError('Upload failed. Make sure the backend server is running.')
      }
    } finally {
      setIsSaving(false)
    }
  }
  
  const submitProfile = async () => {
    // Validation
    if (!profileData.name.trim()) {
      setSaveError('Please enter your name')
      return
    }
    
    if (!profileData.email.trim() && !profileData.phone.trim()) {
      setSaveError('Please provide either an email or phone number')
      return
    }
    
    setIsSaving(true)
    setSaveError(null)
    
    try {
      const response = await fetch('http://localhost:3001/api/recordings/attach-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recordingId,
          name: profileData.name.trim(),
          email: profileData.email.trim() || null,
          phone: profileData.phone.trim() || null
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        // Success! Redirect to confirmation or story overview
        alert('Your story has been saved! You can come back later by searching your name and contact info.')
        window.location.href = '/'
      } else {
        const error = await response.json()
        setSaveError(error.error || 'Failed to save profile. Please try again.')
      }
    } catch (error) {
      console.error('Profile save error:', error)
      setSaveError('Failed to save profile. Please check your connection.')
    } finally {
      setIsSaving(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Initialize sync service and check for pending uploads
  useEffect(() => {
    // Initialize sync service with callbacks
    const syncService = initializeSyncService({
      onConnectivityChange: (status) => {
        setConnectivityStatus(status)
        console.log('[TellYourStory] Connectivity changed:', status)
      },
      onSyncStart: () => {
        setIsSyncing(true)
        console.log('[TellYourStory] Sync started')
      },
      onSyncComplete: async (successCount, failCount) => {
        setIsSyncing(false)
        console.log('[TellYourStory] Sync complete:', successCount, 'success,', failCount, 'failed')
        
        // Update pending count
        const count = await countPending()
        setPendingUploadsCount(count)
        
        if (successCount > 0) {
          setBanner({
            type: 'success',
            message: `Your story has been safely uploaded! (${successCount} recording${successCount > 1 ? 's' : ''})`,
            visible: true
          })
          setTimeout(() => setBanner(prev => ({ ...prev, visible: false })), 5000)
        }
      },
      onRecordingSynced: (offlineId, recordingId) => {
        console.log('[TellYourStory] Recording synced:', offlineId, '→', recordingId)
      }
    })
    
    // Check initial connectivity status
    setConnectivityStatus(syncService.getConnectivityStatus())
    
    // Check for pending uploads
    countPending().then(count => {
      setPendingUploadsCount(count)
      if (count > 0) {
        setBanner({
          type: 'info',
          message: `You have ${count} recording${count > 1 ? 's' : ''} waiting to upload. They will sync automatically when the connection is restored.`,
          visible: true
        })
      }
    })
    
    return () => {
      // Cleanup on unmount
      syncService.stop()
    }
  }, [])

  // Run diagnostics on mount to check recording capabilities
  useEffect(() => {
    const checkCapabilities = async () => {
      const results = await runRecordingDiagnostics()
      setDiagnostics(results)
      if (!results.canRecord) {
        setRecordingDisabled(true)
        setBanner({
          type: 'warning',
          message: `Recording is not available: ${results.errorDetails}`,
          visible: true
        })
      }
    }
    checkCapabilities()
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (recordingState.audioUrl) {
        URL.revokeObjectURL(recordingState.audioUrl)
      }
    }
  }, [recordingState.audioUrl])

  const handleTroubleshoot = async () => {
    const results = await runRecordingDiagnostics()
    setDiagnostics(results)
    setShowTroubleshooting(true)
  }

  const dismissBanner = () => {
    setBanner(prev => ({ ...prev, visible: false }))
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Step Progress Indicator */}
      <StepProgress currentStep={1} />

      {/* Sync Status Indicator */}
      <div className="mb-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {connectivityStatus === 'online' ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Connection OK</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Working offline — your story will upload when the connection returns</span>
            </>
          )}
          {isSyncing && (
            <span className="text-blue-600 flex items-center gap-1">
              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving your story securely...
            </span>
          )}
        </div>
        {pendingUploadsCount > 0 && (
          <div className="text-blue-600 text-xs font-medium">
            {pendingUploadsCount} recording{pendingUploadsCount > 1 ? 's' : ''} pending upload
          </div>
        )}
      </div>

      {/* Banner for errors/success messages */}
      {banner.visible && (
        <div 
          role="alert" 
          aria-live="polite"
          className={`mb-6 p-4 rounded-lg flex items-start justify-between ${
            banner.type === 'error' ? 'bg-red-50 border border-red-200' : 
            banner.type === 'success' ? 'bg-green-50 border border-green-200' :
            banner.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-blue-50 border border-blue-200'
          }`}
          onKeyDown={(e) => {
            if (e.key === 'Escape') dismissBanner()
          }}
          tabIndex={0}
        >
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              banner.type === 'error' ? 'text-red-800' : 
              banner.type === 'success' ? 'text-green-800' :
              banner.type === 'warning' ? 'text-yellow-800' :
              'text-blue-800'
            }`}>
              {banner.message}
            </p>
          </div>
          <button 
            onClick={dismissBanner}
            className={`ml-4 text-sm font-medium ${
              banner.type === 'error' ? 'text-red-600 hover:text-red-700' : 
              banner.type === 'success' ? 'text-green-600 hover:text-green-700' :
              banner.type === 'warning' ? 'text-yellow-600 hover:text-yellow-700' :
              'text-blue-600 hover:text-blue-700'
            }`}
            aria-label="Dismiss message"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Two-Column Layout on Desktop */}
      <div className="grid lg:grid-cols-[1fr,400px] gap-8">
        {/* Left Column: Main Recording Controls */}
        <div className="card space-y-6">
          {/* Header */}
          <div className="text-center lg:text-left">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4 shadow-md">
              Step 1 of 4
            </div>
            <h1 className="cc-heading-lg mb-3">
              Tell Your Story
            </h1>
            <p className="cc-body-lg text-gray-600">
              Press the red button to begin recording. Speak freely about your situation, 
              work history, and what you need.
            </p>
          </div>

          {/* Recording Interface */}
          <div className="py-8">
            {/* Recording Status */}
            <div className="text-center mb-8">
              {recordingState.isRecording ? (
                <div className="animate-fade-in">
                  <div className="relative inline-block">
                    {/* Animated recording ring */}
                    <div className="recording-ring"></div>
                    
                    <button
                      onClick={stopRecording}
                      className="btn-record h-44 w-44 flex flex-col items-center justify-center gap-3"
                      aria-label="Stop recording"
                    >
                      <svg className="w-20 h-20 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                      <p className="text-2xl font-bold text-red-600">Recording in Progress</p>
                    </div>
                    <p className="text-5xl font-mono font-bold text-gray-800">{formatTime(recordingState.duration)}</p>
                    <p className="text-sm text-gray-500">Press the button to stop</p>
                  </div>
                </div>
              ) : (
                <div className="animate-scale-in">
                  {isRetrying && (
                    <div className="mb-6 flex items-center justify-center gap-3 text-blue-600">
                      <div className="spinner w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-lg font-medium">Preparing microphone...</p>
                    </div>
                  )}
                  
                  <div className="relative inline-block">
                    <button
                      onClick={startRecording}
                      disabled={recordingDisabled || isRetrying}
                      className="btn-record btn-record-breathe h-44 w-44 flex flex-col items-center justify-center gap-3 relative disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Start recording your story"
                    >
                      {/* Subtle halo */}
                      <div className="absolute inset-0 bg-red-100 rounded-full blur-2xl opacity-40"></div>
                      
                      <svg className="w-20 h-20 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                      </svg>
                      <span className="text-xl font-bold uppercase tracking-wider relative z-10">
                        {isRetrying ? 'Retrying...' : 'Press to Record'}
                      </span>
                    </button>
                  </div>
                  
                  <div className="mt-6">
                    <p className="text-xl font-semibold text-gray-800">Ready to Record</p>
                    <p className="text-sm text-gray-500 mt-1">Click the red button above to start</p>
                  </div>
                  
                  {/* Troubleshoot Button */}
                  <div className="mt-6">
                    <button
                      onClick={handleTroubleshoot}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                      aria-label="Troubleshoot microphone issues"
                    >
                      Troubleshoot microphone
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Playback Section */}
          {recordingState.audioUrl && (
            <div className={`animate-fade-in ${recordingState.justCompleted ? 'animate-slide-up' : ''}`}>
              <div className="card card-compact bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-green-900">Recording Complete!</h3>
                </div>
                
                <div className="bg-white rounded-xl p-5 mb-5 shadow-sm">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Listen to your recording:</p>
                  <audio controls className="w-full">
                    <source src={recordingState.audioUrl} type="audio/webm" />
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={saveRecording} 
                    disabled={isSaving || showProfileForm}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isSaving ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          {showProfileForm ? 'Saved ✓' : 'Save Recording'}
                        </>
                      )}
                    </span>
                  </button>
                  <button 
                    onClick={() => {
                      setRecordingState(prev => ({ ...prev, recordedBlob: null, audioUrl: null, justCompleted: false }))
                      setShowProfileForm(false)
                      setRecordingId(null)
                      setSaveError(null)
                    }}
                    className="btn-secondary flex-1"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Record Again
                    </span>
                  </button>
                </div>
                
                {saveError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    ⚠️ {saveError}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Profile Capture Form */}
          {showProfileForm && recordingId && (
            <div className="animate-fade-in animate-slide-up mt-6">
              <div className="card bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-purple-900">Tell Us How to Find Your Story</h3>
                    <p className="text-sm text-purple-700">So you can come back and continue later</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 space-y-4">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors text-lg"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  {/* Contact Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-3">
                      📧 Contact Information <span className="text-blue-700 font-normal">(At least one required)</span>
                    </p>
                    
                    <div className="space-y-3">
                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                          placeholder="your.email@example.com"
                        />
                      </div>
                      
                      {/* Phone */}
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Privacy Note */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Your information is private. We only use it to help you find your story later. 
                        We'll never share it without your permission.
                      </p>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    onClick={submitProfile}
                    disabled={isSaving}
                    className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Your Profile...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Complete & Save My Story
                      </span>
                    )}
                  </button>
                  
                  {saveError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      ⚠️ {saveError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Troubleshooting Panel */}
          {showTroubleshooting && diagnostics && (
            <div className="animate-fade-in mt-6">
              <div className="card bg-blue-50 border-2 border-blue-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-blue-900">Microphone Diagnostics</h3>
                  <button
                    onClick={() => setShowTroubleshooting(false)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    aria-label="Close diagnostics"
                  >
                    ✕ Close
                  </button>
                </div>
                
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <span className={diagnostics.hasApi ? 'text-green-600' : 'text-red-600'}>
                        {diagnostics.hasApi ? '✓' : '✗'}
                      </span>
                      <span className="text-sm font-medium">Recording API Support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={diagnostics.hasSecureContext ? 'text-green-600' : 'text-red-600'}>
                        {diagnostics.hasSecureContext ? '✓' : '✗'}
                      </span>
                      <span className="text-sm font-medium">Secure Context (HTTPS)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={diagnostics.hasAudioInput ? 'text-green-600' : 'text-red-600'}>
                        {diagnostics.hasAudioInput ? '✓' : '✗'}
                      </span>
                      <span className="text-sm font-medium">Microphone Detected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={diagnostics.permissionState === 'granted' ? 'text-green-600' : 'text-yellow-600'}>
                        {diagnostics.permissionState === 'granted' ? '✓' : '⚠'}
                      </span>
                      <span className="text-sm font-medium">Permission: {diagnostics.permissionState}</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">What you can do:</p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {diagnostics.suggestedActions.map((action: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {diagnostics.canRecord && (
                    <div className="pt-3">
                      <button
                        onClick={() => {
                          setShowTroubleshooting(false)
                          startRecording()
                        }}
                        className="w-full btn-primary"
                      >
                        Try Recording Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t-2 border-gray-200">
            <Link href="/" className="btn-secondary w-full sm:w-auto">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Cancel & Return Home
              </span>
            </Link>
            
            <Link 
              href="/gfm/5-story" 
              className={`btn-primary w-full sm:w-auto ${recordingState.justCompleted ? 'animate-pulse' : ''}`}
            >
              <span className="flex items-center justify-center gap-2">
                Next: Review & Details
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {/* Right Column: Tips & Reassurance */}
        <div className="space-y-6">
          {/* Comfort Card */}
          <div className="card card-compact bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-blue-900 text-lg mb-2">You're in Control</h3>
                <p className="text-sm text-blue-800 leading-relaxed">
                  You can pause, stop, or start over at any time. There's no pressure. 
                  Take your time and speak from the heart.
                </p>
              </div>
            </div>
          </div>

          {/* Recording Tips */}
          <div className="card card-compact">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Recording Tips</h3>
            </div>

            <ul className="space-y-3">
              {[
                { icon: '🔇', title: 'Find a quiet space', desc: 'Minimize background noise' },
                { icon: '🗣️', title: 'Speak clearly', desc: 'Normal, comfortable pace' },
                { icon: '📖', title: 'Tell chronologically', desc: 'Past, present, future needs' },
                { icon: '✨', title: 'Include details', desc: 'Your situation and goals' },
                { icon: '💝', title: 'Express gratitude', desc: 'Hope for community support' }
              ].map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3 group">
                  <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">{tip.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{tip.title}</div>
                    <div className="text-xs text-gray-600">{tip.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* What Happens Next */}
          <div className="card card-compact bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-base mb-2">What Happens Next?</h3>
                <p className="text-xs text-amber-800 leading-relaxed mb-2">
                  After recording, you'll review your story and add any additional details. 
                  Then we'll help you create donation tools and materials.
                </p>
                <div className="text-xs text-amber-700 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                    <span>Step 2: Review & add details</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                    <span>Step 3: Create donation tools</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                    <span>Step 4: Print your materials</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
