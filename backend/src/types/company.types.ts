import { GstStatusValue } from "../constants/company.constants.js";

export interface CompanyDocumentInput {
  name: string;
  businessType: string;
  industry: string;
  address: string;
  financialYearStart: string;
  gstStatus: GstStatusValue;
  gstNumber?: string;
  gstDocumentUrl?: string;
  panNumber: string;
  panDocumentUrl: string;
}

export interface CompanyAdminInput {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
}

export interface CompanyCreateInput extends CompanyDocumentInput {
  admin: CompanyAdminInput;
}

export interface CompanyUpdateInput extends Partial<CompanyDocumentInput> {}

export interface CompanyListQuery {
  page?: number;
  limit?: number;
  search?: string;
}
