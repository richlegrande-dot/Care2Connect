// Debug the consonant check
const name = 'Robert Chen';
console.log('Testing consonant check on:', name);

const nameWithoutSpaces = name.replace(/\s/g, '');
console.log('Name without spaces:', nameWithoutSpaces);

const consonantPattern = /[^aeiou]{4,}/i;
console.log('Consonant pattern:', consonantPattern);
console.log('Pattern test:', consonantPattern.test(nameWithoutSpaces));

// Find the matches
const matches = nameWithoutSpaces.match(/[^aeiou]+/gi);
console.log('All consonant sequences:', matches);

// Check each sequence length
if (matches) {
  matches.forEach((seq, i) => {
    console.log(`Sequence ${i + 1}: "${seq}" (length: ${seq.length})`);
  });
}