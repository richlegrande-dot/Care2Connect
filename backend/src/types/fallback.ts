/**
 * Manual Fundraising Fallback Flow - Type Definitions
 *
 * Ensures users never hit a dead end when automated pipeline fails
 */

export type PipelineFailureReasonCode =
  | "TRANSCRIPTION_FAILED"
  | "PARSING_INCOMPLETE"
  | "DRAFT_GENERATION_FAILED"
  | "DOCX_FAILED"
  | "PIPELINE_EXCEPTION"
  | "SYSTEM_DEGRADED";

export interface PipelineFailureResponse {
  success: false;
  fallbackRequired: true;
  reasonCode: PipelineFailureReasonCode;
  userMessage: string; // friendly, non-technical
  debugId?: string; // incident or trace id
  partialData?: {
    transcript?: string;
    extractedFields?: Partial<DonationDraftData>;
  };
}

export interface PipelineSuccessResponse {
  success: true;
  fallbackRequired: false;
  draft: DonationDraftData;
  qrCode?: {
    dataUrl: string;
    checkoutUrl: string;
  };
}

export type PipelineResponse =
  | PipelineSuccessResponse
  | PipelineFailureResponse;

export type GenerationMode = "AUTOMATED" | "MANUAL_FALLBACK";

export interface DonationDraftData {
  id?: string;
  ticketId: string;
  title: string;
  story: string;
  goalAmount: number;
  currency?: string;
  generationMode: GenerationMode;
  extractedAt?: Date;
  manuallyEditedAt?: Date;
}

export interface ManualDraftRequest {
  ticketId: string;
  title: string;
  story: string;
  goalAmount: number;
  currency?: string;
}

export interface ManualDraftResponse {
  success: boolean;
  draft?: DonationDraftData;
  error?: string;
}

/**
 * User-friendly error messages for each failure reason
 */
export const FALLBACK_USER_MESSAGES: Record<PipelineFailureReasonCode, string> =
  {
    TRANSCRIPTION_FAILED:
      "We couldn't transcribe your recording. You can continue by entering your campaign details manually below.",
    PARSING_INCOMPLETE:
      "We couldn't extract all the details from your recording. Please review and complete the information below.",
    DRAFT_GENERATION_FAILED:
      "We encountered an issue generating your campaign. You can enter the details manually below.",
    DOCX_FAILED:
      "We couldn't create the document automatically. You can continue by entering your campaign information below.",
    PIPELINE_EXCEPTION:
      "Something unexpected happened. Don't worry—you can continue by filling out your campaign details manually.",
    SYSTEM_DEGRADED:
      "Our system is experiencing issues. You can still create your campaign by entering the details manually below.",
  };
