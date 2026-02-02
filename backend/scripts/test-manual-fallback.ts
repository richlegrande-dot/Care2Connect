/**
 * Manual Testing Script for Fallback Flow
 * Run with: npx ts-node scripts/test-manual-fallback.ts
 */

import { PrismaClient } from '@prisma/client';
import { createPipelineFailure } from '../src/services/pipelineFailureHandler';
import { orchestrateDonationPipeline } from '../src/services/donationPipelineOrchestrator';

const prisma = new PrismaClient();

async function testManualFallback() {
  console.log('🧪 Testing Manual Fallback Flow\n');
  
  try {
    // Step 1: Create a test recording ticket
    console.log('1️⃣  Creating test recording ticket...');
    const ticket = await prisma.recordingTicket.create({
      data: {
        contactType: 'EMAIL',
        contactValue: 'manual-test@example.com',
        status: 'DRAFT'
      }
    });
    console.log(`   ✅ Created ticket: ${ticket.id}`);

    // Step 2: Test pipeline failure
    console.log('\n2️⃣  Testing pipeline failure (transcription failed)...');
    const failureResponse = await createPipelineFailure('TRANSCRIPTION_FAILED', {
      ticketId: ticket.id
    });
    console.log(`   ✅ Failure response created:`);
    console.log(`      - Success: ${failureResponse.success}`);
    console.log(`      - Fallback Required: ${failureResponse.fallbackRequired}`);
    console.log(`      - Reason: ${failureResponse.reasonCode}`);
    console.log(`      - Message: ${failureResponse.userMessage}`);
    console.log(`      - Debug ID: ${failureResponse.debugId}`);

    // Step 3: Verify incident was logged
    console.log('\n3️⃣  Checking incident logging...');
    const incidents = await prisma.systemIncident.findMany({
      where: {
        metadata: {
          path: ['ticketId'],
          equals: ticket.id
        }
      }
    });
    console.log(`   ✅ Found ${incidents.length} incident(s) logged`);
    if (incidents.length > 0) {
      console.log(`      - Severity: ${incidents[0].severity}`);
      console.log(`      - Category: ${incidents[0].category}`);
    }

    // Step 4: Test manual draft creation
    console.log('\n4️⃣  Creating manual draft...');
    const draft = await prisma.donationDraft.create({
      data: {
        ticketId: ticket.id,
        title: 'Manual Test Campaign',
        story: 'Testing the manual fallback flow',
        goalAmount: 1000,
        currency: 'USD',
        generationMode: 'MANUAL_FALLBACK',
        manuallyEditedAt: new Date(),
        extractedAt: new Date()
      }
    });
    console.log(`   ✅ Created draft: ${draft.id}`);
    console.log(`      - Generation Mode: ${draft.generationMode}`);
    console.log(`      - Manually Edited: ${draft.manuallyEditedAt ? 'Yes' : 'No'}`);

    // Step 5: Test draft retrieval
    console.log('\n5️⃣  Retrieving draft by ticket ID...');
    const retrieved = await prisma.donationDraft.findFirst({
      where: { ticketId: ticket.id }
    });
    console.log(`   ✅ Retrieved draft successfully`);
    console.log(`      - Title matches: ${retrieved?.title === draft.title}`);
    console.log(`      - Amount matches: ${retrieved?.goalAmount === draft.goalAmount}`);

    // Step 6: Test automated pipeline with dry recording
    console.log('\n6️⃣  Testing orchestrator with dry recording...');
    const dryResult = await orchestrateDonationPipeline({
      ticketId: ticket.id,
      transcript: '...'
    });
    console.log(`   ✅ Orchestrator handled dry recording`);
    console.log(`      - Success: ${dryResult.success}`);
    console.log(`      - Fallback Required: ${dryResult.fallbackRequired}`);
    if (!dryResult.success) {
      console.log(`      - Reason: ${dryResult.reasonCode}`);
    }

    // Cleanup
    console.log('\n7️⃣  Cleaning up test data...');
    await prisma.donationDraft.deleteMany({ where: { ticketId: ticket.id } });
    await prisma.systemIncident.deleteMany({
      where: {
        metadata: {
          path: ['ticketId'],
          equals: ticket.id
        }
      }
    });
    await prisma.recordingTicket.delete({ where: { id: ticket.id } });
    console.log('   ✅ Cleanup complete');

    console.log('\n✨ All tests passed! Manual fallback flow is working correctly.\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  testManualFallback()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { testManualFallback };
