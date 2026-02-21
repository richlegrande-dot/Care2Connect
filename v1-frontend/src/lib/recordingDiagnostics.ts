/**
 * Recording Diagnostics Module
 * Checks device capabilities and suggests fixes for recording issues
 */

export interface DiagnosticResult {
  hasApi: boolean;
  hasSecureContext: boolean;
  hasAudioInput: boolean;
  permissionState: 'granted' | 'denied' | 'prompt' | 'unknown';
  suggestedActions: string[];
  canRecord: boolean;
  errorDetails?: string;
}

/**
 * Check if the browser supports media recording
 */
export function hasMediaRecordingSupport(): boolean {
  return !!(
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof MediaRecorder !== 'undefined'
  );
}

/**
 * Check if page is in a secure context (required for getUserMedia)
 */
export function isSecureContext(): boolean {
  return window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
}

/**
 * Check for available audio input devices
 */
export async function hasAudioInputDevice(): Promise<boolean> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return false;
    }
    
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(device => device.kind === 'audioinput');
    return audioInputs.length > 0;
  } catch (error) {
    console.error('Error enumerating devices:', error);
    return false;
  }
}

/**
 * Check microphone permission state
 */
export async function checkMicrophonePermission(): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> {
  try {
    // Try Permissions API (not available in all browsers)
    if (navigator.permissions && navigator.permissions.query) {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state as 'granted' | 'denied' | 'prompt';
    }
    
    // Fallback: Try to enumerate devices
    // If we get device labels, permission was granted
    // If labels are empty, permission was not granted yet
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      
      if (audioInputs.length > 0 && audioInputs[0].label) {
        return 'granted';
      }
      
      return 'prompt';
    }
    
    return 'unknown';
  } catch (error) {
    console.error('Error checking microphone permission:', error);
    return 'unknown';
  }
}

/**
 * Run comprehensive recording diagnostics
 */
export async function runRecordingDiagnostics(): Promise<DiagnosticResult> {
  const result: DiagnosticResult = {
    hasApi: false,
    hasSecureContext: false,
    hasAudioInput: false,
    permissionState: 'unknown',
    suggestedActions: [],
    canRecord: false,
  };

  // Check 1: Media API support
  result.hasApi = hasMediaRecordingSupport();
  if (!result.hasApi) {
    result.suggestedActions.push('Your browser does not support audio recording. Try using Chrome, Firefox, Edge, or Safari.');
    result.errorDetails = 'Media Recording API not available';
    return result;
  }

  // Check 2: Secure context
  result.hasSecureContext = isSecureContext();
  if (!result.hasSecureContext) {
    result.suggestedActions.push('Recording requires a secure connection (HTTPS). Please contact staff for assistance.');
    result.errorDetails = 'Not in secure context';
    return result;
  }

  // Check 3: Audio input devices
  result.hasAudioInput = await hasAudioInputDevice();
  if (!result.hasAudioInput) {
    result.suggestedActions.push('No microphone detected. Please connect a microphone or use a device with a built-in microphone.');
    result.errorDetails = 'No audio input devices found';
  }

  // Check 4: Permission state
  result.permissionState = await checkMicrophonePermission();
  
  if (result.permissionState === 'denied') {
    result.suggestedActions.push('Microphone access is blocked. Click the lock icon in your browser address bar and allow microphone access.');
    if (navigator.userAgent.includes('Windows')) {
      result.suggestedActions.push('On Windows: Open Settings → Privacy & security → Microphone, and ensure browser access is enabled.');
    }
    result.errorDetails = 'Microphone permission denied';
  } else if (result.permissionState === 'prompt') {
    result.suggestedActions.push('Click "Allow" when your browser asks for microphone access.');
  }

  // Determine if recording is possible
  result.canRecord = 
    result.hasApi && 
    result.hasSecureContext && 
    result.hasAudioInput && 
    result.permissionState !== 'denied';

  if (result.canRecord && result.suggestedActions.length === 0) {
    result.suggestedActions.push('✓ Your device is ready to record!');
  }

  return result;
}

/**
 * Get user-friendly error message based on getUserMedia error
 */
export function getRecordingErrorMessage(error: Error | DOMException): string {
  const errorName = error.name;

  switch (errorName) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
    case 'SecurityError':
      return 'Microphone access is blocked. Please allow microphone access in your browser settings, or ask a staff member for help.';
    
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'No microphone was found. Check that a microphone is connected and enabled.';
    
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return 'Your microphone seems to be in use by another app. Close other apps using the microphone and try again.';
    
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return "This device can't match the requested microphone settings. Try another microphone or device.";
    
    case 'TypeError':
      return 'Recording setup failed. Please refresh the page and try again.';
    
    default:
      return "We couldn't start the microphone. Please try again or ask a staff member for help.";
  }
}

/**
 * Check if error is transient and worth retrying
 */
export function isTransientError(error: Error | DOMException): boolean {
  const errorName = error.name;
  return errorName === 'AbortError' || 
         errorName === 'NotReadableError' || 
         errorName === 'TrackStartError';
}

/**
 * Log recording error to backend (non-blocking, no PII)
 */
export async function logRecordingError(
  errorName: string,
  permissionState: string,
  hasAudioInput: boolean,
  kioskId?: string
): Promise<void> {
  try {
    // Truncate user agent to avoid PII
    const userAgentSnippet = navigator.userAgent.split(' ').slice(0, 3).join(' ');
    
    // Detect connectivity status
    const connectivity = navigator.onLine ? 'online' : 'offline';
    
    await fetch('http://localhost:3001/api/system/recording-error-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        errorName,
        permissionState,
        hasAudioInput,
        userAgent: userAgentSnippet,
        connectivity,
        kioskId: kioskId || 'unknown',
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    // Silently fail - don't block user experience
    console.debug('Failed to log recording error:', error);
  }
}
