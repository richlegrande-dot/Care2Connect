'use client'

interface Step {
  number: number
  title: string
  description: string
  path?: string
  icon?: string
}

interface StepProgressProps {
  currentStep: number
  steps?: Step[]
}

const defaultSteps: Step[] = [
  {
    number: 1,
    title: 'Tell Your Story',
    description: 'Record your voice',
    path: '/tell-your-story',
    icon: 'microphone'
  },
  {
    number: 2,
    title: 'Review & Details',
    description: 'Add information',
    path: '/details',
    icon: 'document'
  },
  {
    number: 3,
    title: 'Donations Setup',
    description: 'QR codes & links',
    path: '/donate-setup',
    icon: 'credit-card'
  },
  {
    number: 4,
    title: 'Print Kit',
    description: 'GoFundMe draft',
    path: '/kit/summary',
    icon: 'printer'
  }
]

// Step Icons Component
function StepIcon({ icon, className = '' }: { icon?: string; className?: string }) {
  const iconPath = {
    microphone: 'M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z',
    document: 'M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z',
    'credit-card': 'M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z',
    printer: 'M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z'
  }[icon || ''] || ''

  if (!iconPath) return null

  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d={iconPath} />
    </svg>
  )
}

export default function StepProgress({ currentStep, steps = defaultSteps }: StepProgressProps) {
  return (
    <div className="w-full mb-12" role="navigation" aria-label="Progress steps">
      {/* Mobile View - Simplified */}
      <div className="md:hidden">
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-[#1B3A5D]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-xs text-gray-500">
              {Math.round((currentStep / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="mb-2">
            <h3 className="text-lg font-bold text-[#1B3A5D]">
              {steps[currentStep - 1]?.title}
            </h3>
            <p className="text-sm text-gray-600">
              {steps[currentStep - 1]?.description}
            </p>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#1B3A5D] h-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
              role="progressbar"
              aria-valuenow={currentStep}
              aria-valuemin={1}
              aria-valuemax={steps.length}
              aria-label={`Step ${currentStep} of ${steps.length}`}
            />
          </div>
        </div>
      </div>

      {/* Desktop View - Full Stepper */}
      <div className="hidden md:block">
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
          <div className="flex items-center justify-between relative">
            {/* Connection Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-300 -z-10" aria-hidden="true">
              <div 
                className="h-full bg-[#1B3A5D] transition-all duration-500 ease-out"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Step Items */}
            {steps.map((step) => {
              const isCompleted = step.number < currentStep
              const isActive = step.number === currentStep
              const isUpcoming = step.number > currentStep

              return (
                <div 
                  key={step.number} 
                  className="flex flex-col items-center relative"
                  style={{ flex: 1 }}
                >
                  {/* Step Circle */}
                  <div
                    className={`
                      step-indicator
                      ${isActive ? 'active' : ''}
                      ${isCompleted ? 'completed' : ''}
                      ${isUpcoming ? 'upcoming' : ''}
                    `}
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={`Step ${step.number}: ${step.title}`}
                  >
                    {isCompleted ? (
                      // Checkmark for completed steps
                      <svg className="w-5 h-5 animate-scale-in" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : isActive ? (
                      // Icon for active step
                      <StepIcon icon={step.icon} className="w-5 h-5 animate-scale-in" />
                    ) : (
                      // Step number for upcoming
                      <span>{step.number}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-4 text-center max-w-[140px]">
                    <div 
                      className={`
                        font-bold text-sm uppercase tracking-wide mb-1
                        ${isActive ? 'text-[#1B3A5D]' : ''}
                        ${isCompleted ? 'text-green-700' : ''}
                        ${isUpcoming ? 'text-gray-500' : ''}
                      `}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-600">
                      {step.description}
                    </div>
                  </div>

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#C1121F] rounded-full" aria-hidden="true" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Current Step Detail */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
            <p className="text-gray-600 text-base">
              <span className="font-semibold text-[#1B3A5D]">Current Step:</span>{' '}
              {steps[currentStep - 1]?.title} — {steps[currentStep - 1]?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
