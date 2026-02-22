const testAmounts = ['$4,000', '$2,800', '$3,500'];

testAmounts.forEach(amt => {
  console.log(`Testing: ${amt}`);

  // Phone number check
  const isPhoneNumber = /\d{3}[-.]?\d{3}[-.]?\d{4}/.test(amt.replace(/[,\s$]/g, ''));
  console.log(`  Phone number: ${isPhoneNumber}`);

  // Zip code check
  const isZipCode = /\d{5}(-\d{4})?/.test(amt.replace(/[,\s$]/g, ''));
  console.log(`  Zip code: ${isZipCode}`);

  // Year check
  const isYear = /\b(19|20)\d{2}\b/.test(amt.replace(/[,\s$]/g, ''));
  console.log(`  Year: ${isYear}`);

  console.log('');
});