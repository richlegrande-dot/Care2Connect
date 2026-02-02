/**
 * DOCX Text Extraction Helper
 * 
 * Provides utilities to extract and validate text content from DOCX buffers
 * for automated testing of document generation pipeline.
 */

import AdmZip from 'adm-zip';

export interface DocxContent {
  title?: string;
  bodyText: string;
  hasKeyPoints: boolean;
  hasQrPlaceholder: boolean;
  containsText: (text: string) => boolean;
  wordCount: number;
}

/**
 * Extract text content from DOCX buffer for testing
 * @param docxBuffer - The DOCX file buffer
 * @returns Extracted content structure
 */
export function extractDocxText(docxBuffer: Buffer): DocxContent {
  try {
    // Unzip DOCX (which is actually a ZIP file)
    const zip = new AdmZip(docxBuffer);
    
    // Read the main document XML
    const documentXmlEntry = zip.getEntry('word/document.xml');
    if (!documentXmlEntry) {
      throw new Error('Invalid DOCX: document.xml not found');
    }
    
    const documentXmlContent = documentXmlEntry.getData().toString('utf8');
    
    // Extract text from XML (simple regex approach for testing)
    // This removes XML tags and extracts text content
    const textContent = documentXmlContent
      .replace(/<[^>]*>/g, ' ')  // Remove XML tags
      .replace(/\s+/g, ' ')      // Normalize whitespace
      .trim();
    
    // Look for common patterns
    const hasTitle = /GoFundMe|Campaign|Draft|Help/i.test(textContent);
    const hasKeyPoints = /key points|important|bullets|•/i.test(textContent);
    const hasQrPlaceholder = /qr.code|scan.to|donate|payment/i.test(textContent);
    
    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
    
    return {
      title: hasTitle ? extractTitle(textContent) : undefined,
      bodyText: textContent,
      hasKeyPoints,
      hasQrPlaceholder,
      containsText: (searchText: string) => 
        textContent.toLowerCase().includes(searchText.toLowerCase()),
      wordCount
    };
    
  } catch (error) {
    throw new Error(`Failed to extract DOCX content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate DOCX buffer is a valid ZIP/DOCX structure
 */
export function isValidDocx(docxBuffer: Buffer): boolean {
  try {
    const zip = new AdmZip(docxBuffer);
    const entries = zip.getEntries();
    
    // Check for required DOCX files
    const requiredFiles = ['[Content_Types].xml', 'word/document.xml', '_rels/.rels'];
    
    return requiredFiles.every(required => 
      entries.some(entry => entry.entryName === required)
    );
  } catch {
    return false;
  }
}

/**
 * Extract title from document content (heuristic)
 */
function extractTitle(content: string): string | undefined {
  // Look for title patterns in first 200 characters
  const titleSection = content.substring(0, 200);
  
  const titlePatterns = [
    /GoFundMe Campaign Draft/i,
    /Help .+ with .+/i,
    /Support .+ Campaign/i
  ];
  
  for (const pattern of titlePatterns) {
    const match = titleSection.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  
  return undefined;
}

/**
 * Get DOCX file statistics for testing
 */
export function getDocxStats(docxBuffer: Buffer) {
  try {
    const zip = new AdmZip(docxBuffer);
    const entries = zip.getEntries();
    
    return {
      totalFiles: entries.length,
      size: docxBuffer.length,
      hasImages: entries.some(e => e.entryName.startsWith('word/media/')),
      hasDocument: entries.some(e => e.entryName === 'word/document.xml'),
      files: entries.map(e => e.entryName)
    };
  } catch (error) {
    throw new Error(`Failed to analyze DOCX structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}