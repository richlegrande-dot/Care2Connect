const m = require('./backend/eval/enhancements/CategoryAndFieldFixes_Phase80.js');
const fix = m.applyPhase80Fixes;
const internals = m._internals;

// === DEBUG FUZZ INCOME SUPPRESSION ===
console.log('=== FUZZ INCOME SUPPRESSION ===');
const t330 = 'Hi, this is Jennifer Davis. I earn $1900 monthly\u2014. I\'m 32 years old!!. I earn $2800 monthly,,. Car broke down, so. need 950 for repairs, well';
const r330 = internals.applyIncomeSuppressionFix(t330, 2800, 'FUZZ_330');
console.log('FUZZ_330 income suppression:', JSON.stringify(r330));

const t486 = 'Hi, this is Jennifer Davis. I earn $3200 monthly;. Car broke!! down. I earn $2100 monthly. need 950 for repairs, I mean.';
const r486 = internals.applyIncomeSuppressionFix(t486, 2100, 'FUZZ_486');
console.log('FUZZ_486 income suppression:', JSON.stringify(r486));

// Full pipeline test
const full330 = fix(t330, 'TRANSPORTATION', 'Jennifer Davis', 2800, 'FUZZ_330');
console.log('FUZZ_330 full:', full330.amount, full330.fixes);
const full486 = fix(t486, 'TRANSPORTATION', 'Jennifer Davis', 2100, 'FUZZ_486');
console.log('FUZZ_486 full:', full486.amount, full486.fixes);

// === DEBUG HARD AMOUNT CASES ===
console.log('\n=== HARD AMOUNT - ASKING AMOUNT ===');
const h008 = 'Hello, this is Dr. Elizabeth Carter. I have 3 children, ages 6, 9, and 12. Tuition for the oldest is $4,200 per semester, but I need $1,500 for textbooks and supplies this semester.';
console.log('HARD_008: current=4200, expected=1500');
const r008 = internals.applyIncomeSuppressionFix(h008, 4200, 'HARD_008');
console.log('  income suppression:', JSON.stringify(r008));

const h010 = 'This is Amanda Lee speaking. My rent is $950, car payment $275, insurance $120, phone $85, and I need $450 for food assistance this month after losing my job.';
console.log('HARD_010: current=950, expected=450');
const r010 = internals.applyIncomeSuppressionFix(h010, 950, 'HARD_010');
console.log('  income suppression:', JSON.stringify(r010));

const h011 = "Hi, I'm James Wilson. Surgery costs $18,000 total, my deductible is $5,000, and I've saved $2,000. I need $3,000 more to meet the deductible.";
console.log('HARD_011: current=2000, expected=3000');

const h013 = "This is Kevin Zhang. I have 2 kids in daycare at $800 each, so $1,600 monthly. I'm 6 weeks behind, that's $2,400, but I need $1,600 to cover this month.";
console.log('HARD_013: current=2400, expected=1600');

const h024 = "This is Laura Bennett speaking. It's not a crisis or anything, just my power gets shut off in 2 days if I don't pay $450.";
console.log('HARD_024: current=2, expected=450');

// === DEBUG NAME CASES ===
console.log('\n=== NAME COMPLETENESS ===');
const n048 = "Hello, this is Dr. Maria Elena Lopez-Garcia. I'm calling about a $3,500 medical expense.";
console.log('HARD_048: current="Maria Elena Lopez", expected="Maria Elena Lopez-Garcia"');
const rn048 = internals.applyNameFix(n048, 'Maria Elena Lopez', 'HARD_048');
console.log('  name fix:', JSON.stringify(rn048));

const n050 = "Hi there, um, well...my name is like, Sarah Jane Williams? And I, uh, need help with $600 for food.";
console.log('HARD_050: current="Sarah Jane", expected="Sarah Jane Williams"');
const rn050 = internals.applyNameFix(n050, 'Sarah Jane', 'HARD_050');
console.log('  name fix:', JSON.stringify(rn050));

const n051 = "This is...uh...Mr. Robert James Patterson III speaking. Need $2,100 for housing.";
console.log('HARD_051: current="Patterson", expected="Robert James Patterson"');
const rn051 = internals.applyNameFix(n051, 'Patterson', 'HARD_051');
console.log('  name fix:', JSON.stringify(rn051));
