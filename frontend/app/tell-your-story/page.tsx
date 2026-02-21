'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MicrophoneIcon, 
  StopIcon, 
  PlayIcon, 
  PauseIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  QrCodeIcon,
  DocumentTextIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Link from 'next/link'

// API base URL resolution
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3003';
    }
    
    if (hostname === 'care2connects.org' || hostname === 'www.care2connects.org') {
      return 'https://api.care2connects.org';
    }
  }
  
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
};

export default function TellYourStoryPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showConsent, setShowConsent] = useState(true)
  const [consentGiven, setConsentGiven] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false)
  const [ticketId, setTicketId] = useState<string | null>(null)
  const [processingStatus, setProcessingStatus] = useState<string>('')
  const [processingProgress, setProcessingProgress] = useState<number>(0)

  // Form fields
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [location, setLocation] = useState('')
  const [language, setLanguage] = useState('en')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const statusPollRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (statusPollRef.current) {
        clearInterval(statusPollRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // Stop the stream
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      toast.success('Recording started!')
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Could not access microphone. Please check permissions.')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
        // Resume timer
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
        // Pause timer
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      toast.success('Recording completed!')
    }
  }

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async () => {
    if (!audioBlob) {
      toast.error('Please record your story first')
      return
    }

    if (!consentGiven) {
      toast.error('Please give consent to continue')
      return
    }

    setIsProcessing(true)
    setProcessingStatus('Creating your profile...')
    setProcessingProgress(0)

    try {
      const apiBaseUrl = getApiBaseUrl();

      // Step 1: Start the story ticket
      const startResponse = await fetch(`${apiBaseUrl}/api/story/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name || null,
          age: age || null,
          location: location || null,
          language: language,
        }),
      })

      if (!startResponse.ok) {
        throw new Error('Failed to start story processing')
      }

      const startData = await startResponse.json()
      const newTicketId = startData.ticketId
      setTicketId(newTicketId)

      setProcessingStatus('Uploading your recording...')
      setProcessingProgress(10)

      // Step 2: Upload the audio
      const formData = new FormData()
      formData.append('audio', audioBlob, 'story.webm')
      formData.append('language', language)

      const uploadResponse = await fetch(`${apiBaseUrl}/api/story/${newTicketId}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload audio')
      }

      setProcessingProgress(20)

      // Step 3: Poll for status updates
      startStatusPolling(newTicketId)

      toast.success('Processing started! This may take a few moments...')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to process your story. Please try again.')
      setIsProcessing(false)
      setProcessingStatus('')
      setProcessingProgress(0)
    }
  }

  const startStatusPolling = (ticketId: string) => {
    const apiBaseUrl = getApiBaseUrl();

    statusPollRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/story/${ticketId}/status`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch status')
        }

        const data = await response.json()

        // Update status
        setProcessingStatus(getStatusMessage(data.status))
        setProcessingProgress(data.progress)

        // Check if completed
        if (data.status === 'COMPLETED') {
          if (statusPollRef.current) {
            clearInterval(statusPollRef.current)
          }

          setProcessingStatus('All done!')
          setProcessingProgress(100)

          // Wait a moment then redirect
          setTimeout(() => {
            router.push(`/profile/${ticketId}`)
          }, 1500)
        }

        // Check if failed
        if (data.status === 'FAILED') {
          if (statusPollRef.current) {
            clearInterval(statusPollRef.current)
          }

          toast.error('Processing failed. Please try again.')
          setIsProcessing(false)
          setProcessingStatus('')
          setProcessingProgress(0)
        }
      } catch (error) {
        console.error('Status polling error:', error)
      }
    }, 2000) // Poll every 2 seconds
  }

  const getStatusMessage = (status: string): string => {
    const messages: Record<string, string> = {
      CREATED: 'Initializing...',
      UPLOADING: 'Uploading your recording...',
      TRANSCRIBING: 'Transcribing your story...',
      ANALYZING: 'Analyzing and extracting details...',
      GENERATING_QR: 'Generating your QR code...',
      GENERATING_DOC: 'Creating your GoFundMe draft...',
      COMPLETED: 'All done!',
      FAILED: 'Processing failed',
    }
    return messages[status] || 'Processing...'
  }

  if (showConsent) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Before We Begin</h1>
              <p className="text-lg text-gray-600">
                Your privacy and dignity are our top priorities. Please review the following information.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-start">
                  <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">How Your Story Will Be Used</h3>
                    <ul className="text-blue-800 space-y-1 text-sm">
                      <li>• We'll transcribe your audio recording using secure AI technology</li>
                      <li>• Your story helps create a personalized profile with QR code and GoFundMe draft</li>
                      <li>• You control who can see your profile and information</li>
                      <li>• You can access your profile anytime with your unique ID</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="consent" className="text-gray-700">
                    <span className="font-medium">I consent to sharing my story</span> and understand that:
                    <ul className="mt-2 text-sm text-gray-600 space-y-1">
                      <li>• My audio will be processed to create a text transcript</li>
                      <li>• AI will help extract key information to create my profile</li>
                      <li>• My information will be stored securely and encrypted</li>
                      <li>• A QR code and GoFundMe draft will be generated for me</li>
                    </ul>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="public"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="public" className="text-gray-700">
                    <span className="font-medium">Make my profile public</span> (optional)
                    <p className="mt-1 text-sm text-gray-600">
                      Allow others to view my story and profile. This helps potential donors and supporters find me.
                    </p>
                  </label>
                </div>
              </div>

              {/* Basic info form */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="font-semibold text-gray-900">Tell us a bit about yourself (optional)</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        id="age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Age"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, State"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="auto">Auto-detect</option>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                      <option value="pt">Portuguese</option>
                      <option value="ru">Russian</option>
                      <option value="ar">Arabic</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Link href="/" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
                <button
                  onClick={() => setShowConsent(false)}
                  disabled={!consentGiven}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Continue to Recording
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Processing overlay
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            {/* Animated icon */}
            <div className="mb-8 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-blue-100 rounded-full animate-ping opacity-20"></div>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                  <SparklesIcon className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Processing Your Story
            </h2>

            <p className="text-lg text-gray-600 mb-8">
              {processingStatus}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">{processingProgress}% complete</p>

            {/* Steps indicator */}
            <div className="mt-8 grid grid-cols-4 gap-2 text-xs">
              <div className={`flex flex-col items-center ${processingProgress >= 10 ? 'text-blue-600' : 'text-gray-400'}`}>
                <MicrophoneIcon className="w-6 h-6 mb-1" />
                <span>Upload</span>
              </div>
              <div className={`flex flex-col items-center ${processingProgress >= 40 ? 'text-blue-600' : 'text-gray-400'}`}>
                <DocumentTextIcon className="w-6 h-6 mb-1" />
                <span>Transcribe</span>
              </div>
              <div className={`flex flex-col items-center ${processingProgress >= 70 ? 'text-blue-600' : 'text-gray-400'}`}>
                <QrCodeIcon className="w-6 h-6 mb-1" />
                <span>QR Code</span>
              </div>
              <div className={`flex flex-col items-center ${processingProgress >= 90 ? 'text-blue-600' : 'text-gray-400'}`}>
                <DocumentTextIcon className="w-6 h-6 mb-1" />
                <span>Document</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Hang tight!</strong> We're creating your profile, QR code, and GoFundMe draft document.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Tell Your Story</h1>
            <p className="text-lg text-gray-600">
              Share your experiences, skills, and dreams. Your story matters and helps us create your personalized support profile.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                <CheckCircleIcon className="w-4 h-4" />
                <span>AI Transcription</span>
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                <CheckCircleIcon className="w-4 h-4" />
                <span>QR Code Generated</span>
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                <CheckCircleIcon className="w-4 h-4" />
                <span>GoFundMe Draft</span>
              </div>
            </div>
          </div>

          {/* Recording Interface */}
          <div className="text-center space-y-6">
            {/* Audio Visualizer / Status */}
            <div className="h-32 flex items-center justify-center">
              {isRecording ? (
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                    <MicrophoneIcon className="w-8 h-8 text-white relative z-10" />
                  </div>
                  <div className="flex items-end space-x-1 h-12">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 bg-red-500 rounded-full"
                        style={{
                          animation: `audioBar 0.8s ease-in-out ${i * 0.1}s infinite`,
                          height: '50%',
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : audioBlob ? (
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-8 h-8 text-white" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <MicrophoneIcon className="w-8 h-8 text-gray-600" />
                </div>
              )}
            </div>

            {/* Recording Time */}
            <div className="text-3xl font-mono text-gray-700">
              {formatTime(recordingTime)}
            </div>

            {/* Recording Status */}
            <div className="text-center">
              {isRecording ? (
                <p className="text-red-600 font-medium">
                  {isPaused ? 'Recording Paused' : 'Recording...'}
                </p>
              ) : audioBlob ? (
                <p className="text-green-600 font-medium">Recording Complete ✓</p>
              ) : (
                <p className="text-gray-600">Ready to record</p>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              {!isRecording && !audioBlob && (
                <button
                  onClick={startRecording}
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition shadow-lg"
                >
                  <MicrophoneIcon className="w-5 h-5 mr-2" />
                  <span>Start Recording</span>
                </button>
              )}

              {isRecording && (
                <>
                  <button
                    onClick={pauseRecording}
                    className="inline-flex items-center px-6 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition"
                  >
                    {isPaused ? (
                      <>
                        <PlayIcon className="w-5 h-5 mr-2" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <PauseIcon className="w-5 h-5 mr-2" />
                        <span>Pause</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={stopRecording}
                    className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition"
                  >
                    <StopIcon className="w-5 h-5 mr-2" />
                    <span>Stop</span>
                  </button>
                </>
              )}

              {audioBlob && (
                <>
                  <button
                    onClick={playAudio}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                  >
                    {isPlaying ? (
                      <>
                        <PauseIcon className="w-5 h-5 mr-2" />
                        <span>Pause Playback</span>
                      </>
                    ) : (
                      <>
                        <PlayIcon className="w-5 h-5 mr-2" />
                        <span>Play Recording</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setAudioBlob(null)
                      setAudioUrl(null)
                      setRecordingTime(0)
                      setIsPlaying(false)
                    }}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    Record Again
                  </button>
                </>
              )}
            </div>

            {/* Audio Element */}
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            )}

            {/* Submit Button */}
            {audioBlob && (
              <div className="pt-8 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-6 h-6 mr-2" />
                      Create My Profile & Documents
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-3">
                  This will transcribe your story, generate a QR code, and create a GoFundMe draft document
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2" />
              Recording Tips:
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Find a quiet place with minimal background noise</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Speak clearly and at a normal pace</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Share your experiences, skills, goals, and current needs</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Mention any job history, talents, or things you're good at</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Don't worry about being perfect - just be yourself!</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>You can pause and resume anytime, or start over if needed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes audioBar {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  )
}
