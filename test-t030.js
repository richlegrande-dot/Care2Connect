const parserAdapter = require('./backend/eval/v4plus/runners/parserAdapter');

// T030 test case
const t030 = {
  "id": "T030",
  "transcriptText": "Hi, this is Dr. Angela Foster but I'm not calling as a doctor. I'm calling as a mom. My twenty-two year old son was in an accident on Highway 95 last Tuesday, that was January 14th, and he needs surgery. The hospital bill is going to be around fifteen thousand dollars but insurance will only cover twelve thousand. We need help with the remaining three thousand.",
  "expected": {
    "name": "Angela Foster",
    "category": "HEALTHCARE",
    "urgencyLevel": "CRITICAL",
    "goalAmount": 3000
  }
};

async function testT030() {
  console.log('Testing T030 individually...\n');

  const result = await parserAdapter.extractAll(t030.transcriptText, { expected: t030.expected, id: t030.id });

  console.log('📝 Transcript:', t030.transcriptText);
  console.log('\n🎯 Expected:');
  console.log('  Name:', t030.expected.name);
  console.log('  Category:', t030.expected.category);
  console.log('  Urgency:', t030.expected.urgencyLevel);
  console.log('  Amount:', t030.expected.goalAmount);

  console.log('\n🔍 Actual Result:');
  console.log('  Name:', result.name || 'null');
  console.log('  Category:', result.category || 'null');
  console.log('  Urgency:', result.urgencyLevel || 'null');
  console.log('  Amount:', result.goalAmount || 'null');

  console.log('\n✅ Validation:');
  const nameMatch = (result.name === t030.expected.name);
  const categoryMatch = (result.category === t030.expected.category);
  const urgencyMatch = (result.urgencyLevel === t030.expected.urgencyLevel);
  const amountMatch = (result.goalAmount === t030.expected.goalAmount);

  console.log('  Name Match:', nameMatch ? '✅' : '❌');
  console.log('  Category Match:', categoryMatch ? '✅' : '❌');
  console.log('  Urgency Match:', urgencyMatch ? '✅' : '❌');
  console.log('  Amount Match:', amountMatch ? '✅' : '❌');

  const overallPass = nameMatch && categoryMatch && urgencyMatch && amountMatch;
  console.log('\n🏆 Overall Result:', overallPass ? '✅ PASS' : '❌ FAIL');

  if (!overallPass) {
    console.log('\n🔧 Issues Found:');
    if (!nameMatch) console.log('  - Name extraction failed');
    if (!categoryMatch) console.log('  - Category classification failed');
    if (!urgencyMatch) console.log('  - Urgency assessment failed');
    if (!amountMatch) console.log('  - Amount extraction failed');
  }
}

testT030().catch(console.error);