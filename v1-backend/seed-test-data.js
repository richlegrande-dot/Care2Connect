/**
 * Test Data Seeder for Admin Story Browser QA
 * Creates test recordings with various profile configurations
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs-extra');

// Database setup
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/careconnect';
const pool = new Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createTestData() {
  console.log('=====================================');
  console.log('Creating Test Data for QA');
  console.log('=====================================\n');

  try {
    // Ensure audio directory exists
    const audioDir = path.join(__dirname, 'uploads', 'audio');
    await fs.ensureDir(audioDir);

    // Create mock audio files
    const createMockAudio = async (filename) => {
      const filepath = path.join(audioDir, filename);
      // Create minimal WebM file
      const bytes = Buffer.from([
        0x1a, 0x45, 0xdf, 0xa3, 0x01, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x1f, 0x42, 0x86, 0x81, 0x01
      ]);
      await fs.writeFile(filepath, bytes);
      return filename;
    };

    // Test 1: Email-only profile
    console.log('Test 1: Creating recording with email-only profile');
    const audio1 = await createMockAudio('test-email-only.webm');
    const profile1 = await prisma.userProfile.create({
      data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: null,
      },
    });
    const recording1 = await prisma.recording.create({
      data: {
        userId: profile1.id,
        audioUrl: `http://localhost:3001/audio/${audio1}`,
        duration: 45,
        status: 'NEW',
      },
    });
    await prisma.recordingEventLog.create({
      data: {
        recordingId: recording1.id,
        userId: profile1.id,
        event: 'created',
        metadata: { audioFile: audio1, duration: 45 },
      },
    });
    await prisma.recordingEventLog.create({
      data: {
        recordingId: recording1.id,
        userId: profile1.id,
        event: 'profile_attached',
        metadata: { profileName: 'John Doe', hasEmail: true, hasPhone: false },
      },
    });
    console.log(`✅ Created: ${profile1.name} (email only)`);
    console.log(`   Profile ID: ${profile1.id}`);
    console.log(`   Recording ID: ${recording1.id}\n`);

    // Test 2: Phone-only profile
    console.log('Test 2: Creating recording with phone-only profile');
    const audio2 = await createMockAudio('test-phone-only.webm');
    const profile2 = await prisma.userProfile.create({
      data: {
        name: 'Jane Smith',
        email: null,
        phone: '(555) 123-4567',
      },
    });
    const recording2 = await prisma.recording.create({
      data: {
        userId: profile2.id,
        audioUrl: `http://localhost:3001/audio/${audio2}`,
        duration: 62,
        status: 'IN_REVIEW',
      },
    });
    await prisma.recordingEventLog.create({
      data: {
        recordingId: recording2.id,
        userId: profile2.id,
        event: 'created',
        metadata: { audioFile: audio2, duration: 62 },
      },
    });
    await prisma.recordingEventLog.create({
      data: {
        recordingId: recording2.id,
        userId: profile2.id,
        event: 'profile_attached',
        metadata: { profileName: 'Jane Smith', hasEmail: false, hasPhone: true },
      },
    });
    console.log(`✅ Created: ${profile2.name} (phone only)`);
    console.log(`   Profile ID: ${profile2.id}`);
    console.log(`   Recording ID: ${recording2.id}\n`);

    // Test 3: Both email and phone
    console.log('Test 3: Creating recording with email + phone profile');
    const audio3 = await createMockAudio('test-both-contacts.webm');
    const profile3 = await prisma.userProfile.create({
      data: {
        name: 'Robert Johnson',
        email: 'robert.johnson@example.com',
        phone: '(555) 987-6543',
      },
    });
    const recording3 = await prisma.recording.create({
      data: {
        userId: profile3.id,
        audioUrl: `http://localhost:3001/audio/${audio3}`,
        duration: 120,
        status: 'COMPLETE',
      },
    });
    await prisma.recordingEventLog.create({
      data: {
        recordingId: recording3.id,
        userId: profile3.id,
        event: 'created',
        metadata: { audioFile: audio3, duration: 120 },
      },
    });
    await prisma.recordingEventLog.create({
      data: {
        recordingId: recording3.id,
        userId: profile3.id,
        event: 'profile_attached',
        metadata: { profileName: 'Robert Johnson', hasEmail: true, hasPhone: true },
      },
    });
    await prisma.recordingEventLog.create({
      data: {
        recordingId: recording3.id,
        userId: profile3.id,
        event: 'status_updated',
        metadata: { oldStatus: 'NEW', newStatus: 'COMPLETE' },
      },
    });
    console.log(`✅ Created: ${profile3.name} (email + phone)`);
    console.log(`   Profile ID: ${profile3.id}`);
    console.log(`   Recording ID: ${recording3.id}\n`);

    // Summary
    console.log('=====================================');
    console.log('Test Data Summary');
    console.log('=====================================');
    
    const totalProfiles = await prisma.userProfile.count();
    const totalRecordings = await prisma.recording.count();
    const totalEvents = await prisma.recordingEventLog.count();
    
    console.log(`Total Profiles: ${totalProfiles}`);
    console.log(`Total Recordings: ${totalRecordings}`);
    console.log(`Total Events: ${totalEvents}\n`);

    const recordingsByStatus = await prisma.recording.groupBy({
      by: ['status'],
      _count: true,
    });
    
    console.log('Recordings by Status:');
    recordingsByStatus.forEach(item => {
      console.log(`  ${item.status}: ${item._count}`);
    });
    
    console.log('\n✅ Test data created successfully!');
    console.log('\nNext steps:');
    console.log('1. Visit http://localhost:3000/admin/login');
    console.log('2. Enter password: Hayfield::');
    console.log('3. Check story browser for the 3 test recordings');
    console.log('4. Verify PII masking (j***@example.com, (555) ***-4567)');
    console.log('5. Click rows to test detail drawer and audio playback\n');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Run the seeder
createTestData();
