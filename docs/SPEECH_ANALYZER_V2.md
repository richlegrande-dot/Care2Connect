# Speech Analyzer v2 - Architecture & Implementation

**Purpose**: Document the upgraded speech analyzer with no-API-keys transcription  
**Version**: 2.0  
**Date**: December 13, 2025

---

## Overview

Speech Analyzer v2 provides **three transcription modes** for CareConnect, eliminating the requirement for OpenAI API keys:

1. **NVT (Native Voice Transcription)** - Browser-based Web Speech API
2. **EVTS (Extended Voice Transcription Service)** - Offline server-side (whisper.cpp or Vosk)
3. **Legacy** - OpenAI Whisper API (requires key, still supported)

Additionally, v2 includes:
- **Topic Spotting** - Deterministic field extraction (no AI API needed)
- **Sentiment Analysis** - Offline empathy/urgency scoring (VADER)
- **Learning Feedback Loop** - User corrections improve extraction accuracy

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌───────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │ NVT Panel         │  │ Transcript     │  │ Support        │ │
│  │ (Web Speech API)  │  │ Editor         │  │ Ticket Form    │ │
│  │ Real-time stream  │  │ Manual input   │  │                │ │
│  └───────────────────┘  └────────────────┘  └────────────────┘ │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          BACKEND                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Transcription Service (Factory)                  │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │ WebSpeech  │  │ WhisperCpp │  │ Vosk       │        │   │
│  │  │ Adapter    │  │ Provider   │  │ Provider   │        │   │
│  │  │ (client)   │  │ (offline)  │  │ (offline)  │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Topic Spotter (Deterministic)                    │   │
│  │  • Rule-based keyword matching                           │   │
│  │  • Pattern extraction (regex)                            │   │
│  │  • Confidence scoring                                    │   │
│  │  • Follow-up question generation                         │   │
│  │  • Phrase hints learning dictionary                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Sentiment Service (Offline)                      │   │
│  │  • VADER sentiment analysis                              │   │
│  │  • Empathy proxy scoring (gratitude, distress, etc.)     │   │
│  │  • Needs urgency calculation                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Support Ticket System                            │   │
│  │  • Email routing (workflown8n@gmail.com)                 │   │
│  │  • Local storage fallback                                │   │
│  │  • mailto: link generation                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Feature Flags

Control transcription mode via environment variables:

```bash
# .env
TRANSCRIPTION_MODE=nvt|evts|legacy
# Default: legacy (OpenAI Whisper API)

# EVTS Configuration
EVTS_ENGINE=whispercpp|vosk
# Default: whispercpp

EVTS_MODEL_PATH=./models/whisper.cpp/ggml-base.en.bin
# Path to offline model file

TRANSCRIPTION_LANGUAGE=en-US
# Default: en-US
```

### Mode Comparison

| Feature | NVT | EVTS | Legacy |
|---------|-----|------|--------|
| **Requires API key** | No | No | Yes |
| **Requires internet** | Yes* | No | Yes |
| **Real-time streaming** | Yes | No† | No |
| **Browser compatibility** | Chrome, Edge, Safari 14.1+ | All | All |
| **Accuracy** | Medium | High | Highest |
| **Cost** | Free | Free | ~$0.006/min |
| **Setup complexity** | None | Model download | API key |

*Some browsers require internet for Web Speech API  
†Vosk supports streaming; whisper.cpp does not

---

## 1. Native Voice Transcription (NVT)

### Technology
- **Web Speech API** (`SpeechRecognition`)
- Client-side only
- Browser-dependent

### Browser Support
| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended |
| Edge | ✅ Full | Chromium-based |
| Safari | ✅ 14.1+ | iOS/macOS only |
| Firefox | ❌ None | Does not support Web Speech API |
| Opera | ✅ Full | Chromium-based |

### Implementation

**Frontend: `components/NativeTranscriptionPanel.tsx`**
```typescript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  // Fall back to manual transcript
}

const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

recognition.onresult = (event) => {
  const result = event.results[event.results.length - 1];
  const transcript = result[0].transcript;
  const confidence = result[0].confidence;
  const isFinal = result.isFinal;
  
  onTranscriptChange(transcript, isFinal, confidence);
};

recognition.start();
```

### Advantages
- Zero setup required
- Real-time streaming
- No cost
- No server processing

### Limitations
- Browser-dependent (no Firefox support)
- Requires internet (in most browsers)
- Lower accuracy than EVTS/Legacy
- Privacy: audio may be sent to Google/Apple servers

### Fallback Strategy
If Web Speech API not available:
1. Display user-friendly message explaining browser compatibility
2. Automatically switch to **Manual Transcript** mode
3. Suggest Chrome/Edge/Safari or EVTS mode

---

## 2. Extended Voice Transcription Service (EVTS)

### Technology Options

#### Option A: whisper.cpp (Recommended)
- **Source**: [github.com/ggml-org/whisper.cpp](https://github.com/ggml-org/whisper.cpp)
- **Type**: C++ implementation of OpenAI's Whisper model
- **Accuracy**: High (same model as OpenAI API)
- **Speed**: Fast on modern CPUs
- **Models**: Download from Hugging Face or whisper.cpp releases

#### Option B: Vosk
- **Source**: [alphacephei.com/vosk](https://alphacephei.com/vosk/)
- **Type**: Lightweight offline speech recognition
- **Accuracy**: Medium-high
- **Speed**: Very fast
- **Models**: 50MB - 1.8GB depending on language

### Installation

**Step 1: Install whisper.cpp**
```bash
# Clone repository
git clone https://github.com/ggml-org/whisper.cpp.git models/whisper.cpp
cd models/whisper.cpp

# Build
make

# Download model (base.en = 150MB, good balance of speed/accuracy)
bash ./models/download-ggml-model.sh base.en
```

**Step 2: Install Vosk (alternative)**
```bash
npm install vosk

# Download model
mkdir -p models/vosk
cd models/vosk
wget https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
unzip vosk-model-small-en-us-0.15.zip
```

**Step 3: Configure environment**
```bash
TRANSCRIPTION_MODE=evts
EVTS_ENGINE=whispercpp
EVTS_MODEL_PATH=./models/whisper.cpp/ggml-base.en.bin
```

### Implementation

**Backend: `services/transcription/providers/WhisperCppProvider.ts`**
```typescript
async transcribe(audioData: Buffer): Promise<TranscriptionResult> {
  // Write audio to temp file
  const tempWavPath = path.join(os.tmpdir(), `whisper-${Date.now()}.wav`);
  fs.writeFileSync(tempWavPath, audioData);

  // Run whisper.cpp executable
  const command = `"${this.whisperExecutable}" -m "${this.modelPath}" -f "${tempWavPath}" -otxt`;
  const { stdout } = await execAsync(command, { timeout: 60000 });

  // Parse output
  const transcript = this.parseWhisperOutput(stdout);

  return {
    text: transcript,
    confidence: 0.85,
    isFinal: true,
    timestamp: Date.now()
  };
}
```

### Model Options

| Model | Size | Speed | Accuracy | Use Case |
|-------|------|-------|----------|----------|
| tiny.en | 75MB | Fastest | Low | Testing only |
| base.en | 150MB | Fast | Good | **Recommended for most** |
| small.en | 500MB | Medium | Better | High accuracy needs |
| medium.en | 1.5GB | Slow | Best | Maximum accuracy |
| large | 3GB | Very slow | Highest | Research/enterprise |

**Recommendation**: Start with `base.en` - best balance of speed and accuracy.

### Advantages
- No API keys or internet required
- High accuracy (same as OpenAI API)
- Full privacy - audio never leaves server
- One-time model download

### Limitations
- Requires server-side processing (CPU/memory)
- Model files are large (150MB - 3GB)
- No real-time streaming (whisper.cpp)
- Initial setup required

---

## 3. Topic Spotting (Deterministic)

### Purpose
Extract structured GoFundMe fields from transcript **without AI API calls**.

### Architecture

**Input**: Raw transcript text  
**Output**: Structured fields with confidence scores

```typescript
interface ExtractionResult {
  fields: {
    name?: ExtractedField;
    age?: ExtractedField;
    location?: ExtractedField;
    category?: ExtractedField;
    goalAmount?: ExtractedField;
    beneficiary?: ExtractedField;
    title?: ExtractedField;
    story?: ExtractedField;
  };
  missingFields: string[];
  followUpQuestions: string[];
}

interface ExtractedField {
  value: string;
  confidence: number; // 0-1
  source: 'extracted' | 'inferred' | 'manual';
  snippet?: string; // Original text
}
```

### Extraction Techniques

#### 1. Pattern Matching (Regex)
```typescript
// Name extraction
const namePatterns = [
  /my name is ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/,
  /i'm ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/,
  /i am ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/
];

// Goal amount extraction
const goalPatterns = [
  /\$([0-9,]+)/,
  /([0-9,]+) dollars?/i,
  /(?:raise|need|goal of) \$?([0-9,]+)/i
];
```

#### 2. Keyword Spotting
```typescript
// Category detection
const categoryKeywords = {
  medical: ['medical', 'hospital', 'surgery', 'cancer', 'treatment'],
  housing: ['housing', 'rent', 'homeless', 'eviction', 'apartment'],
  emergency: ['emergency', 'urgent', 'crisis', 'disaster']
};

// Count keyword matches, select category with most hits
```

#### 3. Learning Dictionary
```json
// config/phraseHints.json
{
  "name": ["my name is", "I'm", "this is"],
  "location": ["in", "from", "living in", "located in"],
  "goalAmount": ["raise", "need", "goal of", "$"]
}
```

When user corrects an extraction:
1. Store: `originalValue`, `correctedValue`, `snippet`
2. Add `snippet` to phrase hints for that field
3. Increase confidence next time that pattern appears

### Confidence Scoring

```typescript
const confidence = {
  high: 0.85,    // Explicit pattern match
  medium: 0.6,   // Keyword match or phrase hint
  low: 0.4       // Inferred from context
};
```

### Follow-Up Questions

If fields missing or low confidence:
```typescript
const followUpQuestions = {
  missingName: "What is your full name?",
  missingGoal: "How much money are you trying to raise?",
  missingLocation: "What city and state are you in?",
  shortStory: "Can you tell us more about your situation?"
};
```

Generate **1-3 questions** max, prioritized by importance.

---

## 4. Sentiment & Empathy Scoring

### Purpose
Analyze transcript for emotional tone and urgency **without AI API calls**.

### Technology
- **VADER** (Valence Aware Dictionary and sEntiment Reasoner)
- Rule-based sentiment analysis
- Designed for social media text
- Install: `npm install vader-sentiment`

### Implementation

```typescript
import * as vader from 'vader-sentiment';

const result = vader.SentimentIntensityAnalyzer.polarity_scores(transcript);

// Result:
{
  pos: 0.3,      // Positive score
  neg: 0.1,      // Negative score
  neu: 0.6,      // Neutral score
  compound: 0.5  // Overall: -1 (negative) to +1 (positive)
}
```

### Empathy Proxy Scoring

**Heuristic-based** scoring for:

1. **Gratitude**: "thank you", "grateful", "appreciate"
2. **Distress**: "desperate", "urgent", "crisis", "struggling"
3. **Self-Advocacy**: "I can", "I will", "I am working"
4. **Support Request**: "need help", "please help", "asking for"

Each category scored 0-1 based on phrase presence.

**Overall Empathy Score**:
```
empathyScore = (supportRequest × 0.4) + 
               (distress × 0.3) + 
               (selfAdvocacy × 0.2) + 
               (gratitude × 0.1)
```

### Needs Urgency Classification

```typescript
const urgencyScore = (distress × 0.4) + 
                    (supportRequest × 0.3) + 
                    (abs(min(0, sentimentCompound)) × 0.3);

if (urgencyScore > 0.7) return 'high';
if (urgencyScore > 0.4) return 'medium';
return 'low';
```

### Use Cases
- Admin dashboard: Show case workers which intakes need priority
- Quality assurance: Flag stories that may need human review
- Research: Understand patterns in successful campaigns

**Not used for**: Filtering, rejecting, or automatically prioritizing campaigns (maintains human oversight)

---

## 5. Support Ticket System

### Purpose
Route user issues to **workflown8n@gmail.com** with graceful email fallback.

### Ticket Types
- `gofundme_blocked` - Can't complete GoFundMe creation
- `qr_problem` - QR code won't generate or scan
- `transcription_problem` - Speech recognition errors
- `other` - General issues

### Email Behavior

**If SMTP configured**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=true
```
→ Email sent via Nodemailer to `workflown8n@gmail.com`

**If SMTP NOT configured**:
1. Save ticket to `data/support-tickets/{TICKET-ID}.json`
2. Return response with `mailto:` link:
```
mailto:workflown8n@gmail.com?subject=Support Ticket TICKET-123&body=...
```
3. User clicks link → opens default email client with pre-filled ticket

### API Endpoints

**POST /api/support/tickets**
```json
{
  "issueType": "gofundme_blocked",
  "description": "I can't figure out how to add photos to my campaign",
  "screenshot": "data:image/png;base64,...",
  "contactEmail": "user@example.com",
  "contactPhone": "+1-555-1234"
}
```

**Response (SMTP configured)**:
```json
{
  "success": true,
  "message": "Support ticket submitted and sent via email.",
  "ticket": { "id": "TICKET-123", "timestamp": "2025-12-13T..." }
}
```

**Response (SMTP not configured)**:
```json
{
  "success": true,
  "message": "Support ticket saved locally. Email delivery is not configured.",
  "ticket": { "id": "TICKET-123", "timestamp": "2025-12-13T..." },
  "fallback": {
    "mailto": "mailto:workflown8n@gmail.com?subject=...",
    "instructions": "Click the link to send via your default email client."
  }
}
```

---

## Installation & Setup

### Quick Start

**1. Install dependencies**
```bash
cd backend
npm install vader-sentiment nodemailer
```

**2. Configure transcription mode**
```bash
# Option A: NVT (no setup needed)
TRANSCRIPTION_MODE=nvt

# Option B: EVTS (requires model download)
TRANSCRIPTION_MODE=evts
EVTS_ENGINE=whispercpp
```

**3. Install EVTS models (if using EVTS)**
```bash
npm run install:whisper-models
# Or manually:
# git clone https://github.com/ggml-org/whisper.cpp.git models/whisper.cpp
# cd models/whisper.cpp && make && bash ./models/download-ggml-model.sh base.en
```

**4. Configure support email (optional)**
```bash
SUPPORT_EMAIL_TO=workflown8n@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=true
```

**5. Start servers**
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

---

## Testing

### NVT Testing
1. Open browser console
2. Navigate to recording page
3. Click "Start Recording"
4. Check for `SpeechRecognition` errors
5. Verify transcript appears in real-time

**Fallback test**: Use Firefox (no Web Speech API support) → Should show "unsupported browser" message and manual transcript option

### EVTS Testing
1. Prepare test audio: `test-assets/sample.wav` (5-10 second phrase)
2. POST to `/api/transcription/evts` with audio file
3. Verify response contains transcript
4. Check no OpenAI API calls made

**Error test**: Remove model file → Should return "model not found" error with actionable instructions

### Topic Spotting Testing
1. Submit test transcript:
```
My name is John Smith. I'm 35 years old and currently experiencing homelessness in Los Angeles, California. My goal is to raise $5,000 for first month's rent and deposit.
```
2. Verify extracted fields:
   - name: "John Smith" (high confidence)
   - age: "35" (high confidence)
   - location: "Los Angeles, California" (high confidence)
   - goalAmount: "5000" (high confidence)
   - category: "housing" (medium confidence)
3. Check missing fields generates follow-up questions

**Learning test**: Submit transcript, manually correct extraction, verify `phraseHints.json` updated

### Sentiment Testing
1. Test positive transcript: "I'm so grateful for any help. I'm determined to get back on my feet."
   - Expected: positive sentiment, high self-advocacy, medium needs urgency
2. Test negative transcript: "I'm desperate. I've lost everything and don't know what to do."
   - Expected: negative sentiment, high distress, high needs urgency

### Support Ticket Testing
**With SMTP**:
1. Configure SMTP env vars
2. Submit ticket via API
3. Check email arrives at `workflown8n@gmail.com`

**Without SMTP**:
1. Remove SMTP env vars
2. Submit ticket
3. Verify response includes `mailto:` link
4. Check ticket saved to `data/support-tickets/`

---

## Troubleshooting

### NVT: "Browser not supported"
**Cause**: Using Firefox or outdated browser  
**Solution**: Switch to Chrome, Edge, or Safari 14.1+, or use EVTS mode

### NVT: "Microphone permission denied"
**Cause**: User blocked microphone access  
**Solution**: Guide user to browser settings to allow microphone

### EVTS: "Whisper model not found"
**Cause**: Model not downloaded  
**Solution**: Run `npm run install:whisper-models` or download manually

### EVTS: "Transcription timeout"
**Cause**: Audio file too long or CPU overloaded  
**Solution**: Use smaller model (tiny.en/base.en) or increase timeout in `WhisperCppProvider.ts`

### Topic Spotting: Low confidence scores
**Cause**: Transcript doesn't match expected patterns  
**Solution**: 
1. Check `topicTaxonomy.json` - add more keywords
2. Use learning feedback loop - manually correct extractions
3. Improve transcript quality (better audio, clearer speech)

### Sentiment: VADER library not found
**Cause**: `vader-sentiment` not installed  
**Solution**: `npm install vader-sentiment`

### Support: Emails not sending
**Cause**: SMTP misconfigured or blocked  
**Solution**:
1. Verify SMTP credentials
2. For Gmail: Use "App Password" not regular password
3. Check firewall/network allows SMTP port
4. If can't fix, system falls back to `mailto:` links

---

## Performance Considerations

### NVT
- **CPU**: Minimal (browser-side)
- **Memory**: Minimal
- **Network**: Moderate (audio sent to Google/Apple)
- **Latency**: Real-time

### EVTS (whisper.cpp)
- **CPU**: Moderate-high (depends on model)
  - tiny.en: 1-2 seconds per minute of audio (4 cores)
  - base.en: 3-5 seconds per minute of audio (4 cores)
  - small.en: 10-15 seconds per minute of audio (4 cores)
- **Memory**: 200MB - 2GB (depends on model)
- **Network**: None
- **Latency**: 3-15 seconds (depends on audio length and model)

### EVTS (Vosk)
- **CPU**: Low-moderate
- **Memory**: 50MB - 1GB (depends on model)
- **Network**: None
- **Latency**: 1-3 seconds (faster than whisper.cpp, lower accuracy)

### Topic Spotting
- **CPU**: Minimal (regex + keyword matching)
- **Memory**: Minimal
- **Network**: None
- **Latency**: <100ms

### Sentiment
- **CPU**: Low (VADER is rule-based, not ML)
- **Memory**: Minimal
- **Network**: None
- **Latency**: <100ms

---

## Security & Privacy

### NVT (Web Speech API)
- ⚠️ Audio sent to browser's speech service (Google/Apple)
- No control over data handling
- Recommend informing users: "Your voice may be processed by Google for transcription"

### EVTS
- ✅ Audio never leaves server
- ✅ No third-party API calls
- ✅ Full privacy control
- Recommended for sensitive/medical use cases

### Topic Spotting
- ✅ Deterministic, no AI API
- ✅ Learning dictionary stored locally
- No privacy concerns

### Sentiment
- ✅ Offline library
- ✅ No data sent externally
- No privacy concerns

### Support Tickets
- ⚠️ If SMTP used, email content sent through mail server
- Screenshot attachments included (may contain sensitive info)
- Recommend: Use encrypted SMTP (TLS/SSL)

---

## Future Enhancements (Not Implemented)

### Potential v3 Features:
1. **Transformer.js** - Run small ML models in browser (no server needed)
2. **Multi-language** - Spanish, Mandarin, etc. for EVTS/NVT
3. **Speaker diarization** - Identify multiple speakers in audio
4. **Real-time EVTS streaming** - Vosk streaming integration
5. **Advanced topic modeling** - LDA for keyword extraction
6. **Custom model fine-tuning** - Train on historical CareConnect campaigns

---

**Document Status**: ✅ Complete  
**Last Updated**: December 13, 2025  
**Version**: 2.0 - No-Keys Speech Analyzer
