'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

// Import step components
import ConfirmDetailsStep from '@/components/funding-wizard/ConfirmDetailsStep';
import QRCodeStep from '@/components/funding-wizard/QRCodeStep';
import GoFundMeDraftStep from '@/components/funding-wizard/GoFundMeDraftStep';
import GoFundMeWizardStep from '@/components/funding-wizard/GoFundMeWizardStep';
import PrintKitStep from '@/components/funding-wizard/PrintKitStep';
import HelpModal from '@/components/funding-wizard/HelpModal';

interface FundingWizardData {
  // Client info
  fullName: string;
  zipCode: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  consent: boolean;

  // Extracted fields from topic spotter
  extractedFields: {
    name?: string;
    age?: string;
    location?: string;
    goalAmount?: string;
    category?: string;
    beneficiary?: string;
    story?: string;
  };

  // Follow-up questions
  missingFields: string[];
  followUpQuestions: string[];

  // QR code data
  publicSlug?: string;
  qrCodeUrl?: string;
  donationPageUrl?: string;

  // GoFundMe draft
  gofundmeDraft?: {
    title: string;
    goal: string;
    category: string;
    location: string;
    beneficiary: string;
    story: string;
    summary: string;
  };
}

const WIZARD_STEPS = [
  { id: 1, title: 'Confirm Your Details', description: 'Verify and complete information' },
  { id: 2, title: 'Generate Donation QR Code', description: 'Create shareable donation link' },
  { id: 3, title: 'Prepare GoFundMe Draft', description: 'Review auto-generated content' },
  { id: 4, title: 'Finalize GoFundMe Manually', description: 'Step-by-step guide' },
  { id: 5, title: 'Download Print Kit', description: 'Get all materials' }
];

export default function FundingSetupWizard() {
  const params = useParams();
  const router = useRouter();
  const clientId = (params?.clientId as string) || '';

  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<FundingWizardData>({
    fullName: '',
    zipCode: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    consent: false,
    extractedFields: {},
    missingFields: [],
    followUpQuestions: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [helpContext, setHelpContext] = useState('');

  // Load client data and extracted fields
  useEffect(() => {
    const loadClientData = async () => {
      setIsLoading(true);
      try {
        // Load from local storage first (client-side state)
        const savedData = localStorage.getItem(`funding-wizard-${clientId}`);
        if (savedData) {
          setWizardData(JSON.parse(savedData));
        }

        // Fetch analysis results (extracted fields, follow-ups)
        const response = await fetch(`/api/analysis/${clientId}`);
        if (response.ok) {
          const analysisData = await response.json();
          
          setWizardData(prev => ({
            ...prev,
            extractedFields: analysisData.extractedFields || {},
            missingFields: analysisData.missingFields || [],
            followUpQuestions: analysisData.followUpQuestions || [],
            // Pre-fill from extracted data
            fullName: analysisData.extractedFields?.name?.value || prev.fullName,
            zipCode: extractLocationZip(analysisData.extractedFields?.location?.value) || prev.zipCode
          }));
        }
      } catch (error) {
        console.error('[FundingWizard] Error loading client data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      loadClientData();
    }
  }, [clientId]);

  // Save wizard progress to local storage
  useEffect(() => {
    if (!isLoading && clientId) {
      localStorage.setItem(`funding-wizard-${clientId}`, JSON.stringify(wizardData));
    }
  }, [wizardData, clientId, isLoading]);

  const extractLocationZip = (location?: string): string => {
    if (!location) return '';
    // Try to extract ZIP code from location string
    const zipMatch = location.match(/\b\d{5}\b/);
    return zipMatch ? zipMatch[0] : '';
  };

  const handleStepComplete = (stepData: Partial<FundingWizardData>) => {
    setWizardData(prev => ({ ...prev, ...stepData }));
    
    // Auto-advance to next step
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const openHelp = (context: string) => {
    setHelpContext(context);
    setShowHelp(true);
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {WIZARD_STEPS.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  transition-colors duration-200
                  ${currentStep === step.id
                    ? 'bg-blue-600 text-white'
                    : currentStep > step.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}
              >
                {currentStep > step.id ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${currentStep === step.id ? 'text-blue-600' : 'text-gray-600'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-[150px]">
                  {step.description}
                </p>
              </div>
            </div>
            {index < WIZARD_STEPS.length - 1 && (
              <div
                className={`
                  h-1 flex-1 mx-2 transition-colors duration-200
                  ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'}
                `}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ConfirmDetailsStep
            data={wizardData}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
            onHelp={() => openHelp('confirm_details')}
          />
        );
      case 2:
        return (
          <QRCodeStep
            data={wizardData}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
            onHelp={() => openHelp('qr_code')}
            clientId={clientId}
          />
        );
      case 3:
        return (
          <GoFundMeDraftStep
            data={wizardData}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
            onHelp={() => openHelp('gofundme_draft')}
            clientId={clientId}
          />
        );
      case 4:
        return (
          <GoFundMeWizardStep
            data={wizardData}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
            onHelp={() => openHelp('gofundme_wizard')}
          />
        );
      case 5:
        return (
          <PrintKitStep
            data={wizardData}
            onBack={handleStepBack}
            clientId={clientId}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Funding Setup Wizard
          </h1>
          <p className="text-gray-600">
            Complete the following steps to finalize your fundraising campaign
          </p>
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {renderStepIndicator()}
        </div>

        {/* Current Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {renderCurrentStep()}
        </div>

        {/* Help Button (Floating) */}
        <button
          onClick={() => openHelp('general')}
          className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
          title="Need help?"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <HelpModal
          context={helpContext}
          onClose={() => setShowHelp(false)}
          clientId={clientId}
        />
      )}
    </div>
  );
}
