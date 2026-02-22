const transcript = "Hi, this is Dr. Angela Foster but I'm not calling as a doctor. I'm calling as a mom. My twenty-two year old son was in an accident on Highway 95 last Tuesday, that was January 14th, and he needs surgery. The hospital bill is going to be around fifteen thousand dollars but insurance will only cover twelve thousand. We need help with the remaining three thousand.";

const namePattern = /(?:my name is|i'm|this is|i am)\s+(?:like,?\s+)?([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)*)\b/i;
const match = transcript.match(namePattern);
console.log('Transcript:', transcript.substring(0, 100) + '...');
console.log('Name match:', match);
if (match) {
  let name = match[1];
  name = name.replace(/^(dr|doctor|mrs?|ms|mr|miss|rev|reverend|jr|sr|iii|ii|iv)\.?\s+/i, '');
  console.log('Extracted name:', name);
}