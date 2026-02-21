/**
 * DOCX Text Extraction Helper
 * 
 * Extracts plain text from DOCX buffer for test assertions
 */

import JSZip from 'jszip';

export interface DocxContent {
  text: string;
  wordCount: number;
  hasTitle: boolean;
  hasStory: boolean;
  sections: string[];
}

/**
 * Extract text content from DOCX buffer
 */
export async function extractDocxText(docxBuffer: Buffer): Promise<DocxContent> {
  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(docxBuffer);
    
    // Get main document XML
    const documentXml = await contents.file('word/document.xml')?.async('string');
    
    if (!documentXml) {
      throw new Error('Invalid DOCX: No document.xml found');
    }
    
    // Extract text from XML (simplified - gets text between w:t tags)
    const textMatches = documentXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    const extractedTexts = textMatches?.map(match => {
      const textContent = match.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '');
      return decodeXmlEntities(textContent);
    }) || [];
    
    const fullText = extractedTexts.join(' ');
    const wordCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
    
    // Basic content detection
    const lowerText = fullText.toLowerCase();
    const hasTitle = lowerText.includes('help') || lowerText.includes('assistance') || 
                    lowerText.includes('emergency') || lowerText.includes('need');
    const hasStory = fullText.length > 50; // Basic story presence check
    
    // Extract sections (look for common GoFundMe section headers)
    const sections = extractSections(fullText);
    
    return {
      text: fullText,
      wordCount,
      hasTitle,
      hasStory,
      sections
    };
    
  } catch (error) {
    throw new Error(`Failed to extract DOCX text: ${error.message}`);
  }
}

/**
 * Decode XML entities
 */
function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Extract sections from document text
 */
function extractSections(text: string): string[] {
  const sections: string[] = [];
  
  // Common section headers in GoFundMe documents
  const sectionHeaders = [
    'Campaign Title',
    'Story',
    'Goal Amount', 
    'Key Points',
    'Instructions',
    'Paste Map',
    'Contact Information'
  ];
  
  for (const header of sectionHeaders) {
    if (text.toLowerCase().includes(header.toLowerCase())) {
      sections.push(header);
    }
  }
  
  return sections;
}

/**
 * Validate DOCX has minimum required content
 */
export function validateDocxContent(content: DocxContent): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (content.wordCount < 10) {
    errors.push('Document has too few words (minimum 10)');
  }
  
  if (!content.hasTitle) {
    errors.push('Document appears to be missing a title');
  }
  
  if (!content.hasStory) {
    errors.push('Document appears to be missing story content');
  }
  
  if (content.text.length < 100) {
    errors.push('Document text is too short (minimum 100 characters)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Assert DOCX contains specific text (case-insensitive)
 */
export function assertDocxContains(content: DocxContent, expectedText: string): void {
  const lowerContent = content.text.toLowerCase();
  const lowerExpected = expectedText.toLowerCase();
  
  if (!lowerContent.includes(lowerExpected)) {
    throw new Error(`DOCX content does not contain expected text: "${expectedText}"`);
  }
}

/**
 * Assert DOCX does not contain specific text (case-insensitive)
 */
export function assertDocxDoesNotContain(content: DocxContent, forbiddenText: string): void {
  const lowerContent = content.text.toLowerCase();
  const lowerForbidden = forbiddenText.toLowerCase();
  
  if (lowerContent.includes(lowerForbidden)) {
    throw new Error(`DOCX content contains forbidden text: "${forbiddenText}"`);
  }
}
