// types/license.types.ts

export interface License {
  _id: string;
  name: string;
  price: number;
  durationInDays: number;
  userLimit: number;
  isActive: boolean;
  features: {
    companies: boolean;
    supplier: boolean;
    purchase: boolean;
    reports: boolean;
    apiAccess: boolean;
  };
}

export interface LicenseFormState {
  name: string;
  price: number;
  durationInDays: number;
  userLimit: number;
  features: License["features"];
}