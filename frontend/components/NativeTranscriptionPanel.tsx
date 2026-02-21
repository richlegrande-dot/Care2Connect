/**
 * Native Transcription Panel Component
 * Browser-native speech recognition (Web Speech API)
 * NO API KEYS REQUIRED
 */

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface NativeTranscriptionPanelProps {
  onTranscriptChange: (
    transcript: string,
    isFinal: boolean,
    confidence?: number,
  ) => void;
  onError: (error: string) => void;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export const NativeTranscriptionPanel: React.FC<
  NativeTranscriptionPanelProps
> = ({
  onTranscriptChange,
  onError,
  language = "en-US",
  continuous = true,
  interimResults = true,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [confidence, setConfidence] = useState<number | undefined>();

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      onError(
        "Your browser does not support speech recognition. Please use Chrome, Edge, or Safari, or switch to manual transcript input.",
      );
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("[NVT] Speech recognition started");
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let interimText = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        const conf = result[0].confidence;

        if (result.isFinal) {
          finalText += text + " ";
          setConfidence(conf);
        } else {
          interimText += text;
        }
      }

      if (finalText) {
        const newTranscript = transcript + finalText;
        setTranscript(newTranscript);
        onTranscriptChange(newTranscript, true, confidence);
      }

      if (interimText) {
        setInterimTranscript(interimText);
        onTranscriptChange(transcript + interimText, false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("[NVT] Speech recognition error:", event.error);

      let errorMessage = "Speech recognition error";
      switch (event.error) {
        case "no-speech":
          errorMessage = "No speech detected. Please try again.";
          break;
        case "audio-capture":
          errorMessage =
            "No microphone detected. Please check your audio settings.";
          break;
        case "not-allowed":
          errorMessage =
            "Microphone permission denied. Please allow microphone access.";
          break;
        case "network":
          errorMessage =
            "Network error. Speech recognition requires internet connection.";
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      onError(errorMessage);
      setIsRecording(false);
    };

    recognition.onend = () => {
      console.log("[NVT] Speech recognition ended");
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, continuous, interimResults]);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.start();
    } catch (error: any) {
      console.error("[NVT] Failed to start recording:", error);
      onError(`Failed to start recording: ${error.message}`);
    }
  }, [onError]);

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (error: any) {
      console.error("[NVT] Failed to stop recording:", error);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setConfidence(undefined);
    onTranscriptChange("", true);
  }, [onTranscriptChange]);

  if (!isSupported) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-yellow-600 mt-1">⚠️</div>
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">
              Browser Speech Recognition Not Supported
            </h3>
            <p className="text-sm text-yellow-800 mb-3">
              Your browser doesn't support native voice transcription. This
              feature works best in:
            </p>
            <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1 mb-3">
              <li>Google Chrome (recommended)</li>
              <li>Microsoft Edge</li>
              <li>Safari 14.1+</li>
            </ul>
            <p className="text-sm text-yellow-800">
              You can still use <strong>manual transcript input</strong> or
              switch to <strong>EVTS mode</strong> (offline transcription).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Native Voice Transcription</h3>
        <div className="flex items-center gap-2">
          {confidence !== undefined && (
            <span className="text-sm text-gray-600">
              Confidence: {(confidence * 100).toFixed(0)}%
            </span>
          )}
          {isRecording && (
            <span className="flex items-center gap-2 text-red-600 animate-pulse">
              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
              Recording
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isRecording
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Start Recording
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            !isRecording
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          Stop Recording
        </button>
        <button
          onClick={resetTranscript}
          className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-[200px]">
        <div className="text-sm text-gray-800">
          {transcript}
          {interimTranscript && (
            <span className="text-gray-400 italic">{interimTranscript}</span>
          )}
          {!transcript && !interimTranscript && (
            <span className="text-gray-400 italic">
              Click "Start Recording" and begin speaking...
            </span>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500">
        <p>
          💡 <strong>Tip:</strong> Speak clearly and pause between sentences for
          best results.
        </p>
        <p>
          🌐 <strong>Note:</strong> Native transcription requires internet
          connection in most browsers.
        </p>
      </div>
    </div>
  );
};

export default NativeTranscriptionPanel;
