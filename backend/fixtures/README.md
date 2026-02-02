# Speech Intelligence Test Fixtures

This directory contains audio fixtures for smoke testing the transcription system.

## Required Audio Files

### English Fixture
**File:** `smoke_en_hello_world.wav`
**Content:** 1-2 second recording saying "hello world"
**Format:** WAV, 16kHz, mono
**Size:** ~50-100KB
**License:** Public domain or self-recorded

### Spanish Fixture
**File:** `smoke_es_hola_mundo.wav`
**Content:** 1-2 second recording saying "hola mundo"
**Format:** WAV, 16kHz, mono
**Size:** ~50-100KB
**License:** Public domain or self-recorded

## Creating Test Audio

### Option 1: Record Your Own
```bash
# On Windows with PowerShell (requires ffmpeg)
# 1. Record with Windows Voice Recorder (save as .m4a)
# 2. Convert to WAV:
ffmpeg -i recording.m4a -ar 16000 -ac 1 smoke_en_hello_world.wav
```

### Option 2: Use Text-to-Speech
```python
# Using Python's pyttsx3 (no API key needed)
import pyttsx3
import wave
import struct

engine = pyttsx3.init()
engine.setProperty('rate', 150)
engine.save_to_file('hello world', 'temp.wav')
engine.runAndWait()

# Convert to 16kHz mono with ffmpeg
# ffmpeg -i temp.wav -ar 16000 -ac 1 smoke_en_hello_world.wav
```

### Option 3: Download Free Audio
Public domain sources:
- https://freesound.org/ (CC0 licensed)
- https://www.zapsplat.com/ (Free with attribution)

## Placeholder Files

**IMPORTANT:** The current .wav files in this directory are PLACEHOLDERS.
They contain minimal audio data and will likely fail transcription tests.

Replace them with actual audio recordings before running real transcription smoke tests.

## Testing Without Audio

If no audio fixtures are available, the smoke test will:
1. Skip real transcription tests with status="skipped"
2. Log reason: "No audio fixtures available"
3. Continue with DB-only smoke tests (session creation, metrics storage, etc.)

This is by design - the system fails "soft" when dependencies are missing.
