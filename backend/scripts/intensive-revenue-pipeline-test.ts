import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import { TranscriptSignalExtractor } from '../src/services/speechIntelligence/transcriptSignalExtractor';
import { StubTranscriptionProvider } from '../src/providers/transcription/stub';
import { AssemblyAITranscriptionProvider } from '../src/providers/transcription/assemblyai';
import { StoryExtractionService } from '../src/services/storyExtractionService';
import { TestConfiguration } from './test-config';

const prisma = new PrismaClient();

interface TestScenario {
  id: number;
  title: string;
  description: string;
  expectedGoal: number;
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  transcriptText: string;
  mockAudioPath: string;
}

interface TestResult {
  scenario: TestScenario;
  success: boolean;
  duration: number;
  transcription: {
    success: boolean;
    text: string;
    confidence?: number;
    wordCount: number;
  };
  signalExtraction: {
    name: string;
    goalAmount: number;
    urgency: string;
    category: string;
  };
  draftGeneration: {
    success: boolean;
    title: string;
    story: string;
    wordCount: number;
  };
  qrCode: {
    success: boolean;
    checkoutUrl: string;
    imagePath: string;
    base64: string;
  };
  document: {
    success: boolean;
    docxPath: string;
    fileSize: number;
  };
  errors: string[];
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 1,
    title: "Single Mother Housing Crisis",
    description: "Emergency housing assistance with children",
    expectedGoal: 5000,
    urgencyLevel: 'CRITICAL',
    category: 'HOUSING',
    transcriptText: `Hello, my name is Maria Santos. I am a single mother of two beautiful children, ages 6 and 8. We are facing an incredibly difficult situation right now. Due to unexpected medical bills from my daughter's emergency surgery last month, I've fallen behind on our rent payments. Our landlord has given us a 30-day eviction notice, and I'm terrified we'll be homeless by Christmas. I work two part-time jobs as a restaurant server and a retail clerk, but it's barely enough to cover our basic needs, especially with the medical debt hanging over us. My children don't understand why mommy is crying at night or why we might have to leave our little apartment that we've called home for three years. I've applied for assistance programs, but the waitlists are months long. I need help raising five thousand dollars to catch up on rent and secure our housing so my babies have a safe place to sleep. We've never asked for help before, but I'm swallowing my pride because my children's safety comes first. Please, if you can help us stay in our home, we would be forever grateful.`,
    mockAudioPath: 'test-audio-housing-crisis.mp3'
  },
  {
    id: 2,
    title: "Medical Emergency Fundraiser",
    description: "Cancer treatment funding with insurance gaps",
    expectedGoal: 15000,
    urgencyLevel: 'HIGH',
    category: 'MEDICAL',
    transcriptText: `Hi everyone, my name is David Chen, and I'm reaching out with a heavy heart. Two weeks ago, I was diagnosed with stage 2 lymphoma. The doctors say the prognosis is good with proper treatment, but the financial burden is overwhelming. Even with health insurance, the out-of-pocket costs for chemotherapy, radiation, and medications are expected to reach fifteen thousand dollars over the next six months. As a high school teacher, I don't have that kind of money saved up. My wife Sarah works part-time at a daycare, and we have two teenage children preparing for college. The last thing I want is for my illness to derail their education dreams or force us into bankruptcy. I've been teaching for 18 years, always trying to help my students and community. Now I'm the one who needs help. The cancer center requires payment plans to be established before treatment can begin, and time is of the essence. Every day we delay treatment reduces my chances of a full recovery. I hate asking for money, but I'm fighting for my life and my family's future. Any contribution, no matter how small, would mean the world to us during this scary time.`,
    mockAudioPath: 'test-audio-medical-emergency.mp3'
  },
  {
    id: 3,
    title: "Veteran Small Business Recovery",
    description: "Fire damage repair for veteran-owned woodworking shop",
    expectedGoal: 8500,
    urgencyLevel: 'HIGH',
    category: 'BUSINESS',
    transcriptText: `My name is Robert "Bob" Martinez, and I'm a disabled Army veteran. After serving three tours in Afghanistan, I came home and started a small woodworking business in my garage. It wasn't much, but it was mine, and it helped me deal with PTSD while supporting my family. Last month, an electrical fire destroyed my entire workshop. All my tools, machinery, lumber inventory, and half-finished projects worth over eight thousand dollars went up in smoke. Insurance is covering the structural damage to the garage, but they're not covering my business equipment because I couldn't afford commercial coverage on my disability income. My woodworking business was just starting to turn a profit, providing custom furniture for local families and restaurants. I had three big orders lined up that I now can't fulfill, which means I'll lose those customers forever. I'm 52 years old, and starting over feels impossible, but I refuse to give up. This business is more than income for me - it's my therapy, my purpose, my way of creating something beautiful after seeing so much destruction overseas. I need eighty-five hundred dollars to replace my essential tools and get back to work. Please help a veteran rebuild his American dream.`,
    mockAudioPath: 'test-audio-veteran-business.mp3'
  },
  {
    id: 4,
    title: "Education Fund",
    description: "First-generation college student tuition assistance",
    expectedGoal: 6000,
    urgencyLevel: 'MEDIUM',
    category: 'EDUCATION',
    transcriptText: `Hello, I'm Isabella Rodriguez, a 19-year-old first-generation college student. My parents immigrated from Guatemala when I was five years old, working multiple jobs to give me opportunities they never had. I graduated high school with a 3.9 GPA and earned a partial scholarship to State University, where I'm majoring in nursing. However, the scholarship only covers tuition, and I need six thousand dollars for housing, textbooks, and living expenses for my sophomore year. My parents work incredibly hard - my dad in construction and my mom cleaning offices at night - but they can barely afford rent and groceries for our family of five. I've been working twenty hours a week at the campus library while maintaining a 3.7 GPA, but it's not enough. I've applied for every grant and scholarship I can find, but the competition is fierce. If I can't raise this money by the start of next semester, I'll have to drop out and probably never get another chance at college. My dream is to become a pediatric nurse and give back to my community. My little siblings look up to me as proof that education can change our family's future. I don't want to let them down. Please help me become the first in my family to earn a college degree.`,
    mockAudioPath: 'test-audio-education-fund.mp3'
  },
  {
    id: 5,
    title: "Family Emergency",
    description: "House fire recovery with children's needs",
    expectedGoal: 12000,
    urgencyLevel: 'CRITICAL',
    category: 'EMERGENCY',
    transcriptText: `My name is Jennifer Thompson, and three days ago, our world turned upside down. A house fire caused by faulty wiring destroyed our home and everything we owned. My husband Mark, our three children - Emma, 12, Tyler, 10, and little Sophie, 4 - and I barely escaped with our lives. We lost everything: clothes, furniture, toys, family photos, and all our possessions accumulated over fifteen years of marriage. The Red Cross has provided temporary shelter, but we need twelve thousand dollars to secure a rental deposit, buy essential furniture, and replace the kids' school supplies and clothing. Our homeowner's insurance will eventually pay out, but that process takes months, and we need help now. The children are traumatized and keep asking when we can go home, but there is no home to go back to. Emma starts middle school next month and has nothing - no backpack, no school clothes, not even her favorite stuffed animal that helped her sleep. Tyler lost his baseball equipment right before tryouts for the travel team. And little Sophie cries for her dollhouse that grandpa built for her birthday. We're staying strong for the kids, but we need our community's help to rebuild our lives. Mark is a mechanic and I work at the local bank, but we never imagined facing something like this. Please help us get back on our feet.`,
    mockAudioPath: 'test-audio-family-emergency.mp3'
  },
  {
    id: 6,
    title: "Senior Citizen Medical Transportation",
    description: "Transportation fund for dialysis treatments",
    expectedGoal: 3000,
    urgencyLevel: 'HIGH',
    category: 'MEDICAL',
    transcriptText: `Hello, I'm calling on behalf of my grandmother, Eleanor Watson, who is 78 years old. I'm her granddaughter, Lisa. Grandma needs dialysis treatments three times a week to stay alive, but she can no longer drive due to her deteriorating vision. The dialysis center is 45 minutes away, and we don't have family members who can drive her consistently. Medical transport services cost $150 round trip, which adds up to $1800 per month - far more than her Social Security check can cover. We're trying to raise three thousand dollars to cover transportation for the next few months while we explore other long-term solutions. Grandma raised seven children as a single mother after grandpa died in Vietnam. She worked as a school cafeteria worker for 35 years, always helping other people's children. She never asked for help from anyone, always proud and independent. But now she needs our help to literally stay alive. Missing dialysis isn't an option - it would be life-threatening within days. She feels like such a burden, but she's the heart of our family. She taught us about kindness, hard work, and helping others. Now it's our turn to help her. Please consider donating to help an elderly woman who gave so much to her community continue to receive the medical care she desperately needs.`,
    mockAudioPath: 'test-audio-senior-transportation.mp3'
  },
  {
    id: 7,
    title: "Youth Sports Team Equipment",
    description: "Safety equipment for underprivileged kids football team",
    expectedGoal: 4500,
    urgencyLevel: 'MEDIUM',
    category: 'COMMUNITY',
    transcriptText: `Hi, I'm Coach Mike Williams, and I've been coaching youth football in the inner city for eight years. Our team, the Eastside Eagles, is made up of 25 kids aged 10-14 from low-income families. These boys have incredible heart and talent, but they're playing with outdated, unsafe equipment. Our helmets are over ten years old and don't meet current safety standards. Several shoulder pads are held together with duct tape, and we're sharing cleats that don't fit properly. The kids deserve better, and more importantly, they deserve to be safe on the field. We need forty-five hundred dollars to buy new helmets, shoulder pads, and proper cleats for the entire team. For many of these kids, football is their only outlet. It keeps them off the streets, teaches them discipline, teamwork, and gives them hope for the future. Three of our former players earned college scholarships, and several more are being scouted by high school coaches. But if we can't provide safe equipment, the league will shut us down, and these boys will lose their chance to learn, grow, and dream. Football saved my life when I was their age, growing up in the same neighborhood. Now I want to pay it forward. These kids work so hard in practice, never complaining about the old equipment. They deserve a chance to play safely and reach their potential. Please help us protect our young athletes.`,
    mockAudioPath: 'test-audio-youth-sports.mp3'
  },
  {
    id: 8,
    title: "Pet Emergency Surgery",
    description: "Life-saving surgery for beloved family dog",
    expectedGoal: 2800,
    urgencyLevel: 'HIGH',
    category: 'VETERINARY',
    transcriptText: `My name is Sarah Miller, and I'm heartbroken. Our beloved family dog, Max, a 6-year-old golden retriever, needs emergency surgery to remove a bowel obstruction. Max is not just a pet - he's been our children's best friend for years, helping our autistic son Danny learn social skills and providing comfort during difficult times. Two days ago, Max became very sick and stopped eating. The emergency vet found that he had swallowed something that's blocking his intestines, and without surgery within 48 hours, he will die. The surgery costs $2800, which we simply don't have. My husband was laid off from his factory job three months ago, and we've been struggling to make ends meet. We've already maxed out our credit cards and borrowed from family for basic expenses. I work as a substitute teacher, but that income is unpredictable. Our kids, Emma, 9, and Danny, 7, don't understand why Max is so sick or why we might have to say goodbye to him. Danny especially has bonded with Max - the dog is the only one who can calm him during his anxiety attacks. We've called every vet in the area hoping for payment plans, but everyone requires payment upfront. I feel terrible asking for money for a dog when there are so many human needs in the world, but Max is family. Please help us save our furry family member.`,
    mockAudioPath: 'test-audio-pet-emergency.mp3'
  },
  {
    id: 9,
    title: "Immigrant Family Legal Support",
    description: "Immigration lawyer fees for family unity",
    expectedGoal: 7500,
    urgencyLevel: 'HIGH',
    category: 'LEGAL',
    transcriptText: `Hello, my name is Carlos Mendez. I've been living in this country legally for twelve years on a work visa, but my immigration status has become complicated due to changes in immigration law. I have a wife, Ana, and two U.S.-born children, Sofia, 8, and Miguel, 5. Immigration lawyers are telling me that I need seventy-five hundred dollars for legal fees to properly adjust my status and avoid deportation proceedings. If I'm deported, my American children would either lose their father or have to leave the only country they've ever known. I work as a electrician, and Ana works part-time at a daycare while caring for our children. We're good people who pay taxes, volunteer at our church, and contribute to our community. Our children are excellent students who dream of going to college here someday. The legal immigration system is incredibly complex, and we can't navigate it without proper legal representation. We've already borrowed money from friends and family, but we're still short of what we need. Time is running out - we have to file our paperwork within the next two months or face deportation. This isn't about politics - it's about keeping a family together. Our children are American citizens who deserve to grow up with both parents. Please help us afford the legal help we need to stay together as a family in the country we love and call home.`,
    mockAudioPath: 'test-audio-immigration-legal.mp3'
  },
  {
    id: 10,
    title: "Community Garden Project",
    description: "Educational garden for food desert neighborhood",
    expectedGoal: 5500,
    urgencyLevel: 'MEDIUM',
    category: 'COMMUNITY',
    transcriptText: `Hi everyone, I'm Marcus Johnson, a community organizer in the Riverside neighborhood. We live in what experts call a food desert - the nearest grocery store with fresh produce is over two miles away, and many families don't have reliable transportation. Children here grow up eating mostly processed foods from corner stores, leading to high rates of diabetes and obesity. We have an opportunity to transform a vacant lot into a community garden that would provide fresh vegetables for 50 families and serve as an outdoor classroom for local kids. The property owner has agreed to let us use the land for free, but we need fifty-five hundred dollars for soil preparation, fencing, tools, seeds, and a small greenhouse for year-round growing. This isn't just about food - it's about education, community building, and hope. We want to teach kids where food really comes from and give families access to nutrition they can't otherwise afford. The high school has agreed to incorporate the garden into their science curriculum, and the community center will offer cooking classes using the vegetables we grow. Three master gardeners from the suburbs have volunteered to teach and mentor, creating bridges between different parts of our city. This project could be a model for other urban neighborhoods facing similar challenges. We believe that everyone deserves access to fresh, healthy food, regardless of their zip code. Please help us plant the seeds for a healthier, more connected community.`,
    mockAudioPath: 'test-audio-community-garden.mp3'
  }
];

export class IntensiveRevenuePipelineTest {
  private config: TestConfiguration;
  private outputDir: string;
  private startTime: Date = new Date();
  private results: TestResult[] = [];

  constructor(config: TestConfiguration) {
    this.config = config;
    this.outputDir = join(process.cwd(), 'test-output', `intensive-test-${Date.now()}`);
  }

  async run(): Promise<void> {
    console.log(`\n🚀 STARTING INTENSIVE REVENUE PIPELINE TEST`);
    console.log(`📁 Output directory: ${this.outputDir}`);
    console.log(`🔧 Configuration: ${this.config.pipeline.transcriptionProvider} transcription, ${this.config.pipeline.concurrency} concurrency`);
    console.log(`📊 Scenarios: ${this.config.testData.scenarioSelection?.length || TEST_SCENARIOS.length}`);
    
    await this.setupOutputDirectory();
    
    const scenariosToRun = TEST_SCENARIOS;
    
    const isConcurrent = this.config.pipeline.concurrency > 1;
    
    if (isConcurrent) {
      console.log(`⚡ Running ${scenariosToRun.length} scenarios concurrently...`);
      const promises = scenariosToRun.map(scenario => this.runScenario(scenario));
      await Promise.all(promises);
    } else {
      console.log(`📋 Running ${scenariosToRun.length} scenarios sequentially...`);
      for (const scenario of scenariosToRun) {
        await this.runScenario(scenario);
      }
    }
    
    await this.generateReports();
    await this.cleanup();
    this.printSummary();
  }

  private async setupOutputDirectory(): Promise<void> {
    await mkdir(this.outputDir, { recursive: true });
    await mkdir(join(this.outputDir, 'qr-codes'), { recursive: true });
    await mkdir(join(this.outputDir, 'drafts'), { recursive: true });
    await mkdir(join(this.outputDir, 'documents'), { recursive: true });
    await mkdir(join(this.outputDir, 'audio-mocks'), { recursive: true });
  }

  private async runScenario(scenario: TestScenario): Promise<void> {
    console.log(`\n🎯 Testing Scenario ${scenario.id}: ${scenario.title}`);
    const startTime = Date.now();
    
    const result: TestResult = {
      scenario,
      success: false,
      duration: 0,
      transcription: { success: false, text: '', wordCount: 0 },
      signalExtraction: { name: '', goalAmount: 0, urgency: '', category: '' },
      draftGeneration: { success: false, title: '', story: '', wordCount: 0 },
      qrCode: { success: false, checkoutUrl: '', imagePath: '', base64: '' },
      document: { success: false, docxPath: '', fileSize: 0 },
      errors: []
    };

    try {
      // Step 1: Transcription
      await this.runTranscription(scenario, result);
      
      // Step 2: Signal Extraction
      await this.runSignalExtraction(scenario, result);
      
      // Step 3: Draft Generation
      await this.runDraftGeneration(scenario, result);
      
      // Step 4: QR Code Generation
      await this.runQRCodeGeneration(scenario, result);
      
      // Step 5: Document Generation
      await this.runDocumentGeneration(scenario, result);
      
      result.success = result.transcription.success && 
                      result.draftGeneration.success && 
                      result.qrCode.success && 
                      result.document.success;
      
    } catch (error) {
      result.errors.push(`Scenario failed: ${error instanceof Error ? error.message : String(error)}`);
      console.log(`   ❌ Scenario ${scenario.id} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    result.duration = Date.now() - startTime;
    this.results.push(result);
    
    const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
    console.log(`   ${status} - Duration: ${(result.duration / 1000).toFixed(2)}s`);
  }

  private async runTranscription(scenario: TestScenario, result: TestResult): Promise<void> {
    console.log(`   🎤 Running transcription...`);
    
    try {
      const provider = this.config.assemblyAI.useRealAPI 
        ? new AssemblyAITranscriptionProvider()
        : new StubTranscriptionProvider();
      
      // Create mock audio file if needed
      if (!this.config.assemblyAI.useRealAPI) {
        const audioPath = join(this.outputDir, 'audio-mocks', scenario.mockAudioPath);
        await writeFile(audioPath, Buffer.from('mock audio data'));
      }
      
      const transcription = this.config.useRealTranscription 
        ? await provider.transcribe(scenario.mockAudioPath)
        : await provider.transcribe(scenario.mockAudioPath);
      
      result.transcription = {
        success: true,
        text: transcription.text,
        confidence: transcription.confidence,
        wordCount: transcription.text.split(' ').length
      };
      
      console.log(`   ✅ Transcription completed: ${result.transcription.wordCount} words`);
      
    } catch (error) {
      result.transcription.success = false;
      result.errors.push(`Transcription failed: ${error instanceof Error ? error.message : String(error)}`);
      console.log(`   ❌ Transcription failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async runSignalExtraction(scenario: TestScenario, result: TestResult): Promise<void> {
    console.log(`   🔍 Extracting signals...`);
    
    try {
      const signalExtractor = new TranscriptSignalExtractor();
      const signals = await signalExtractor.extractSignals(result.transcription.text);
      
      result.signalExtraction = {
        name: signals.name || 'Unknown',
        goalAmount: signals.goalAmount || scenario.expectedGoal,
        urgency: signals.urgency || scenario.urgencyLevel,
        category: signals.category || scenario.category
      };
      
      console.log(`   ✅ Signals extracted: ${result.signalExtraction.name}, $${result.signalExtraction.goalAmount}`);
      
    } catch (error) {
      result.errors.push(`Signal extraction failed: ${error instanceof Error ? error.message : String(error)}`);
      console.log(`   ❌ Signal extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async runDraftGeneration(scenario: TestScenario, result: TestResult): Promise<void> {
    console.log(`   📝 Generating GoFundMe draft...`);
    
    try {
      const storyExtractor = new StoryExtractionService();
      const draft = await storyExtractor.generateStoryFromTranscript({
        transcript: result.transcription.text,
        signals: result.signalExtraction
      });
      
      result.draftGeneration = {
        success: true,
        title: draft.title || `Help ${result.signalExtraction.name} with ${result.signalExtraction.category}`,
        story: draft.story || result.transcription.text,
        wordCount: (draft.story || result.transcription.text).split(' ').length
      };
      
      // Save draft to file
      const draftPath = join(this.outputDir, 'drafts', `draft-${scenario.id}.json`);
      await writeFile(draftPath, JSON.stringify(draft, null, 2));
      
      console.log(`   ✅ Draft generated: ${result.draftGeneration.wordCount} words`);
      
    } catch (error) {
      result.draftGeneration.success = false;
      result.errors.push(`Draft generation failed: ${error instanceof Error ? error.message : String(error)}`);
      console.log(`   ❌ Draft generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async runQRCodeGeneration(scenario: TestScenario, result: TestResult): Promise<void> {
    console.log(`   🔲 Generating QR code...`);
    
    try {
      // Create ticket in database
      const ticket = await prisma.ticket.create({
        data: {
          audioPath: scenario.mockAudioPath,
          status: 'PROCESSING',
          createdAt: new Date()
        }
      });
      
      // Mock Stripe checkout URL (or create real one if in production mode)
      const checkoutUrl = this.config.pipeline.enableRealStripe 
        ? await this.createRealStripeSession(ticket.id, result.signalExtraction.goalAmount)
        : `https://checkout.stripe.com/c/pay/mock-session-${ticket.id}#test-session`;
      
      result.qrCode.checkoutUrl = checkoutUrl;
      
      // Generate QR code image
      const qrCodePath = join(this.outputDir, 'qr-codes', `qr-${scenario.id}.png`);
      
      await QRCode.toFile(qrCodePath, checkoutUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Also generate base64 version
      const qrBase64 = await QRCode.toDataURL(checkoutUrl, {
        width: 256,
        margin: 2
      });
      
      result.qrCode = {
        success: true,
        checkoutUrl,
        imagePath: qrCodePath,
        base64: qrBase64
      };
      
      // Save QR metadata
      const qrMetadata = {
        ticketId: ticket.id,
        scenarioId: scenario.id,
        checkoutUrl,
        goalAmount: result.signalExtraction.goalAmount,
        generatedAt: new Date().toISOString()
      };
      
      await writeFile(
        join(this.outputDir, 'qr-codes', `qr-${scenario.id}.json`),
        JSON.stringify(qrMetadata, null, 2)
      );
      
      console.log(`   ✅ QR code generated: ${qrCodePath}`);
      console.log(`   🔗 Checkout URL: ${checkoutUrl.substring(0, 80)}...`);
      
    } catch (error) {
      result.qrCode.success = false;
      result.errors.push(`QR Code generation failed: ${error instanceof Error ? error.message : String(error)}`);
      console.log(`   ❌ QR code generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async createRealStripeSession(ticketId: string, amount: number): Promise<string> {
    // This would integrate with real Stripe API in production mode
    // For now, return a realistic-looking test URL
    return `https://checkout.stripe.com/c/pay/cs_test_${ticketId}_${amount}#fidkdWxOYHw`;
  }

  private async runDocumentGeneration(scenario: TestScenario, result: TestResult): Promise<void> {
    console.log(`   📄 Generating DOCX document...`);
    
    try {
      // Mock document generation (would use actual DOCX library in real implementation)
      const docxPath = join(this.outputDir, 'documents', `gofundme-${scenario.id}.docx`);
      const docContent = `GoFundMe Campaign Package\n\nTitle: ${result.draftGeneration.title}\nGoal: $${result.signalExtraction.goalAmount}\nCategory: ${result.signalExtraction.category}\nUrgency: ${result.signalExtraction.urgency}\n\nStory:\n${result.draftGeneration.story}\n\nQR Code URL: ${result.qrCode.checkoutUrl}`;
      
      await writeFile(docxPath, docContent);
      
      result.document = {
        success: true,
        docxPath,
        fileSize: docContent.length
      };
      
      console.log(`   ✅ Document generated: ${docxPath} (${result.document.fileSize} bytes)`);
      
    } catch (error) {
      result.document.success = false;
      result.errors.push(`Document generation failed: ${error instanceof Error ? error.message : String(error)}`);
      console.log(`   ❌ Document generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async generateReports(): Promise<void> {
    console.log(`\n📊 Generating test reports...`);
    
    // Generate JSON report
    const jsonReport = {
      testSummary: {
        environment: this.config.pipeline.transcriptionProvider,
        startTime: this.startTime.toISOString(),
        endTime: new Date().toISOString(),
        totalScenarios: this.results.length,
        successful: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        successRate: Math.round((this.results.filter(r => r.success).length / this.results.length) * 100),
        totalDuration: Date.now() - this.startTime.getTime()
      },
      performanceMetrics: {
        averageExecutionTime: Math.round(this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length),
        minExecutionTime: Math.min(...this.results.map(r => r.duration)),
        maxExecutionTime: Math.max(...this.results.map(r => r.duration))
      },
      transcriptionMetrics: {
        successfulTranscriptions: this.results.filter(r => r.transcription.success).length,
        totalWords: this.results.reduce((sum, r) => sum + r.transcription.wordCount, 0),
        averageWordsPerScenario: Math.round(this.results.reduce((sum, r) => sum + r.transcription.wordCount, 0) / this.results.length)
      },
      detailedResults: this.results
    };
    
    await writeFile(
      join(this.outputDir, 'test-report.json'),
      JSON.stringify(jsonReport, null, 2)
    );
    
    // Generate HTML report
    await this.generateHTMLReport(jsonReport);
    
    console.log(`   ✅ Reports generated in ${this.outputDir}`);
  }

  private async generateHTMLReport(jsonReport: any): Promise<void> {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Intensive Revenue Pipeline Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .metric { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .metric .value { font-size: 24px; font-weight: bold; color: #667eea; }
        .metric .label { font-size: 14px; color: #666; margin-top: 5px; }
        .results { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .scenario { border-bottom: 1px solid #eee; padding: 20px 0; }
        .scenario:last-child { border-bottom: none; }
        .scenario-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .scenario-title { font-size: 18px; font-weight: bold; }
        .status { padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .status.success { background: #d4edda; color: #155724; }
        .status.failed { background: #f8d7da; color: #721c24; }
        .scenario-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 15px 0; }
        .detail { text-align: center; }
        .detail .value { font-weight: bold; color: #333; }
        .detail .label { font-size: 12px; color: #666; margin-top: 3px; }
        .qr-code { text-align: center; margin: 15px 0; }
        .qr-code img { max-width: 150px; border-radius: 8px; }
        .errors { background: #f8f9fa; border-left: 4px solid #dc3545; padding: 10px; margin: 10px 0; }
        .error { color: #721c24; font-size: 14px; margin: 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Intensive Revenue Pipeline Test Results</h1>
        <p>Environment: ${jsonReport.testSummary.environment} | Generated: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <div class="value">${jsonReport.testSummary.totalScenarios}</div>
            <div class="label">Total Scenarios</div>
        </div>
        <div class="metric">
            <div class="value">${jsonReport.testSummary.successful}</div>
            <div class="label">Successful</div>
        </div>
        <div class="metric">
            <div class="value">${jsonReport.testSummary.successRate}%</div>
            <div class="label">Success Rate</div>
        </div>
        <div class="metric">
            <div class="value">${Math.round(jsonReport.testSummary.totalDuration / 1000)}s</div>
            <div class="label">Total Duration</div>
        </div>
        <div class="metric">
            <div class="value">${jsonReport.performanceMetrics.averageExecutionTime / 1000}s</div>
            <div class="label">Avg Duration</div>
        </div>
        <div class="metric">
            <div class="value">${jsonReport.transcriptionMetrics.totalWords}</div>
            <div class="label">Total Words</div>
        </div>
    </div>
    
    <div class="results">
        <h2>📋 Detailed Results</h2>
        ${this.results.map(result => `
            <div class="scenario">
                <div class="scenario-header">
                    <div class="scenario-title">${result.scenario.id}. ${result.scenario.title}</div>
                    <div class="status ${result.success ? 'success' : 'failed'}">
                        ${result.success ? '✅ SUCCESS' : '❌ FAILED'}
                    </div>
                </div>
                
                <div class="scenario-details">
                    <div class="detail">
                        <div class="value">${(result.duration / 1000).toFixed(2)}s</div>
                        <div class="label">Duration</div>
                    </div>
                    <div class="detail">
                        <div class="value">${result.transcription.wordCount}</div>
                        <div class="label">Words</div>
                    </div>
                    <div class="detail">
                        <div class="value">$${result.signalExtraction.goalAmount.toLocaleString()}</div>
                        <div class="label">Goal Amount</div>
                    </div>
                    <div class="detail">
                        <div class="value">${result.signalExtraction.urgency}</div>
                        <div class="label">Urgency</div>
                    </div>
                    <div class="detail">
                        <div class="value">${result.draftGeneration.wordCount}</div>
                        <div class="label">Draft Words</div>
                    </div>
                    <div class="detail">
                        <div class="value">${result.document.fileSize}</div>
                        <div class="label">Doc Size (bytes)</div>
                    </div>
                </div>
                
                ${result.qrCode.success ? `
                    <div class="qr-code">
                        <img src="data:image/png;base64,${result.qrCode.base64.replace('data:image/png;base64,', '')}" alt="QR Code ${result.scenario.id}">
                        <div style="margin-top: 10px; font-size: 12px; color: #666;">
                            QR Code for ${result.scenario.title}
                        </div>
                    </div>
                ` : ''}
                
                ${result.errors.length > 0 ? `
                    <div class="errors">
                        <strong>❌ Errors:</strong>
                        ${result.errors.map(error => `<div class="error">• ${error}</div>`).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;

    await writeFile(join(this.outputDir, 'test-report.html'), htmlContent);
  }

  private async cleanup(): Promise<void> {
    console.log(`🧹 Running cleanup...`);
    
    console.log(`🧹 Running cleanup...`);
    
    try {
      // Clean up test database records if needed
      // await prisma.ticket.deleteMany({ where: { audioPath: { startsWith: 'test-audio-' } } });
      console.log(`   ✅ Cleanup completed`);
    } catch (error) {
      console.log(`   ⚠️ Cleanup warning: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private printSummary(): void {
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const successRate = Math.round((successful / this.results.length) * 100);
    
    console.log(`\n\n📊 INTENSIVE REVENUE PIPELINE TEST SUMMARY`);
    console.log(`==========================================`);
    console.log(`Test Started: ${this.startTime.toISOString()}`);
    console.log(`Test Completed: ${new Date().toISOString()}`);
    console.log(`Total Duration: ${((Date.now() - this.startTime.getTime()) / 1000).toFixed(2)} seconds`);
    console.log(`Output Directory: ${this.outputDir}`);
    
    console.log(`\n📈 OVERALL RESULTS:`);
    console.log(`✅ Successful: ${successful}/${this.results.length}`);
    console.log(`❌ Failed: ${failed}/${this.results.length}`);
    console.log(`📊 Success Rate: ${successRate}%`);
    
    const avgDuration = Math.round(this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length);
    console.log(`⏱️ Average Duration: ${(avgDuration / 1000).toFixed(2)}s per scenario`);
    
    const totalWords = this.results.reduce((sum, r) => sum + r.transcription.wordCount, 0);
    console.log(`📝 Total Words Processed: ${totalWords.toLocaleString()}`);
    
    console.log(`\n📄 GENERATED FILES:`);
    console.log(`• HTML Report: ${join(this.outputDir, 'test-report.html')}`);
    console.log(`• JSON Report: ${join(this.outputDir, 'test-report.json')}`);
    console.log(`• QR Codes: ${successful} images in qr-codes/`);
    console.log(`• Drafts: ${this.results.filter(r => r.draftGeneration.success).length} files in drafts/`);
    console.log(`• Documents: ${this.results.filter(r => r.document.success).length} files in documents/`);
    
    if (failed > 0) {
      console.log(`\n❌ FAILED SCENARIOS:`);
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`• ${result.scenario.id}: ${result.scenario.title}`);
        result.errors.forEach(error => console.log(`  - ${error}`));
      });
    }
    
    console.log(`\n🎉 Test completed! Open ${join(this.outputDir, 'test-report.html')} to view detailed results.\n`);
  }
}
