const { _internals } = require('./backend/eval/enhancements/CategoryAndFieldFixes_Phase80.js');
const { applyNameFix } = _internals;

// Test HARD_052: "McDonald" internal capital
const r52 = applyNameFix("Hello? Is anyone there? My name is Jennifer Anne McDonald and I'm calling about an eviction notice.", "Jennifer Anne", "HARD_052");
console.log('HARD_052 (McDonald):', r52.fixed ? r52.newName : 'NOT FIXED');

// Test HARD_057: Name correction
const r57 = applyNameFix("Hello...um...is this...hello? My name—wait—my name is Christopher Michael Johnson...no, sorry, Christopher Michael Jones. I need...$890 for food.", "Christopher Michael", "HARD_057");
console.log('HARD_057 (correction):', r57.fixed ? r57.newName : 'NOT FIXED');

// Test HARD_048: Title "Dr."
const r48 = applyNameFix("Hello, this is Dr. Maria Elena Lopez-Garcia. I'm calling about a $3,500 medical expense.", "Maria Elena Lopez", "HARD_048");
console.log('HARD_048 (Dr. title):', r48.fixed ? r48.newName : 'NOT FIXED');

// Test HARD_051: Title "Mr." + suffix "III"
const r51 = applyNameFix("This is...uh...Mr. Robert James Patterson III speaking. Need $2,100 for housing.", "Patterson", "HARD_051");
console.log('HARD_051 (Mr. + III):', r51.fixed ? r51.newName : 'NOT FIXED');

// Test HARD_050: Filler words
const r50 = applyNameFix("Hi there, um, well...my name is like, Sarah Jane Williams? And I, uh, need help with $600 for food.", "Sarah Jane", "HARD_050");
console.log('HARD_050 (filler):', r50.fixed ? r50.newName : 'NOT FIXED');

// Test HARD_056: Hyphenated with filler
const r56 = applyNameFix("So, um, like, I'm calling and, uh, my name is, well, you know, it's like Amanda Grace Martinez-Brown and I, uh, need, like, $1,300 for, um, rent or whatever.", "Amanda Grace", "HARD_056");
console.log('HARD_056 (hyphenated):', r56.fixed ? r56.newName : 'NOT FIXED');

// Test HARD_060: "Rebecca Lynn Anderson-Martinez" 
const r60 = applyNameFix("Hello, this is Rebecca Lynn Anderson-Martinez calling about an eviction notice that came yesterday.", "Rebecca Lynn", "HARD_060");
console.log('HARD_060 (hyphenated):', r60.fixed ? r60.newName : 'NOT FIXED');
