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
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Link from 'next/link'
import ProcessingOverlay from '@/components/ProcessingOverlay'

export default function TellStoryPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showConsent, setShowConsent] = useState(true)
  const [consentGiven, setConsentGiven] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [showProcessing, setShowProcessing] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
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

    setIsUploading(true)

    try {
      // Create anonymous user first
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/anonymous`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!userResponse.ok) {
        throw new Error('Failed to create user session')
      }

      const userData = await userResponse.json()
      const userId = userData.data.userId

      // Upload consent preferences
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/update-consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          consentGiven: true,
          isProfilePublic: isPublic,
        }),
      })

      // Upload audio file
      const formData = new FormData()
      formData.append('audio', audioBlob, 'story.webm')
      formData.append('userId', userId)

      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transcribe`, {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload audio')
      }

      const transcriptionData = await uploadResponse.json()

      // Create profile
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          transcript: transcriptionData.data.transcript,
          profileData: transcriptionData.data.profileData,
          consentGiven: true,
          isProfilePublic: isPublic,
        }),
      })

      if (!profileResponse.ok) {
        throw new Error('Failed to create profile')
      }

      const profileData = await profileResponse.json()

      toast.success('Your story has been processed successfully!')
      setIsUploading(false)
      
      // Show processing overlay with animation
      setShowProcessing(true)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to process your story. Please try again.')
      setIsUploading(false)
    }
  }

  const handleProcessingComplete = () => {
    // Navigate after animation completes
    router.push('/gfm/extract')
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
                      <li>• Your story helps create a personalized profile with resources and opportunities</li>
                      <li>• You control who can see your profile and information</li>
                      <li>• You can delete your story and profile at any time</li>
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
                    className="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="consent" className="text-gray-700">
                    <span className="font-medium">I consent to sharing my story</span> and understand that:
                    <ul className="mt-2 text-sm text-gray-600 space-y-1">
                      <li>• My audio will be processed to create a text transcript</li>
                      <li>• AI will help extract key information to create my profile</li>
                      <li>• My information will be stored securely and encrypted</li>
                      <li>• I retain full control over my data and can delete it anytime</li>
                    </ul>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="public"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="public" className="text-gray-700">
                    <span className="font-medium">Make my profile public</span> (optional)
                    <p className="mt-1 text-sm text-gray-600">
                      Allow others to view my story and profile. This helps potential donors and supporters find me, 
                      but you can change this setting anytime.
                    </p>
                  </label>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Link href="/" className="btn-ghost flex items-center">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
                <button
                  onClick={() => setShowConsent(false)}
                  disabled={!consentGiven}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Tell Your Story</h1>
            <p className="text-lg text-gray-600">
              Share your experiences, skills, and dreams. Your story matters and helps us connect you with the right resources and opportunities.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                <CheckCircleIcon className="w-4 h-4" />
                <span>AI Transcription</span>
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                <CheckCircleIcon className="w-4 h-4" />
                <span>Multi-Language Support</span>
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                <CheckCircleIcon className="w-4 h-4" />
                <span>Auto Profile Creation</span>
              </div>
            </div>
          </div>

          {/* Recording Interface */}
          <div className="text-center space-y-6">
            {/* Audio Visualizer / Status */}
            <div className="h-32 flex items-center justify-center">
              {isRecording ? (
                <div className="flex items-center space-x-2">
                  <div className="recording-pulse w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                    <MicrophoneIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="audio-visualizer">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="audio-bar"
                        style={{ animationDelay: `${i * 0.1}s` }}
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
            <div className="text-2xl font-mono text-gray-700">
              {formatTime(recordingTime)}
            </div>

            {/* Recording Status */}
            <div className="text-center">
              {isRecording ? (
                <p className="text-red-600 font-medium">
                  {isPaused ? 'Recording Paused' : 'Recording...'}
                </p>
              ) : audioBlob ? (
                <p className="text-green-600 font-medium">Recording Complete</p>
              ) : (
                <p className="text-gray-600">Ready to record</p>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              {!isRecording && !audioBlob && (
                <button
                  onClick={startRecording}
                  className="btn-primary flex items-center space-x-2"
                >
                  <MicrophoneIcon className="w-5 h-5" />
                  <span>Start Recording</span>
                </button>
              )}

              {isRecording && (
                <>
                  <button
                    onClick={pauseRecording}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    {isPaused ? (
                      <>
                        <PlayIcon className="w-5 h-5" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <PauseIcon className="w-5 h-5" />
                        <span>Pause</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={stopRecording}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <StopIcon className="w-5 h-5" />
                    <span>Stop</span>
                  </button>
                </>
              )}

              {audioBlob && (
                <>
                  <button
                    onClick={playAudio}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    {isPlaying ? (
                      <>
                        <PauseIcon className="w-5 h-5" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <PlayIcon className="w-5 h-5" />
                        <span>Play</span>
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
                    className="btn-ghost"
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
                  disabled={isUploading}
                  className="btn-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <div className="spinner mr-2" />
                      Processing Your Story...
                    </>
                  ) : (
                    'Create My Profile'
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  This will transcribe your audio and create your personalized profile
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="mt-12 bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Recording Tips:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Find a quiet place with minimal background noise</li>
              <li>• Speak clearly and at a normal pace</li>
              <li>• Share your experiences, skills, goals, and current needs</li>
              <li>• Mention any job history, talents, or things you're good at</li>
              <li>• Don't worry about being perfect - just be yourself</li>
              <li>• You can pause and resume anytime, or start over if needed</li>
            </ul>
          </div>
        </div>

        {/* Processing Overlay */}
        {showProcessing && (
          <ProcessingOverlay 
            onComplete={handleProcessingComplete} 
            duration={5000} 
          />
        )}
      </div>
    </div>
  )
}