const amountPatterns = [
  /\$\d+(?:,\d{3})*(?:\.\d{2})?/g,
  /\d+(?:,\d{3})*(?:\.\d{2})?\s*dollars?/gi,
  /\b\d+\s*hundred\b/gi,
  /\b\d+\s*thousand\b/gi,
  /\b\d+\s*million\b/gi,
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s*hundred\b/gi,
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s*thousand\b/gi,
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s*hundred\s*(?:and\s*)?\d+\b/gi,
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s*thousand\s*(?:and\s*)?\d+\b/gi,
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\b/gi,
  /\b(?:eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)\b/gi,
  /\b(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:\s*-?\s*\d+)?\b/gi,
  /\b\d+\s*to\s*\d+\b/gi,
  /\b\d+\s*-\s*\d+\b/gi,
  /\b\d+\s*and\s*\d+\b/gi
];

function extractAmount(transcript) {
  const foundAmounts = [];

  // Find all amounts using patterns
  for (const pattern of amountPatterns) {
    let matches;
    if (pattern.global) {
      matches = [...transcript.matchAll(pattern)];
    } else {
      const match = transcript.match(pattern);
      matches = match ? [match] : [];
    }

    for (const match of matches) {
      const extractedSource = match[0];
      let extractedValue = null;

      // Convert to number
      const cleanAmount = extractedSource.replace(/[^\d.,]/g, '');
      if (cleanAmount.includes(',')) {
        extractedValue = parseFloat(cleanAmount.replace(/,/g, ''));
      } else {
        extractedValue = parseFloat(cleanAmount);
      }

      if (!isNaN(extractedValue) && extractedValue > 0) {
        foundAmounts.push({
          value: extractedValue,
          source: extractedSource,
          confidence: 0.9,
          type: typeof extractedValue === 'number' && extractedValue === Math.floor(extractedValue) ? 'written' : 'numeric'
        });
      }
    }
  }

  console.log(`Found ${foundAmounts.length} raw amounts:`, foundAmounts.map(a => `${a.value} (${a.source})`));

  // Deduplication
  const deduplicatedAmounts = [];
  for (const amt of foundAmounts) {
    const amtSource = amt.source.toLowerCase().trim();
    const amtIndex = transcript.toLowerCase().indexOf(amtSource);

    let isOverlapping = false;
    for (let i = 0; i < deduplicatedAmounts.length; i++) {
      const existingSource = deduplicatedAmounts[i].source.toLowerCase().trim();
      const existingIndex = transcript.toLowerCase().indexOf(existingSource);

      if (amtIndex < existingIndex + existingSource.length && amtIndex + amtSource.length > existingIndex) {
        isOverlapping = true;
        if (amtSource.length > existingSource.length) {
          deduplicatedAmounts[i] = amt;
        }
        break;
      }
    }

    if (!isOverlapping) {
      deduplicatedAmounts.push(amt);
    }
  }

  console.log(`After deduplication: ${deduplicatedAmounts.length} amounts:`, deduplicatedAmounts.map(a => `${a.value} (${a.source})`));

  // Validation
  const validAmounts = deduplicatedAmounts.filter(amt => {
    if (!amt || !amt.source) return false;

    const numericMatch = amt.source.match(/\$?([0-9,]+(?:\.\d{2})?)/);
    const numericValue = numericMatch ? numericMatch[1] : amt.source.replace(/[^\d,]/g, '');

    let sourceIndex = transcript.toLowerCase().indexOf(amt.source.toLowerCase());
    let actualSourceLength = amt.source.length;

    if (sourceIndex === -1) {
      const cleanSource = amt.source.toLowerCase().replace(/[.,!?;:]$/, '');
      sourceIndex = transcript.toLowerCase().indexOf(cleanSource);
      actualSourceLength = cleanSource.length;
    }

    if (sourceIndex === -1) {
      console.log(`Index not found for ${amt.value} (${amt.source})`);
      return false;
    }

    const contextBefore = transcript.substring(Math.max(0, sourceIndex - 20), sourceIndex).trim();
    const contextAfter = transcript.substring(sourceIndex + actualSourceLength, sourceIndex + actualSourceLength + 20).trim();

    console.log(`Validating ${amt.value} (${amt.source}) - before: "${contextBefore}" after: "${contextAfter}"`);

    // Age filter
    if (amt.value < 150) {
      if (contextBefore.match(/\b(age|aged|years?\s+old|\d+\s*y\.?o\.?)/) ||
          contextAfter.match(/\b(years?\s+old|y\.?o\.?|age|aged)/) ||
          /\b(I'm|I am|he's|she's|they're)\s+\d+/.test(contextBefore + ' ' + amt.source + ' ' + contextAfter)) {
        console.log(`  ❌ Filtered: Age context`);
        return false;
      }
    }

    // Phone/address filter
    if (/^\d+$/.test(numericValue.replace(/[,\s$]/g, ''))) {
      const isPhoneNumber = /\d{3}[-.]?\d{3}[-.]?\d{4}/.test(numericValue);
      const hasAddressBefore = contextBefore.match(/\b(?:phone|dial|number|contact|street|avenue|road)\b/);
      const hasAddressAfter = contextAfter.match(/\b(?:phone|extension|area code)\b/);
      const isZipCode = /\d{5}(-\d{4})?/.test(numericValue);

      if (isPhoneNumber || hasAddressBefore || hasAddressAfter || isZipCode) {
        console.log(`  ❌ Filtered: Phone/address context`);
        return false;
      }
    }

    // Date filter
    if (/\b(19|20)\d{2}\b/.test(numericValue)) {
      if (contextBefore.match(/\b(year|date|born|birthday|january|february|march|april|may|june|july|august|september|october|november|december)/) ||
          contextAfter.match(/\b(year|date|birthday|january|february|march|april|may|june|july|august|september|october|november|december)/)) {
        console.log(`  ❌ Filtered: Date context`);
        return false;
      }
    }

    // Measurement filter
    if (contextAfter.match(/\b(pounds?|lbs?|feet|ft|inches?|miles?|degrees?)$/)) {
      console.log(`  ❌ Filtered: Measurement context`);
      return false;
    }

    // Time filter
    if (contextAfter.match(/\b(pm|am|o'?clock|hours?|minutes?)$/)) {
      console.log(`  ❌ Filtered: Time context`);
      return false;
    }

    // Wage filter
    if ((contextBefore.includes('make') || contextBefore.includes('earn') || contextBefore.includes('paid')) &&
        (contextBefore.includes('hour') || contextAfter.includes('per hour') || contextAfter.includes('hourly') || contextAfter.includes('weekly'))) {
      console.log(`  ❌ Filtered: Wage context`);
      return false;
    }

    // Medical allow
    const medicalTerms = ['medical', 'expense', 'health', 'doctor', 'hospital', 'surgery', 'treatment', 'medication', 'healthcare', 'clinic', 'emergency', 'urgent care'];
    const hasMedicalContext = medicalTerms.some(term =>
      contextAfter.toLowerCase().includes(term) ||
      contextBefore.toLowerCase().includes(term) ||
      amt.source.toLowerCase().includes(term)
    );
    if (hasMedicalContext) {
      console.log(`  ✅ Allowed: Medical context`);
      return true;
    }

    console.log(`  ✅ Passed validation`);
    return true;
  });

  console.log(`After validation: ${validAmounts.length} amounts:`, validAmounts.map(a => `${a.value} (${a.source})`));

  // Simple scoring (simplified version)
  if (validAmounts.length > 0) {
    const goalIndicators = [
      { pattern: /(?:need|require|want|asking\s+(?:for|to\s+raise)|goal\s+is|trying\s+to\s+raise|fundraising\s+(?:for|goal)).*?\$?\d+|\$?\d+.*?(?:need|require|want|asking\s+(?:for|to\s+raise)|goal\s+is|trying\s+to\s+raise|fundraising\s+(?:for|goal))/gi, score: 15 },
      { pattern: /(?:cost|total|bill|owe|debt|short).*?\$?\d+|\$?\d+.*?(?:cost|total|bill|owe|debt|short)/gi, score: 14 },
      { pattern: /(?:help|assistance|support).*?(?:with|for).*?\$?\d+|\$?\d+.*?(?:help|assistance|support).*?(?:with|for)/gi, score: 13 },
    ];

    let bestAmount = null;
    let bestScore = 0;

    for (const amt of validAmounts) {
      let totalScore = 0;
      const amtSource = amt.source.toLowerCase().trim();
      const amtIndex = transcript.toLowerCase().indexOf(amtSource);

      if (amtIndex === -1) continue;

      const extendedContext = transcript.substring(
        Math.max(0, amtIndex - 50),
        Math.min(transcript.length, amtIndex + amtSource.length + 50)
      ).toLowerCase();

      for (const indicator of goalIndicators) {
        if (indicator.pattern.test(extendedContext)) {
          totalScore += indicator.score;
          console.log(`  ${amt.value}: +${indicator.score} points for goal indicator`);
        }
      }

      // Position bonus
      const positionRatio = amtIndex / transcript.length;
      if (positionRatio > 0.7) {
        totalScore += 2;
        console.log(`  ${amt.value}: +2 points for late position`);
      }

      // Uniqueness bonus
      const amountCount = validAmounts.filter(a => a.value === amt.value).length;
      if (amountCount === 1) {
        totalScore += 3;
        console.log(`  ${amt.value}: +3 points for uniqueness`);
      }

      // Range bonus
      if (amt.value >= 100 && amt.value <= 50000) {
        totalScore += 3;
        console.log(`  ${amt.value}: +3 points for goal range`);
      }

      console.log(`  ${amt.value} final score: ${totalScore}`);

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestAmount = amt;
      }
    }

    return bestAmount ? bestAmount.value : null;
  }

  return null;
}

// Test cases
const testCases = [
  'Hi, this is Olivia Brooks. I need help with housing, lost my job, and my daughter needs surgery. I\'m asking for $4,000 total.',
  'My name is Diana Thompson. I\'m fleeing abuse, need emergency medical care, and have nowhere to go. Asking for $2,800.',
  'Hello, this is Dr. Maria Elena Lopez-Garcia. I\'m calling about a $3,500 medical expense.'
];

testCases.forEach((text, i) => {
  console.log(`\n=== Test Case ${i+1} ===`);
  console.log(`Text: ${text}`);
  const result = extractAmount(text);
  console.log(`Result: ${result}`);
});