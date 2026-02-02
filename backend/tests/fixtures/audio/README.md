# Test Audio Fixtures

This directory contains small test audio files for verifying speech transcription functionality.

## Files

- `en_short.wav` - Short English audio saying "hello world test"
- `es_short.wav` - Short Spanish audio saying "hola mundo prueba"

## Usage

These files are used by the health check system to verify that:

1. Speech transcription models are properly installed
2. Audio processing pipeline works end-to-end  
3. Multi-language support functions correctly

The health check expects transcription output to contain expected keywords:
- English: "hello", "world", "test"
- Spanish: "hola", "mundo", "prueba"

## Security Note

These are minimal test files with no sensitive content, used only for functional verification.