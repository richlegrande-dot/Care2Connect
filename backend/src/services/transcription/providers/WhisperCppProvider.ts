/**
 * Whisper.cpp Provider (EVTS)
 * Offline speech-to-text using whisper.cpp
 * NO API KEYS REQUIRED - runs locally with downloaded models
 */

import {
  TranscriptionProvider,
  TranscriptionConfig,
  TranscriptionResult,
  TranscriptionCapabilities,
  TranscriptionError,
} from "../TranscriptionProvider";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execAsync = promisify(exec);

export class WhisperCppProvider implements TranscriptionProvider {
  private config?: TranscriptionConfig;
  private whisperExecutable?: string;
  private modelPath?: string;

  async initialize(config: TranscriptionConfig): Promise<void> {
    this.config = config;

    // Determine whisper executable location
    const platform = os.platform();
    const possiblePaths = [
      path.join(process.cwd(), "models", "whisper.cpp", "main"),
      path.join(process.cwd(), "models", "whisper.cpp", "main.exe"),
      "/usr/local/bin/whisper-cpp",
      "whisper-cpp", // Assume in PATH
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        this.whisperExecutable = p;
        break;
      }
    }

    if (!this.whisperExecutable) {
      throw new TranscriptionError(
        "Whisper.cpp executable not found. Run: npm run install:whisper-models",
        "WHISPER_CPP_NOT_INSTALLED",
        false,
      );
    }

    // Determine model path
    this.modelPath =
      config.evtsModelPath ||
      path.join(process.cwd(), "models", "whisper.cpp", "ggml-base.en.bin");

    if (!fs.existsSync(this.modelPath)) {
      throw new TranscriptionError(
        `Whisper model not found at ${this.modelPath}. Run: npm run install:whisper-models`,
        "WHISPER_MODEL_NOT_FOUND",
        false,
      );
    }
  }

  async transcribe(audioData: Buffer | Blob): Promise<TranscriptionResult> {
    if (!this.whisperExecutable || !this.modelPath) {
      throw new TranscriptionError(
        "WhisperCppProvider not initialized",
        "NOT_INITIALIZED",
        false,
      );
    }

    // Convert Blob to Buffer if needed
    let buffer: Buffer;
    if (audioData instanceof Blob) {
      const arrayBuffer = await audioData.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = audioData;
    }

    // Write audio to temporary file
    const tempDir = os.tmpdir();
    const tempWavPath = path.join(tempDir, `whisper-${Date.now()}.wav`);

    try {
      fs.writeFileSync(tempWavPath, buffer);

      // Run whisper.cpp
      const command = `"${this.whisperExecutable}" -m "${this.modelPath}" -f "${tempWavPath}" -t 4 -otxt`;

      const { stdout, stderr } = await execAsync(command, {
        timeout: 60000, // 60 second timeout
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });

      // Parse output
      const outputFile = tempWavPath.replace(".wav", ".txt");
      let transcriptText = "";

      if (fs.existsSync(outputFile)) {
        transcriptText = fs.readFileSync(outputFile, "utf-8").trim();
        fs.unlinkSync(outputFile); // Clean up output file
      } else {
        // Fall back to stdout parsing
        transcriptText = this.parseWhisperOutput(stdout);
      }

      return {
        text: transcriptText,
        confidence: 0.85, // Whisper.cpp doesn't provide confidence scores
        isFinal: true,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      if (error.killed) {
        throw new TranscriptionError(
          "Whisper.cpp transcription timeout",
          "TIMEOUT",
          true,
        );
      }
      throw new TranscriptionError(
        `Whisper.cpp transcription failed: ${error.message}`,
        "TRANSCRIPTION_FAILED",
        true,
      );
    } finally {
      // Clean up temporary file
      if (fs.existsSync(tempWavPath)) {
        fs.unlinkSync(tempWavPath);
      }
    }
  }

  private parseWhisperOutput(stdout: string): string {
    // Whisper.cpp outputs lines with timestamps
    // Example: [00:00:00.000 --> 00:00:05.000]  Hello, this is a test.
    const lines = stdout.split("\n");
    const textLines: string[] = [];

    for (const line of lines) {
      const match = line.match(
        /\[\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}\]\s+(.+)/,
      );
      if (match) {
        textLines.push(match[1].trim());
      }
    }

    return textLines.join(" ");
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.initialize(this.config || { mode: "evts" as any });
      return true;
    } catch {
      return false;
    }
  }

  getCapabilities(): TranscriptionCapabilities {
    return {
      supportsStreaming: false,
      supportsInterimResults: false,
      requiresNetwork: false,
      requiresAPIKey: false,
      supportedLanguages: ["en", "es", "fr", "de", "zh", "ja", "multi"],
    };
  }
}
