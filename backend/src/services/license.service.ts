import { License } from "../models/license.model.js";
import { NotFoundError } from "../utils/AppError.js";

export const createLicense = async (payload: any) => {
  return await License.create(payload);
};

export const getLicenses = async () => {
  return await License.find().sort({ createdAt: -1 });
};

export const getLicenseById = async (id: string) => {
  const license = await License.findById(id);

  if (!license) throw new NotFoundError("License not found");

  return license;
};