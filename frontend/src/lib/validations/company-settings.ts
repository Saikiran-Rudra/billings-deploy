import { z } from 'zod';
import { gstStatusOptions } from '@/lib/validations/company';

/**
 * Company Settings Validations
 * References the same patterns as onboarding validations
 */

// Company Overview - Business Information (ALL MANDATORY)
export const companyDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Company name is required')
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must not exceed 100 characters'),
  businessInfo: z.object({
    businessType: z
      .string()
      .min(1, 'Business type is mandatory'),
    industry: z
      .string()
      .min(1, 'Industry is mandatory'),
    businessAddress: z
      .string()
      .trim()
      .min(1, 'Business address is mandatory')
      .min(10, 'Address must be at least 10 characters')
      .max(500, 'Address must not exceed 500 characters'),
  }),
});

// Tax Information (CONDITIONAL MANDATORY - same as onboarding)
export const taxInfoSchema = z
  .object({
    taxInfo: z.object({
      gstStatus: z.enum(gstStatusOptions),
      gstNumber: z.string().trim(),
      panNumber: z
        .string()
        .trim()
        .min(1, 'PAN number is mandatory')
        .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN format (e.g., ABCDE1234F)'),
      gstDocumentUrl: z.string().trim().optional(),
      panDocumentUrl: z
        .string()
        .trim()
        .min(1, 'PAN document is mandatory'),
      financialYearStart: z
        .string()
        .min(1, 'Financial year start is mandatory'),
    }),
  })
  .refine(
    (data) => {
      if (data.taxInfo.gstStatus === 'YES') {
        return data.taxInfo.gstNumber.length > 0;
      }

      return true;
    },
    {
      message: 'GST number is mandatory when GST is enabled',
      path: ['taxInfo', 'gstNumber'],
    }
  )
  .refine(
    (data) => {
      if (data.taxInfo.gstStatus === 'YES') {
        return /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z0-9]$/.test(data.taxInfo.gstNumber);
      }

      return true;
    },
    {
      message: 'Valid GSTIN format is required (e.g., 22ABCDE1234F1Z5)',
      path: ['taxInfo', 'gstNumber'],
    }
  )
  .refine(
    (data) => {
      if (data.taxInfo.gstStatus === 'YES') {
        return Boolean(data.taxInfo.gstDocumentUrl);
      }

      return true;
    },
    {
      message: 'GST document is mandatory when GST is enabled',
      path: ['taxInfo', 'gstDocumentUrl'],
    }
  );

// Bank Details (OPTIONAL - but if provided, must be valid)
export const bankDetailsSchema = z.object({
  bankInfo: z.object({
    bankName: z
      .string()
      .min(1, 'Bank name is mandatory'),
    accountHolder: z
      .string()
      .trim()
      .min(1, 'Account holder name is mandatory')
      .min(2, 'Account holder name must be at least 2 characters'),
    accountNumber: z
      .string()
      .trim()
      .min(1, 'Account number is mandatory')
      .regex(/^\d{9,18}$/, 'Account number must be 9-18 digits'),
    ifscCode: z
      .string()
      .trim()
      .min(1, 'IFSC code is mandatory')
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format (e.g., SBIN0001234)'),
    branchName: z
      .string()
      .trim()
      .min(1, 'Branch name is mandatory')
      .min(2, 'Branch name must be at least 2 characters'),
  }),
});

export type CompanyDetailsInput = z.infer<typeof companyDetailsSchema>;
export type TaxInfoInput = z.infer<typeof taxInfoSchema>;
export type BankDetailsInput = z.infer<typeof bankDetailsSchema>;
