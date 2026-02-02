/**
 * Creates a minimal WAV audio file for smoke testing
 * This is a 2-second silent audio file that meets the >1KB requirement
 * In production, replace with actual "hello world" recording
 */

const fs = require('fs');
const path = require('path');

// WAV file format constants
const sampleRate = 16000; // 16kHz
const numChannels = 1; // Mono
const bitsPerSample = 16;
const duration = 2; // 2 seconds

const numSamples = sampleRate * duration;
const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
const blockAlign = (numChannels * bitsPerSample) / 8;
const dataSize = numSamples * blockAlign;
const fileSize = 44 + dataSize; // 44-byte header + data

// Create WAV header (44 bytes)
const header = Buffer.alloc(44);

// RIFF chunk descriptor
header.write('RIFF', 0);
header.writeUInt32LE(fileSize - 8, 4);
header.write('WAVE', 8);

// fmt sub-chunk
header.write('fmt ', 12);
header.writeUInt32LE(16, 16); // Sub-chunk size
header.writeUInt16LE(1, 20); // Audio format (1 = PCM)
header.writeUInt16LE(numChannels, 22);
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(byteRate, 28);
header.writeUInt16LE(blockAlign, 32);
header.writeUInt16LE(bitsPerSample, 34);

// data sub-chunk
header.write('data', 36);
header.writeUInt32LE(dataSize, 40);

// Create audio data (silent audio - all zeros)
// In production, this should be replaced with actual "hello world" recording
const audioData = Buffer.alloc(dataSize, 0);

// Optional: Add very slight noise to simulate real audio
// This prevents some audio processors from treating it as pure silence
for (let i = 0; i < numSamples; i++) {
  const sample = Math.floor(Math.random() * 20 - 10); // Random noise between -10 and +10
  audioData.writeInt16LE(sample, i * 2);
}

// Combine header and data
const wavFile = Buffer.concat([header, audioData]);

// Write to file
const outputPath = path.join(__dirname, 'smoke-test-audio.wav');
fs.writeFileSync(outputPath, wavFile);

console.log(`✓ Created smoke test audio file: ${outputPath}`);
console.log(`  File size: ${(wavFile.length / 1024).toFixed(2)} KB`);
console.log(`  Duration: ${duration} seconds`);
console.log(`  Sample rate: ${sampleRate} Hz`);
console.log(`  Channels: ${numChannels} (mono)`);
console.log('');
console.log('NOTE: This is a minimal WAV file with silence/noise.');
console.log('For production, replace with actual "hello world" recording.');
