const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    await prisma.$connect();
    console.log('✅ Database connected');
    
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query executed:', result);
    
    const userCount = await prisma.user.count();
    console.log('✅ User count:', userCount);
    
    await prisma.$disconnect();
    console.log('✅ Disconnected successfully');
    
    console.log('\n✅ DATABASE CONNECTION: HEALTHY');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testDatabase();
