'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ConfirmDetailsStepProps {
  data: any;
  onComplete: (data: any) => void;
  onBack: () => void;
  onHelp: () => void;
}

export default function ConfirmDetailsStep({ data, onComplete, onBack, onHelp }: ConfirmDetailsStepProps) {
  const [formData, setFormData] = useState({
    fullName: data.fullName || data.extractedFields?.name?.value || '',
    zipCode: data.zipCode || '',
    dateOfBirth: data.dateOfBirth || '',
    email: data.email || '',
    phone: data.phone || '',
    consent: data.consent || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFollowUps, setShowFollowUps] = useState(false);

  useEffect(() => {
    // Check if we have missing required fields
    if (data.missingFields && data.missingFields.length > 0) {
      setShowFollowUps(true);
    }
  }, [data.missingFields]);

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'fullName':
        if (!value || value.trim().length < 2) {
          return 'Full name is required (at least 2 characters)';
        }
        break;
      case 'zipCode':
        if (!value || !/^\d{5}$/.test(value)) {
          return 'Valid 5-digit ZIP code is required';
        }
        break;
      case 'dateOfBirth':
        if (!value) {
          return 'Date of birth is required';
        }
        const age = calculateAge(value);
        if (age < 18) {
          return 'Must be at least 18 years old';
        }
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Invalid email format';
        }
        break;
      case 'phone':
        if (value && !/^\d{10}$/.test(value.replace(/\D/g, ''))) {
          return 'Phone must be 10 digits';
        }
        break;
      case 'consent':
        if (!value) {
          return 'You must agree to proceed';
        }
        break;
    }
    return '';
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: string) => {
    const error = validateField(field, formData[field as keyof typeof formData]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    ['fullName', 'zipCode', 'dateOfBirth', 'consent'].forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Optional fields (only validate if provided)
    if (formData.email) {
      const emailError = validateField('email', formData.email);
      if (emailError) newErrors.email = emailError;
    }
    if (formData.phone) {
      const phoneError = validateField('phone', formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateAll()) {
      onComplete(formData);
    } else {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      const element = document.getElementById(`field-${firstError}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const getConfidenceBadge = (field: string) => {
    const extractedField = data.extractedFields?.[field];
    if (!extractedField) return null;

    const confidence = extractedField.confidence || 0;
    let color = 'gray';
    let label = 'Unknown';

    if (confidence >= 0.85) {
      color = 'green';
      label = 'High confidence';
    } else if (confidence >= 0.6) {
      color = 'yellow';
      label = 'Medium confidence';
    } else {
      color = 'red';
      label = 'Low confidence';
    }

    return (
      <span className={`ml-2 px-2 py-1 text-xs rounded bg-${color}-100 text-${color}-700 border border-${color}-200`}>
        {label}
      </span>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirm Your Details</h2>
        <p className="text-gray-600">
          Review and complete the information we extracted from your recording. Required fields are marked with *.
        </p>
      </div>

      {/* Missing Fields Banner */}
      {data.missingFields && data.missingFields.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                Missing Information Detected
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                We couldn't extract all required information from your recording. Please provide the following:
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                {data.missingFields.map((field: string, index: number) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
              {data.followUpQuestions && data.followUpQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowFollowUps(!showFollowUps)}
                  className="mt-3 text-sm text-yellow-800 underline hover:text-yellow-900"
                >
                  {showFollowUps ? 'Hide' : 'Show'} follow-up questions
                </button>
              )}
            </div>
          </div>
          {showFollowUps && data.followUpQuestions && (
            <div className="mt-4 pl-8 space-y-2">
              {data.followUpQuestions.map((question: string, index: number) => (
                <div key={index} className="flex items-start text-sm text-yellow-700">
                  <span className="mr-2">•</span>
                  <span>{question}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Full Name */}
        <div id="field-fullName">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
            {getConfidenceBadge('name')}
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName')}
            className={`
              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${errors.fullName ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="John Smith"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.fullName}
            </p>
          )}
        </div>

        {/* ZIP Code */}
        <div id="field-zipCode">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code <span className="text-red-500">*</span>
            {getConfidenceBadge('location')}
          </label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
            onBlur={() => handleBlur('zipCode')}
            className={`
              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${errors.zipCode ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="90001"
            maxLength={5}
          />
          {errors.zipCode && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.zipCode}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div id="field-dateOfBirth">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth <span className="text-red-500">*</span>
            {getConfidenceBadge('age')}
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            onBlur={() => handleBlur('dateOfBirth')}
            max={new Date().toISOString().split('T')[0]}
            className={`
              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.dateOfBirth}
            </p>
          )}
          {formData.dateOfBirth && !errors.dateOfBirth && (
            <p className="mt-1 text-sm text-gray-500 flex items-center">
              <Info className="w-4 h-4 mr-1" />
              Age: {calculateAge(formData.dateOfBirth)} years old
            </p>
          )}
        </div>

        {/* Email (Optional) */}
        <div id="field-email">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email (Optional)
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={`
              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${errors.email ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="your.email@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone (Optional) */}
        <div id="field-phone">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone (Optional)
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            className={`
              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${errors.phone ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="(555) 123-4567"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.phone}
            </p>
          )}
        </div>

        {/* Consent */}
        <div id="field-consent" className="border-t pt-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.consent}
              onChange={(e) => handleChange('consent', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">
              I confirm that the information provided is accurate and I consent to CareConnect using this information 
              to help me create fundraising materials. I understand that CareConnect does not create or publish 
              GoFundMe campaigns on my behalf. <span className="text-red-500">*</span>
            </span>
          </label>
          {errors.consent && (
            <p className="mt-2 text-sm text-red-600 flex items-center ml-7">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.consent}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <button
          type="button"
          onClick={onHelp}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Need help?
        </button>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center"
          >
            Next: Generate QR Code
            <CheckCircle className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </form>
  );
}
