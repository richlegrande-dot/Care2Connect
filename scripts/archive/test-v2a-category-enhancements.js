// Test v2a category enhancements on specific failing cases
const CategoryEnhancements = require('./backend/src/services/CategoryEnhancements_v2a.js');

console.log('Testing V2a Category Enhancements:\n');

// Test HARD_004: TRANSPORTATION fix
const hard004Text = "My name is Jennifer Wu. I'm 32 years old, make $45,000 a year, have 2 kids aged 5 and 8, and need $1,200 for emergency car repairs so I can get to work.";
const hard004BaseResult = { category: 'EMERGENCY', confidence: 0.7, reasons: ['emergency_keyword'] }; // Simulated misclassification
console.log('HARD_004 (TRANSPORTATION fix):');
console.log('  Base classification: EMERGENCY');
console.log('  Expected: TRANSPORTATION');
const hard004Enhanced = CategoryEnhancements.enhanceCategory(hard004Text, hard004BaseResult);
console.log('  Enhanced result:', hard004Enhanced);
console.log('  Correct?', hard004Enhanced.category === 'TRANSPORTATION' ? '✅ FIXED' : '❌ NOT FIXED');
console.log();

// Test HARD_009: UTILITIES fix
const hard009Text = "My name is Carlos Rivera. I'm 28, have $12,000 in student loans, $3,500 in credit card debt, and need $600 to pay my electric bill before they shut off my power tomorrow.";
const hard009BaseResult = { category: 'OTHER', confidence: 0.4, reasons: [] }; // Simulated misclassification
console.log('HARD_009 (UTILITIES fix):');
console.log('  Base classification: OTHER');
console.log('  Expected: UTILITIES');
const hard009Enhanced = CategoryEnhancements.enhanceCategory(hard009Text, hard009BaseResult);
console.log('  Enhanced result:', hard009Enhanced);
console.log('  Correct?', hard009Enhanced.category === 'UTILITIES' ? '✅ FIXED' : '❌ NOT FIXED');
console.log();

// Test no enhancement case (should pass through)
const normalText = "My name is John Smith. I need help with rent which is $1200.";
const normalBaseResult = { category: 'HOUSING', confidence: 0.8, reasons: ['rent_keyword'] };
console.log('Normal case (should pass through):');
console.log('  Base classification: HOUSING');
const normalEnhanced = CategoryEnhancements.enhanceCategory(normalText, normalBaseResult);
console.log('  Enhanced result:', normalEnhanced);
console.log('  Correct?', !normalEnhanced.enhanced ? '✅ UNCHANGED' : '❌ INCORRECTLY CHANGED');
console.log();

// Test MEDICAL→HEALTHCARE mapping
const medicalText = "I need help with medical bills from surgery.";
const medicalBaseResult = { category: 'MEDICAL', confidence: 0.8, reasons: ['medical_keyword'] };
console.log('MEDICAL→HEALTHCARE mapping:');
console.log('  Base classification: MEDICAL');
console.log('  Expected: HEALTHCARE');
const medicalEnhanced = CategoryEnhancements.enhanceCategory(medicalText, medicalBaseResult);
console.log('  Enhanced result:', medicalEnhanced);
console.log('  Correct?', medicalEnhanced.category === 'HEALTHCARE' ? '✅ MAPPED' : '❌ NOT MAPPED');