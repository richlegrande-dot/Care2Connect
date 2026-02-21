'use client'

import { useEffect, useState } from 'react'

interface LoadingAnalyzingProps {
  message?: string
  submessage?: string
  onComplete?: () => void
  duration?: number
}

export default function LoadingAnalyzing({
  message = "Analyzing your story and preparing your next steps...",
  submessage = "Please wait while we process your information.",
  onComplete,
  duration = 3000
}: LoadingAnalyzingProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          if (onComplete) {
            setTimeout(onComplete, 300)
          }
          return 100
        }
        return prev + 2
      })
    }, duration / 50)

    return () => clearInterval(interval)
  }, [duration, onComplete])

  return (
    <div className="fixed inset-0 blur-backdrop flex items-center justify-center z-50 animate-fade-in" role="alert" aria-live="polite" aria-busy="true">
      <div className="bg-white rounded-xl shadow-2xl p-10 max-w-md w-full mx-4 animate-scale-in">
        {/* Government Seal/Logo Placeholder */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg" style={{
            animation: 'breathe 4s ease-in-out infinite'
          }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Main Message */}
        <h2 className="text-2xl font-bold text-[#1B3A5D] text-center mb-3">
          {message}
        </h2>
        
        <p className="text-gray-600 text-center mb-8 text-base">
          {submessage}
        </p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-[#1B3A5D] h-full transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Processing: ${progress}% complete`}
            />
          </div>
          <div className="text-center mt-2">
            <span className="text-sm font-semibold text-gray-700">{progress}%</span>
          </div>
        </div>

        {/* Processing Steps Indicator */}
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center transition-all duration-500 ${progress > 20 ? 'bg-green-500 scale-100' : 'bg-gray-300 scale-95'}`}>
              {progress > 20 && (
                <svg className="w-3 h-3 text-white animate-scale-in" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className={`transition-all duration-500 ${progress > 20 ? 'text-gray-800 font-medium translate-x-0' : 'text-gray-500 -translate-x-1'}`}>
              Processing your information
            </span>
          </div>

          <div className="flex items-center text-sm" style={{ transitionDelay: '200ms' }}>
            <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center transition-all duration-500 ${progress > 50 ? 'bg-green-500 scale-100' : 'bg-gray-300 scale-95'}`}>
              {progress > 50 && (
                <svg className="w-3 h-3 text-white animate-scale-in" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className={`transition-all duration-500 ${progress > 50 ? 'text-gray-800 font-medium translate-x-0' : 'text-gray-500 -translate-x-1'}`}>
              Preparing your profile
            </span>
          </div>

          <div className="flex items-center text-sm" style={{ transitionDelay: '400ms' }}>
            <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center transition-all duration-500 ${progress > 80 ? 'bg-green-500 scale-100' : 'bg-gray-300 scale-95'}`}>
              {progress > 80 && (
                <svg className="w-3 h-3 text-white animate-scale-in" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className={`transition-all duration-500 ${progress > 80 ? 'text-gray-800 font-medium translate-x-0' : 'text-gray-500 -translate-x-1'}`}>
              Finalizing next steps
            </span>
          </div>
        </div>

        {/* Spinner */}
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#1B3A5D]" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  )
}
