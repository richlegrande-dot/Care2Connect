// Test the validation logic of the enhanced extractor
console.log('=== Validation Debug ===');

const name = 'Robert Chen';
console.log('Testing name:', name);

// Basic validation checks that would be in validateName()
const lengthOk = name.length >= 2 && name.length <= 50;
const formatOk = /^[A-Za-z\s'-]+$/.test(name);
const startsWithCap = /^[A-Z]/.test(name);

console.log('Length OK (2-50):', lengthOk, `(${name.length} chars)`);
console.log('Format OK (letters, spaces, apostrophes, hyphens):', formatOk);
console.log('Starts with capital:', startsWithCap);

// Check blacklist
const nameBlacklist = new Set([
    'help', 'need', 'want', 'have', 'call', 'this', 'that', 'here', 'there',
    'assistance', 'support', 'problem', 'situation', 'calling', 'speaking',
    'dr', 'doctor', 'mr', 'mrs', 'ms', 'miss', 'professor', 'officer',
    'urgent', 'emergency', 'crisis', 'an emergency', 'very urgent'
]);
const notBlacklisted = !nameBlacklist.has(name.toLowerCase());
console.log('Not blacklisted:', notBlacklisted);

// Check for filler words
const notFiller = !/^(um|uh|er|ah|well|so|very|really|so|quite|like|you know|sort of|kind of|i mean|you see)$/i.test(name);
console.log('Not filler:', notFiller);

// Check for too many consecutive consonants
const noTooManyConsonants = !/[^aeiou]{4,}/i.test(name.replace(/\s/g, ''));
console.log('No too many consonants:', noTooManyConsonants);

console.log('');
console.log('Overall validation should pass:', lengthOk && formatOk && startsWithCap && notBlacklisted && notFiller && noTooManyConsonants);