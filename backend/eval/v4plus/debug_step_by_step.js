// Debug the pattern matching step by step
const text = 'My name is Robert Chen and I need help finishing my certification program.';

console.log('Testing pattern matching step by step:');
console.log('Text:', text);
console.log('');

// Test the specific pattern
const pattern = /(?:my name is)\s+(?:like,?\s+)?([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\b/gi;

console.log('Pattern:', pattern.toString());
console.log('');

let match;
while ((match = pattern.exec(text)) !== null) {
    console.log('Found match:');
    console.log('Full match:', match[0]);
    console.log('Captured group:', match[1]);
    console.log('Index:', match.index);
    
    // Test validation
    const rawName = match[1].trim();
    console.log('Raw name:', rawName);
    
    // Basic validation checks
    const lengthOk = rawName.length >= 2 && rawName.length <= 50;
    const formatOk = /^[A-Za-z\s'-]+$/.test(rawName);
    const startsWithCap = /^[A-Z]/.test(rawName);
    
    console.log('Length OK:', lengthOk);
    console.log('Format OK:', formatOk);
    console.log('Starts with capital:', startsWithCap);
    
    // Blacklist check (simple version)
    const nameBlacklist = new Set([
        'help', 'need', 'want', 'have', 'call', 'this', 'that', 'here', 'there',
        'assistance', 'support', 'problem', 'situation', 'calling', 'speaking'
    ]);
    const notBlacklisted = !nameBlacklist.has(rawName.toLowerCase());
    console.log('Not blacklisted:', notBlacklisted);
    
    console.log('');
}