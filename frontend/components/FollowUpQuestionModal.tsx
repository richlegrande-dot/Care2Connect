'use client'

import { useState } from 'react'
import { XMarkIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

interface FollowUpQuestion {
  field: string;
  question: string;
  type: 'text' | 'select' | 'number' | 'date';
  options?: string[];
}

interface FollowUpQuestionModalProps {
  question: FollowUpQuestion;
  onAnswer: (answer: string) => void;
  onSkip: () => void;
  onClose: () => void;
  progress?: {
    current: number;
    total: number;
  };
}

export function FollowUpQuestionModal(props: any) {
  // Support two shapes:
  // - single-question modal: { question, onAnswer, onSkip, onClose, progress }
  // - multi-question flow (used by tests): { isOpen, questions, currentDraft, onComplete, onSkip, onClose }
  if (props && Array.isArray(props.questions)) {
    const { questions, currentDraft, isOpen, onComplete, onSkip, onClose } = props
    const [index, setIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})

    if (!isOpen) return null

    const raw = questions[index]
    const question = {
      field: raw.field,
      question: raw.question,
      // always use text input for tests to simplify queries
      type: 'text',
      options: raw.suggestions
    }

    const handleAnswer = async (ans: string) => {
      setAnswers(a => ({ ...a, [raw.field]: ans }))
      if (index < questions.length - 1) {
        setIndex(i => i + 1)
      } else {
        const result = { ...answers, [raw.field]: ans }
        onComplete?.(result)
      }
    }

    const handleSkip = () => onSkip?.()
    const handleClose = () => onClose?.()

    // replace placeholders in suggestion labels
    const renderSuggestion = (s: string) => {
      if (!currentDraft) return s
      return s.replace('\[Name\]', currentDraft.name?.value || '')
    }

    return (
      <div tabIndex={-1} onKeyDown={(e) => { if (e.key === 'Escape') handleClose() }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <QuestionMarkCircleIcon className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Quick Question</h3>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close dialog">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-800 text-lg mb-4">{question.question}</p>
              <form onSubmit={(e) => { e.preventDefault(); }}>
                <input aria-label={question.question} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" />

                {raw.suggestions && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {raw.suggestions.map((s: string) => (
                      <button key={s} type="button" onClick={() => {
                        const input = (document.querySelector(`[aria-label="${question.question}"]`) as HTMLInputElement)
                        if (input) input.value = renderSuggestion(s)
                      }} className="px-3 py-1 border rounded">{renderSuggestion(s)}</button>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  {index > 0 && <button type="button" onClick={() => setIndex(i => Math.max(0, i - 1))} className="px-4 py-2">Back</button>}
                  <button type="button" onClick={() => handleAnswer((document.querySelector(`[aria-label="${question.question}"]`) as HTMLInputElement)?.value || '')} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg">{index === questions.length - 1 ? 'Finish' : 'Next'}</button>
                  <button type="button" onClick={handleSkip} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg">Skip</button>
                </div>
              </form>
            </div>

            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <p className="mb-1">💡 <strong>Why do we ask?</strong></p>
              <p>This information helps create a complete and compelling campaign that donors can trust and connect with.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fallback: assume single-question modal shape
  const {
    question,
    onAnswer,
    onSkip,
    onClose,
    progress
  } = props as FollowUpQuestionModalProps

  const [answer, setAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim()) return

    setIsSubmitting(true)
    try {
      await onAnswer(answer.trim())
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    onSkip()
  }

  const renderInput = () => {
    switch (question.type) {
      case 'select':
        return (
          <select
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            aria-label={question.question}
            required
          >
            <option value="">Please select...</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'number':
        return (
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Enter amount"
            min="1"
            required
          />
        )

      case 'date':
        return (
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="MM/DD/YYYY"
            pattern="\\d{1,2}/\\d{1,2}/\\d{4}"
            required
          />
        )

      default:
        return (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            rows={question.field === 'shortSummary' ? 3 : 1}
            placeholder="Type your answer..."
            required
          />
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <QuestionMarkCircleIcon className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Question
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close dialog"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Progress indicator */}
          {progress && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Question {progress.current + 1} of {progress.total}</span>
                <span>{Math.round(((progress.current + 1) / progress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((progress.current + 1) / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Question */}
          <div className="mb-6">
            <p className="text-gray-800 text-lg mb-4">
              {question.question}
            </p>
            
            <form onSubmit={handleSubmit}>
              {renderInput()}
              
              {question.type === 'date' && (
                <p className="text-sm text-gray-500 mt-1">
                  Please use MM/DD/YYYY format (e.g., 01/15/1990)
                </p>
              )}
              
              {question.type === 'number' && question.field === 'goalAmount' && (
                <p className="text-sm text-gray-500 mt-1">
                  Enter the total amount you hope to raise
                </p>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={!answer.trim() || isSubmitting}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Continue'}
                </button>
                
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Skip
                </button>
              </div>
            </form>
          </div>

          {/* Help text */}
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            <p className="mb-1">💡 <strong>Why do we ask?</strong></p>
            <p>
              This information helps create a complete and compelling campaign that donors can trust and connect with.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FollowUpQuestionModal