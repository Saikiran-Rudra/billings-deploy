interface SKUGenerationResponse {
  sku: string;
  categoryCode: string;
  format: string;
}

interface SKUGenerationRequest {
  productType: "goods" | "service";
  categoryName: string;
}

/**
 * Generate category code from category name
 * Example: "Electronics" -> "ELEC"
 */
export const generateCategoryCode = (categoryName: string): string => {
  if (!categoryName) return "MISC";
  const cleaned = categoryName.replace(/\s+/g, "").toUpperCase();
  return cleaned.substring(0, 4);
};

/**
 * Format generated SKU with padding
 */
export const formatGeneratedSKU = (typeCode: string, categoryCode: string, sequence: number): string => {
  const paddedSequence = String(sequence).padStart(4, "0");
  return `PRD-${typeCode}-${categoryCode}-${paddedSequence}`;
};

/**
 * Fetch generated SKU from API
 */
export const fetchGeneratedSKU = async (
  productType: "goods" | "service",
  categoryName: string,
  apiClient: any
): Promise<SKUGenerationResponse> => {
  try {
    const response = await apiClient.post("/products/generate-sku", {
      productType,
      categoryName,
    });
    return response as SKUGenerationResponse;
  } catch (error) {
    throw error;
  }
};
