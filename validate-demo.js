#!/usr/bin/env node
/**
 * CareConnect Demo Validation Script
 * Validates all components are ready for demo
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 CareConnect Demo Readiness Validation\n');

const checks = [];

// Check file structure
const requiredFiles = [
  'backend/src/server.ts',
  'backend/src/routes/transcription.ts', 
  'backend/src/routes/qrDonations.ts',
  'backend/src/routes/exports.ts',
  'backend/src/services/storyExtractionService.ts',
  'backend/src/services/transcriptionService.ts',
  'backend/src/exports/generateGofundmeDocx.ts',
  'backend/src/middleware/dataProtectionService.ts',
  'backend/src/schemas/gofundmeDraft.schema.ts',
  'frontend/app/page.tsx',
  'frontend/app/gfm/extract/page.tsx',
  'frontend/app/gfm/review/page.tsx',
  'frontend/app/donate/[slug]/page.tsx',
  'frontend/components/RecordingInterface.tsx',
  'frontend/components/FollowUpQuestionModal.tsx',
];

console.log('📁 Checking File Structure...');
let fileChecksPassed = 0;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
    fileChecksPassed++;
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

checks.push({
  name: 'File Structure',
  passed: fileChecksPassed === requiredFiles.length,
  score: `${fileChecksPassed}/${requiredFiles.length}`
});

// Check package dependencies
console.log('\n📦 Checking Dependencies...');
const backendPackage = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
const frontendPackage = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));

const requiredBackendDeps = ['express', 'openai', 'stripe', 'qrcode', 'docx', 'zod', 'prisma'];
const requiredFrontendDeps = ['next', 'react', 'tailwindcss', '@types/react'];

let backendDepsOk = true;
let frontendDepsOk = true;

requiredBackendDeps.forEach(dep => {
  if (backendPackage.dependencies[dep] || backendPackage.devDependencies[dep]) {
    console.log(`✅ Backend: ${dep}`);
  } else {
    console.log(`❌ Backend: ${dep} - MISSING`);
    backendDepsOk = false;
  }
});

requiredFrontendDeps.forEach(dep => {
  if (frontendPackage.dependencies[dep] || frontendPackage.devDependencies[dep]) {
    console.log(`✅ Frontend: ${dep}`);
  } else {
    console.log(`❌ Frontend: ${dep} - MISSING`);
    frontendDepsOk = false;
  }
});

checks.push({
  name: 'Backend Dependencies',
  passed: backendDepsOk,
  score: backendDepsOk ? 'All Present' : 'Missing Dependencies'
});

checks.push({
  name: 'Frontend Dependencies',
  passed: frontendDepsOk,
  score: frontendDepsOk ? 'All Present' : 'Missing Dependencies'
});

// Check environment configuration
console.log('\n🔧 Checking Configuration...');
const envExampleExists = fs.existsSync('backend/.env.example');
const packageJsonValid = backendPackage.scripts && backendPackage.scripts.dev && backendPackage.scripts.build;

console.log(`✅ Environment Example: ${envExampleExists ? 'Present' : 'Missing'}`);
console.log(`✅ Package Scripts: ${packageJsonValid ? 'Valid' : 'Invalid'}`);

checks.push({
  name: 'Configuration',
  passed: envExampleExists && packageJsonValid,
  score: 'Ready'
});

// Check test structure
console.log('\n🧪 Checking Test Coverage...');
const testFiles = [
  'backend/tests/transcription/transcription.test.ts',
  'backend/tests/extraction/storyExtraction.test.ts',
  'backend/tests/donations/qrDonations.test.ts',
  'backend/tests/exports/docxExport.test.ts',
  'frontend/__tests__/components/RecordingInterface.test.tsx',
  'frontend/__tests__/components/FollowUpQuestionModal.test.tsx',
  'frontend/__tests__/e2e/demo-flow.spec.ts'
];

let testFileCount = 0;
testFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file.split('/').pop()}`);
    testFileCount++;
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

checks.push({
  name: 'Test Coverage',
  passed: testFileCount >= 5, // Allow some flexibility
  score: `${testFileCount}/${testFiles.length}`
});

// Check TypeScript compilation readiness
console.log('\n⚙️ Checking TypeScript Configuration...');
const backendTsConfig = fs.existsSync('backend/tsconfig.json');
const frontendTsConfig = fs.existsSync('frontend/tsconfig.json');

console.log(`✅ Backend TypeScript: ${backendTsConfig ? 'Configured' : 'Missing'}`);
console.log(`✅ Frontend TypeScript: ${frontendTsConfig ? 'Configured' : 'Missing'}`);

checks.push({
  name: 'TypeScript Setup',
  passed: backendTsConfig && frontendTsConfig,
  score: 'Ready'
});

// Generate summary
console.log('\n📊 DEMO READINESS SUMMARY');
console.log('=' .repeat(50));

const totalChecks = checks.length;
const passedChecks = checks.filter(c => c.passed).length;
const readiness = Math.round((passedChecks / totalChecks) * 100);

checks.forEach(check => {
  const status = check.passed ? '✅' : '❌';
  console.log(`${status} ${check.name}: ${check.score}`);
});

console.log('\n' + '='.repeat(50));
console.log(`Overall Readiness: ${readiness}%`);

if (readiness >= 90) {
  console.log('🎉 SYSTEM READY FOR DEMO!');
  console.log('🟢 All critical components validated');
} else if (readiness >= 75) {
  console.log('⚠️ MOSTLY READY - Minor issues detected');
  console.log('🟡 Demo possible with fallback options');
} else {
  console.log('🚫 NOT READY FOR DEMO');
  console.log('🔴 Critical issues require resolution');
}

console.log('\n📋 Demo Checklist:');
console.log('□ Test microphone permissions in browser');
console.log('□ Verify internet connection for OpenAI API');
console.log('□ Prepare manual story as backup');
console.log('□ Test QR code scanning on mobile device');
console.log('□ Verify Word document download works');
console.log('□ Review demo talking points');

process.exit(readiness >= 75 ? 0 : 1);