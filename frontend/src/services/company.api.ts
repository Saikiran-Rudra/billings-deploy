import { api } from "@/lib/api-client";
import { Company, CompanyFormData, CompanyUpdateFormData } from "@/lib/validations/company";

interface CompaniesListResponse {
  success: boolean;
  data: Company[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface CompanyResponse {
  success: boolean;
  data: Company;
}

/**
 * Get all companies (Super Admin only)
 */
export const getAllCompanies = async (
  page?: number,
  limit?: number,
  search?: string
): Promise<CompaniesListResponse> => {
  try {
    const query = new URLSearchParams();
    if (page) query.append("page", page.toString());
    if (limit) query.append("limit", limit.toString());
    if (search) query.append("search", search);

    const response = await api.get<CompaniesListResponse>(
      `/admin/companies?${query.toString()}`
    );

    return response;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
};

/**
 * Get company by ID
 */
export const getCompanyById = async (id: string): Promise<Company> => {
  try {
    const response = await api.get<CompanyResponse>(`/admin/companies/${id}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error("Invalid response from get company endpoint");
  } catch (error) {
    console.error("Error fetching company:", error);
    throw error;
  }
};

/**
 * Create new company
 */
export const createCompany = async (
  company: CompanyFormData
): Promise<Company> => {
  try {
    const response = await api.post<CompanyResponse>(
      "/admin/companies",
      company
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error("Invalid response from create company endpoint");
  } catch (error) {
    console.error("Error creating company:", error);
    throw error;
  }
};

/**
 * Update company by ID
 */
export const updateCompany = async (
  id: string,
  company: Partial<CompanyUpdateFormData>
): Promise<Company> => {
  try {
    const response = await api.put<CompanyResponse>(
      `/admin/companies/${id}`,
      company
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error("Invalid response from update company endpoint");
  } catch (error) {
    console.error("Error updating company:", error);
    throw error;
  }
};

/**
 * Update company status
 */
export const updateCompanyStatus = async (
  id: string,
  status: "active" | "inactive"
): Promise<Company> => {
  try {
    const response = await api.patch<CompanyResponse>(
      `/admin/companies/${id}/status`,
      { status }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error("Invalid response from update status endpoint");
  } catch (error) {
    console.error("Error updating company status:", error);
    throw error;
  }
};
