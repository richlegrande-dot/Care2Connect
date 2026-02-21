# Extraction Engine Capability Gaps

> **Engine Type:** Regex/heuristic pattern matching  
> **NLU Features:** Deferred — not on critical path for V2/Phase10 go-live  
> **Last Updated:** 2026-02-21

## Overview

The extraction engine (`backend/src/utils/extraction/`) uses regex patterns and keyword heuristics to parse transcript text. The Phase 5 and Phase 6 test suites include aspirational tests that require Natural Language Understanding (NLU) capabilities beyond the current engine's design.

These tests have been converted to `test.todo()` to preserve the specification intent while keeping CI green. They appear as a visible backlog in Jest output.

## Engine Components

| File                    | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| `rulesEngine.ts`        | Master orchestrator + name extraction        |
| `amountEngine.ts`       | Goal amount extraction (multi-pass pipeline) |
| `urgencyEngine.ts`      | Urgency classification (keyword scoring)     |
| `coordinationEngine.ts` | Cross-field coordination                     |
| `fragmentProcessor.ts`  | Transcript fragment handling                 |

## Todo Tests → Required Capability → Effort Band

### Phase 6: Comprehensive Production Suite

| Test # | Description                                                    | Required Capability              | Effort      |
| ------ | -------------------------------------------------------------- | -------------------------------- | ----------- |
| 5      | Names from alternative intro patterns ("I go by", "call me")   | Additional regex patterns OR NER | 2–4 hours   |
| 8      | Names in noisy transcript (filler words: "um", "uh", "like")   | Filler-word preprocessing        | 4–8 hours   |
| 14     | Bound amounts to reasonable ranges ($250K → ≤$100K)            | Amount capping logic             | 1–2 hours   |
| 16     | Amount extraction with broader context ("goal is to raise $X") | Additional keyword patterns      | 1–2 hours   |
| 29     | Multilingual name extraction ("Mi nombre es Maria")            | Cross-lingual patterns or NER    | 16–40 hours |
| 30     | Disfluency normalization ("My my name is is John")             | Text preprocessing               | 4–8 hours   |
| 31     | Punctuation-heavy transcripts ("My name is... Sarah???")       | Punctuation normalization        | 2–4 hours   |
| 32     | Complex spelled-out numbers ("two thousand five hundred")      | Word-to-number conversion        | 4–8 hours   |
| 34     | Context-keyword amount extraction ("pay $X in back rent")      | Additional keyword patterns      | 1–2 hours   |
| 39     | Context-keyword amount extraction ("costs $X")                 | Additional keyword patterns      | 1–2 hours   |

### Phase 5: Extreme Edge Cases

| Test                     | Description                                      | Required Capability                     | Effort     |
| ------------------------ | ------------------------------------------------ | --------------------------------------- | ---------- |
| Guilt-trip manipulation  | Amount from adversarial emotional text           | Robust dollar-sign extraction           | 2–4 hours  |
| Authority impersonation  | Name from "This is Officer X" pattern            | Additional name intro patterns          | 2–4 hours  |
| Sob story (fraud)        | Amount from very long emotional narrative        | Robust dollar-sign extraction           | 2–4 hours  |
| Sarcasm/implied meaning  | Sarcasm detection, confidence adjustment         | Sentiment analysis (NLP library)        | 40+ hours  |
| Passive voice            | "$4,000 would be appreciated"                    | Passive-voice amount patterns           | 4–8 hours  |
| Stream-of-consciousness  | Name/amount from rambling text                   | Noise-tolerant extraction               | 8–16 hours |
| Legal/formal language    | Amount priority (USD $7,500 vs "seven thousand") | Extraction priority rules               | 2–4 hours  |
| Scientific notation      | "5e3 dollars" → 5000                             | Scientific notation parser              | 2–4 hours  |
| Roman numerals           | "V thousand dollars" → 5000                      | Roman numeral parser                    | 2–4 hours  |
| Complex spelled numbers  | "two thousand three hundred forty-seven" → 2347  | Full word-number parser                 | 4–8 hours  |
| Ambiguous pronouns       | "she needs $2,000" → which name?                 | Coreference resolution (NLP)            | 40+ hours  |
| Drunk/intoxicated speech | Garbled text with typos → name extraction        | Fuzzy string matching                   | 8–16 hours |
| Emotional distress       | ALL-CAPS names, spelled-out numbers              | Case-insensitive regex + number parsing | 4–8 hours  |
| Medical emergency        | Confused/fragmented speech → extraction          | Noise-tolerant extraction               | 8–16 hours |
| Multiple speakers        | Speaker diarization → correct name               | Speaker diarization (NLP)               | 40+ hours  |
| Regex special chars      | Brackets/parens in name context                  | Regex-safe input preprocessing          | 1–2 hours  |
| Long repeated patterns   | Name after 100x repeated noise                   | Noise-tolerant extraction               | 4–8 hours  |
| Total chaos              | Multi-adversarial extraction                     | All of the above combined               | N/A        |

## Effort Summary

| Category                                           | Tests  | Estimated Effort   |
| -------------------------------------------------- | ------ | ------------------ |
| Quick wins (additional patterns)                   | ~8     | 10–20 hours        |
| Preprocessing (noise, punctuation, disfluency)     | ~5     | 20–40 hours        |
| Word-to-number conversion                          | ~3     | 8–16 hours         |
| NLP-required (sentiment, coreference, diarization) | ~4     | 120+ hours         |
| **Total**                                          | **28** | **160–200+ hours** |

## Decision Log

- **2026-02-21:** Navigator approved Hybrid Option D. Easy-win boundary/policy assertions fixed (11 tests). NLU-dependent tests converted to `test.todo()` (28 tests). Engine behavior unchanged.
