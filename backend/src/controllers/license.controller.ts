import { Request, Response } from "express";

import * as licenseService from "../services/license.service.js";
import * as companyLicenseService from "../services/ompanyLicense.service.js";

import { validate } from "../validators/validate.js";
import {
  createLicenseSchema,
  assignLicenseSchema
} from "../validators/license.validator.js";

import { validateObjectId } from "../utils/validation.js";

/**
 * 🧾 Create License
 */
export const createLicenseController = async (req: Request, res: Response) => {
  const payload = validate(createLicenseSchema, req.body);

  const data = await licenseService.createLicense(payload);

  res.status(201).json({
    success: true,
    message: "License created successfully",
    data
  });
};

/**
 * 📋 Get All Licenses
 */
export const getLicensesController = async (_req: Request, res: Response) => {
  const data = await licenseService.getLicenses();

  res.json({
    success: true,
    data
  });
};

/**
 * 🔗 Assign License to Company
 */
export const assignLicenseController = async (req: Request, res: Response) => {
  const payload = validate(assignLicenseSchema, req.body);

  const companyId = validateObjectId(payload.companyId, "Company ID");
  const licenseId = validateObjectId(payload.licenseId, "License ID");

  const data = await companyLicenseService.assignLicenseToCompany(
    companyId,
    licenseId
  );

  res.json({
    success: true,
    message: "License assigned successfully",
    data
  });
};

/**
 * 📊 Get Company Current Plan
 */
export const getCompanyPlanController = async (req: Request, res: Response) => {
  const companyId = validateObjectId(
    req.params.companyId,
    "Company ID"
  );

  const data = await companyLicenseService.getCompanyLicense(companyId);

  res.json({
    success: true,
    data
  });
};