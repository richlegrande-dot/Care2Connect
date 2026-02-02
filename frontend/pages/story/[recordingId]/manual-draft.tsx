/**
 * Manual Draft Page
 * 
 * Route: /story/[recordingId]/manual-draft
 * Purpose: Fallback UI when automated pipeline fails
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ManualDraftEditor from '@/components/ManualDraftEditor';

interface PipelineFailure {
  success: false;
  reasonCode: string;
  userMessage: string;
  debugId: string;
  ticketId: string;
  partialData?: {
    transcript?: string;
    extractedFields?: {
      title?: string;
      story?: string;
      goalAmount?: number;
    };
  };
}

export default function ManualDraftPage() {
  const router = useRouter();
  const { recordingId } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [failureData, setFailureData] = useState<PipelineFailure | null>(null);
  const [existingDraft, setExistingDraft] = useState<any>(null);

  useEffect(() => {
    if (!recordingId) return;

    const loadDraftData = async () => {
      setLoading(true);
      setError('');

      try {
        // Try to load existing manual draft
        const response = await fetch(`/api/donations/manual-draft/${recordingId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.draft) {
            setExistingDraft(data.draft);
            
            // If we have an existing draft, use it
            setFailureData({
              success: false,
              reasonCode: 'MANUAL_EDIT',
              userMessage: 'Continue editing your draft',
              debugId: data.draft.ticketId,
              ticketId: data.draft.ticketId,
              partialData: {
                extractedFields: {
                  title: data.draft.title,
                  story: data.draft.story,
                  goalAmount: data.draft.goalAmount
                }
              }
            });
          }
        } else {
          // No existing draft - this is a fresh fallback from pipeline
          // Check if we have failure data in sessionStorage or query params
          const storedFailure = sessionStorage.getItem(`pipeline_failure_${recordingId}`);
          
          if (storedFailure) {
            const parsedFailure = JSON.parse(storedFailure);
            setFailureData(parsedFailure);
          } else {
            // Fallback to basic mode
            setFailureData({
              success: false,
              reasonCode: 'UNKNOWN',
              userMessage: 'Please create your fundraising campaign manually',
              debugId: String(recordingId),
              ticketId: String(recordingId)
            });
          }
        }
      } catch (err) {
        console.error('Failed to load draft data:', err);
        setError('Failed to load draft. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDraftData();
  }, [recordingId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading editor...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            gap: 1rem;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #0d6efd;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Draft</h2>
        <p>{error}</p>
        <button onClick={() => router.back()} className="btn-back">
          Go Back
        </button>
        <style jsx>{`
          .error-container {
            max-width: 600px;
            margin: 2rem auto;
            padding: 2rem;
            text-align: center;
          }

          .btn-back {
            padding: 0.75rem 1.5rem;
            background: #0d6efd;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
          }

          .btn-back:hover {
            background: #0b5ed7;
          }
        `}</style>
      </div>
    );
  }

  if (!failureData) {
    return null;
  }

  return (
    <ManualDraftEditor
      ticketId={failureData.ticketId}
      failureReason={failureData.reasonCode}
      userMessage={failureData.userMessage}
      partialData={failureData.partialData}
    />
  );
}
