/**
 * JSON Repair Utility
 * Attempts to repair malformed JSON output from AI models
 */

export class JsonRepairUtil {
  /**
   * Attempt to repair and parse JSON string
   */
  static repairAndParse(jsonString: string): any {
    try {
      // First try normal parsing
      return JSON.parse(jsonString);
    } catch (error) {
      console.log('JSON parsing failed, attempting repair...');
      
      // Try various repair strategies
      let repairedJson = jsonString;
      
      // Strategy 1: Fix common issues
      repairedJson = this.fixCommonIssues(repairedJson);
      
      try {
        return JSON.parse(repairedJson);
      } catch (error) {
        // Strategy 2: Extract JSON from markdown or other wrapping
        repairedJson = this.extractJsonFromMarkdown(jsonString);
        
        try {
          return JSON.parse(repairedJson);
        } catch (error) {
          // Strategy 3: Fix quotes and escaping
          repairedJson = this.fixQuotesAndEscaping(repairedJson);
          
          try {
            return JSON.parse(repairedJson);
          } catch (error) {
            console.error('All JSON repair strategies failed');
            throw new Error('Unable to repair JSON: ' + error);
          }
        }
      }
    }
  }

  /**
   * Fix common JSON formatting issues
   */
  private static fixCommonIssues(json: string): string {
    let fixed = json;
    
    // Remove BOM if present
    fixed = fixed.replace(/^\uFEFF/, '');
    
    // Trim whitespace
    fixed = fixed.trim();
    
    // Fix trailing commas
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix missing quotes around keys
    fixed = fixed.replace(/(\w+)(\s*:)/g, '"$1"$2');
    
    // Fix single quotes to double quotes
    fixed = fixed.replace(/'/g, '"');
    
    // Fix escaped quotes that shouldn't be escaped
    fixed = fixed.replace(/\\"/g, '"');
    
    return fixed;
  }

  /**
   * Extract JSON from markdown code blocks or other wrapping
   */
  private static extractJsonFromMarkdown(text: string): string {
    // Look for JSON in code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);
    if (codeBlockMatch) {
      return codeBlockMatch[1];
    }
    
    // Look for JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    
    return text;
  }

  /**
   * Fix quote and escaping issues
   */
  private static fixQuotesAndEscaping(json: string): string {
    let fixed = json;
    
    // Fix unescaped quotes in string values
    fixed = fixed.replace(/"([^"]*)":\s*"([^"]*)"/g, (match, key, value) => {
      // Escape any quotes within the value
      const escapedValue = value.replace(/(?<!\\)"/g, '\\"');
      return `"${key}": "${escapedValue}"`;
    });
    
    // Fix missing closing brackets/braces
    let openBraces = 0;
    let openBrackets = 0;
    
    for (let i = 0; i < fixed.length; i++) {
      if (fixed[i] === '{') openBraces++;
      if (fixed[i] === '}') openBraces--;
      if (fixed[i] === '[') openBrackets++;
      if (fixed[i] === ']') openBrackets--;
    }
    
    // Add missing closing braces/brackets
    while (openBraces > 0) {
      fixed += '}';
      openBraces--;
    }
    while (openBrackets > 0) {
      fixed += ']';
      openBrackets--;
    }
    
    return fixed;
  }

  /**
   * Validate that repaired JSON has required structure
   */
  static validateStructure(obj: any, requiredFields: string[]): boolean {
    if (!obj || typeof obj !== 'object') {
      return false;
    }
    
    // Check if at least some required fields are present
    const presentFields = requiredFields.filter(field => 
      obj.hasOwnProperty(field) || obj[field] !== undefined
    );
    
    // Consider valid if at least 50% of required fields are present
    return presentFields.length >= Math.ceil(requiredFields.length * 0.5);
  }
}

export default JsonRepairUtil;