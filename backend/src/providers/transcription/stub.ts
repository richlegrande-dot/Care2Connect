/**
 * Stub Transcription Provider
 *
 * Returns deterministic transcripts for stress testing
 * NO external API calls
 */

import {
  TranscriptionProvider,
  TranscriptionResult,
  TranscriptionOptions,
} from "./types";
import fs from "fs";
import path from "path";

/**
 * Default transcript fixtures for stress testing
 * Enhanced with varied scenarios: short/medium/long transcripts, different languages, edge cases
 */
const DEFAULT_FIXTURES = [
  // Scenario 1: Standard housing request (medium)
  "My name is John Smith. I'm 42 years old and I've been experiencing housing insecurity for the past six months. I have over 15 years of experience in carpentry and construction. I'm a hard worker and I'm looking for stable housing and employment opportunities. I'm staying at a local shelter right now, but I need to find something more permanent. I'm good with my hands and I can do electrical work, plumbing, and general repairs. My goal is to get back on my feet, find steady work, and eventually save up for my own place. I just need a little help to get started.",

  // Scenario 2: Bilingual customer service (medium)
  "Hi, my name is Maria Garcia. I'm seeking support with food and healthcare access. I have a background in retail and customer service, with about 8 years of experience. I'm currently living with a friend, but the situation is temporary. I'm looking for work and also need help with medical expenses. I have some health issues that require ongoing treatment and medication. I'm a hard worker and I'm determined to get back to financial stability. I love helping people and I'm good at customer service. I'm also bilingual in English and Spanish.",

  // Scenario 3: Recovery and employment (medium)
  "This is James Washington. I'm 35 years old and I'm working toward getting my life back together. I've struggled with some personal challenges, but I'm committed to moving forward. I have experience in food service and I'm a certified forklift operator. I'm looking for employment and stable housing. I'm currently in a transitional housing program, but I need to find permanent housing soon. I'm also working on getting my driver's license reinstated. I'm a reliable person and I show up when I say I will. I just need someone to give me a chance.",

  // Scenario 4: Family with children (long)
  "My name is Sarah Chen. I'm 28 years old and I recently experienced domestic violence and had to leave my home with my two children, ages 5 and 7. We're currently staying at a women's shelter, but we need long-term stable housing. I have a college degree in business administration and worked in office management for over 5 years before this crisis. I'm proficient with Microsoft Office, QuickBooks, and customer relationship management software. My children are in school and doing well despite the circumstances. I need to find employment that allows me flexibility for school pickup and emergencies. I'm a hard worker, detail-oriented, and I'm good with people. My immediate needs are safe housing for my family, reliable childcare, and steady employment. My long-term goals include saving for our own home and ensuring my children have stability and educational opportunities.",

  // Scenario 5: Veteran with PTSD (long)
  "Hi, I'm David Martinez. I'm 50 years old and I'm a veteran who served in the Army for 12 years including two deployments overseas. I've been dealing with PTSD and some physical health issues related to my service, but I'm actively receiving treatment through the VA. I'm looking for employment and stable housing. During my military service, I gained extensive experience in logistics, supply chain management, inventory control, and team leadership. I managed teams of up to 20 soldiers and was responsible for millions of dollars worth of equipment. Since leaving the service, I've been working on getting additional certifications in IT support and network administration. I'm studying for my CompTIA A+ certification. I'm a disciplined person who works well under pressure and follows through on commitments. I have strong problem-solving skills and attention to detail. I just need an employer who understands military experience and is willing to give me a chance.",

  // Scenario 6: Healthcare worker (medium)
  "My name is Lisa Thompson. I'm 31 years old and I'm seeking support to overcome food insecurity and find stable employment in healthcare. I'm a certified nursing assistant with 3 years of experience working in nursing homes and assisted living facilities. I have excellent bedside manner and I'm very compassionate with elderly patients. I'm currently staying with family, but it's overcrowded and I need to find my own place. I'm also working on getting additional certifications including CPR, First Aid, and medication administration. I love taking care of people and making a difference in their lives. I'm a positive person who doesn't give up easily, even when things get tough.",

  // Scenario 7: Short/minimal info (needs more info scenario)
  "Hi, I'm Alex. I need help with housing and work. I'm good at fixing things.",

  // Scenario 8: Very detailed technical background (long)
  "My name is Robert Williams and I'm 45 years old. I'm a software engineer with over 20 years of experience in full-stack web development, database administration, and system architecture. I have expertise in JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, MongoDB, and cloud platforms including AWS and Azure. I hold certifications in AWS Solutions Architecture and Microsoft Azure fundamentals. Unfortunately, I lost my job during recent tech layoffs and exhausted my savings during a prolonged job search. The tech job market has been extremely competitive, and I've been unemployed for 8 months. I'm currently staying in my car and using public WiFi to continue my job search and maintain my technical skills. I'm working on several open-source projects and keeping up with the latest frameworks and tools. I'm willing to take contract work, freelance projects, or even entry-level positions to get back on my feet. I have a strong work ethic, excellent problem-solving skills, and I work well both independently and as part of a team. I just need stable housing so I can focus on rebuilding my career in tech.",

  // Scenario 9: Young adult aging out of foster care (medium)
  "Hi, my name is Taylor Johnson. I'm 19 years old and I just aged out of the foster care system. I don't have family support and I'm trying to figure out how to live on my own. I graduated high school and I'm interested in going to community college, but I need to work to support myself. I have some experience in retail from part-time jobs during high school. I'm a fast learner and I'm willing to work hard. I'm currently staying at a youth transitional housing program, but that's only temporary. I need help finding permanent housing that I can afford on entry-level wages. I'm also interested in learning job skills and maybe getting some vocational training. I'm responsible and mature for my age.",

  // Scenario 10: Senior citizen with limited income (medium)
  "My name is Dorothy Washington. I'm 67 years old and I'm living on a fixed income from Social Security. My rent has gone up and I'm struggling to pay for housing, medications, and food. I worked as a school secretary for 30 years before I retired. I have good organizational skills and I'm comfortable with basic computer tasks. I'm looking for part-time work that would supplement my Social Security income. I'm also seeking assistance with housing costs and healthcare expenses. I'm a reliable person who has always paid my bills on time when I could afford to. I volunteer at my church and I help other seniors with paperwork and appointments. I just need some extra support to make ends meet.",

  // Scenario 11: Edge case - Multiple languages/names
  "Hola, my name is José Miguel Santos-Rodriguez, but people call me Mike. Yo hablo español y inglés. I'm looking for trabajo, work in construction or landscaping. I have experience building houses, installing roofing, concrete work. I need housing también, housing for my family - my wife and three children.",

  // Scenario 12: Edge case - Very quiet/mumbly (stress test transcription quality)
  "Um, hi... my name is... I think it's... Jamie. I'm... I need help with... um... housing I guess? And maybe... work? I don't know... it's hard to explain...",
];

/**
 * Stub transcription modes for different test scenarios
 */
export enum StubMode {
  FAST = "fast", // Instant response (0ms delay)
  NORMAL = "normal", // Normal response time (1-3s)
  SLOW = "slow", // Slow response time (5-10s)
  TIMEOUT = "timeout", // Always times out (for timeout testing)
  ERROR = "error", // Always fails (for error handling testing)
  RANDOM = "random", // Random success/failure for chaos testing
  NEEDS_INFO = "needs_info", // Returns incomplete transcripts to trigger NEEDS_INFO
}

export class StubTranscriptionProvider implements TranscriptionProvider {
  readonly name = "Stub Provider (Stress Test Mode)";
  readonly type = "stub" as const;

  private fixtures: Array<
    | string
    | { transcript: string; wordCount?: number; detectedLanguage?: string }
  > = [];

  constructor() {
    this.loadFixtures();
  }

  /**
   * Reload fixtures from environment variable (useful for tests)
   */
  public reloadFixtures(): void {
    this.loadFixtures();
  }

  private loadFixtures(): void {
    const fixturePathOrJson = process.env.STRESS_TEST_TRANSCRIPT_FIXTURE;

    if (fixturePathOrJson) {
      try {
        // First, try to parse as JSON directly (for tests that pass JSON string)
        try {
          const parsed = JSON.parse(fixturePathOrJson);

          if (parsed.transcript) {
            // Single fixture object with transcript property - keep the whole object
            this.fixtures = [parsed];
            console.log(
              `[StubProvider] Loaded single fixture from JSON string`,
            );
            return;
          } else if (Array.isArray(parsed)) {
            this.fixtures = parsed;
            console.log(
              `[StubProvider] Loaded ${this.fixtures.length} fixture(s) from JSON array`,
            );
            return;
          } else if (typeof parsed === "object" && parsed.transcripts) {
            this.fixtures = parsed.transcripts;
            console.log(
              `[StubProvider] Loaded ${this.fixtures.length} fixture(s) from JSON object`,
            );
            return;
          }
        } catch (jsonError) {
          // Not valid JSON, might be a file path
        }

        // If not JSON, treat as file path
        if (fs.existsSync(fixturePathOrJson)) {
          console.log(
            `[StubProvider] Loading fixtures from file: ${fixturePathOrJson}`,
          );
          const content = fs.readFileSync(fixturePathOrJson, "utf-8");

          // Try to parse file content as JSON
          try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
              this.fixtures = parsed;
            } else if (typeof parsed === "object" && parsed.transcripts) {
              this.fixtures = parsed.transcripts;
            } else {
              this.fixtures = [content]; // Use raw content as single fixture
            }
          } catch {
            // Not JSON, treat as plain text
            this.fixtures = [content];
          }

          console.log(
            `[StubProvider] Loaded ${this.fixtures.length} fixture(s) from file`,
          );
          return;
        }
      } catch (error) {
        console.warn(
          "[StubProvider] Error loading fixtures, using defaults:",
          error,
        );
      }
    }

    // Fallback to default fixtures
    console.log("[StubProvider] Using default fixtures");
    this.fixtures = DEFAULT_FIXTURES;
  }

  isAvailable(): boolean {
    return true; // Always available
  }

  async transcribe(
    audioFilePath: string,
    options?: TranscriptionOptions,
  ): Promise<TranscriptionResult> {
    console.log(
      `[StubProvider] Simulating transcription for: ${audioFilePath}`,
    );

    // Determine stub mode from environment
    const stubMode = (process.env.STUB_MODE as StubMode) || StubMode.NORMAL;

    // Handle different stub modes
    switch (stubMode) {
      case StubMode.FAST:
        // Instant response
        return this.generateResponse(0);

      case StubMode.NORMAL:
        // Normal response time (1-3 seconds)
        const normalDelay = 1000 + Math.random() * 2000;
        return this.generateResponse(normalDelay);

      case StubMode.SLOW:
        // Slow response (5-10 seconds)
        const slowDelay = 5000 + Math.random() * 5000;
        return this.generateResponse(slowDelay);

      case StubMode.TIMEOUT:
        // Simulate timeout - wait longer than typical timeout limits
        console.log(`[StubProvider] TIMEOUT mode - simulating timeout`);
        await new Promise((resolve) => setTimeout(resolve, 180000)); // 3 minutes
        throw new Error("Transcription request timed out");

      case StubMode.ERROR:
        // Always fail
        console.log(`[StubProvider] ERROR mode - simulating failure`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        throw new Error("Simulated transcription service error");

      case StubMode.RANDOM:
        // Random success/failure for chaos testing
        const shouldFail = Math.random() < 0.3; // 30% failure rate
        if (shouldFail) {
          console.log(`[StubProvider] RANDOM mode - simulating random failure`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          throw new Error("Random simulated failure for chaos testing");
        }
        const randomDelay = Math.random() * 8000; // 0-8 seconds
        return this.generateResponse(randomDelay);

      case StubMode.NEEDS_INFO:
        // Return incomplete transcripts to trigger NEEDS_INFO workflow
        console.log(
          `[StubProvider] NEEDS_INFO mode - returning minimal transcript`,
        );
        const needsInfoDelay = 1000 + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, needsInfoDelay));
        return {
          transcript: "Hi, I need help.",
          confidence: 0.95,
          source: "stub",
          warnings: ["Using stub provider - NEEDS_INFO test mode"],
          wordCount: 4,
          duration: needsInfoDelay,
          detectedLanguage: "en",
        };

      default:
        // Fallback to configurable delay mode (legacy)
        const configuredDelay = parseInt(
          process.env.STUB_TRANSCRIPTION_DELAY_MS || "0",
        );
        const latency =
          configuredDelay > 0 ? configuredDelay : 150 + Math.random() * 150;
        return this.generateResponse(latency);
    }
  }

  private async generateResponse(delay: number): Promise<TranscriptionResult> {
    console.log(
      `[StubProvider] Simulating ${Math.round(delay)}ms processing time`,
    );
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Select random fixture
    const fixtureItem =
      this.fixtures[Math.floor(Math.random() * this.fixtures.length)];

    // Extract transcript and metadata from fixture (can be string or object)
    let transcript: string;
    let wordCount: number;
    let detectedLanguage: string | undefined;

    if (typeof fixtureItem === "object" && "transcript" in fixtureItem) {
      // Fixture object with metadata
      transcript = fixtureItem.transcript;
      wordCount = fixtureItem.wordCount || transcript.split(/\s+/).length;
      detectedLanguage = fixtureItem.detectedLanguage;
    } else {
      // Plain string fixture
      transcript = fixtureItem as string;
      wordCount = transcript.split(/\s+/).length;
    }

    console.log(
      `[StubProvider] Returning fixture transcript (${wordCount} words, ${Math.round(delay)}ms)`,
    );

    return {
      transcript,
      confidence: 0.95,
      source: "stub",
      warnings: ["Using stub provider - stress test mode enabled"],
      wordCount,
      duration: delay,
      ...(detectedLanguage && { detectedLanguage }),
    };
  }
}
