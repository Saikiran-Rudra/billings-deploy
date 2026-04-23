/**
 * SKU Generation Utility
 * Generates and suggests SKU based on config prefix and sequence
 */

export interface SKUSuggestion {
  suggested: string;
  prefix: string;
  sequence: number;
}

/**
 * Generate a suggested SKU from config
 */
export function generateSKUSuggestion(prefix: string, sequence: number): SKUSuggestion {
  const suggested = `${prefix}-${String(sequence).padStart(5, "0")}`;
  return {
    suggested,
    prefix,
    sequence,
  };
}

/**
 * Format SKU with prefix and sequence
 * Example: "PROD" + 1001 = "PROD-01001"
 */
export function formatSKU(prefix: string, sequence: number, padLength: number = 5): string {
  return `${prefix}-${String(sequence).padStart(padLength, "0")}`;
}

/**
 * Get the next sequence number from current SKU
 * Example: "PROD-01001" → 1002
 */
export function getNextSequence(sku: string, prefix: string): number | null {
  const pattern = new RegExp(`^${prefix}-(\d+)$`);
  const match = sku.match(pattern);
  
  if (!match) return null;
  
  const sequence = parseInt(match[1], 10);
  return isNaN(sequence) ? null : sequence + 1;
}
