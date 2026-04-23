import { CompanyLicense } from "../models/companyLicense.model.js";
import { License } from "../models/license.model.js";
import { NotFoundError, BadRequestError } from "../utils/AppError.js";

export const assignLicenseToCompany = async (
  companyId: string,
  licenseId: string
) => {
  const license = await License.findById(licenseId);

  if (!license) throw new NotFoundError("License not found");

  if (!license.isActive) {
    throw new BadRequestError("License is inactive");
  }

  const startDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(startDate.getDate() + license.durationInDays);

  await CompanyLicense.updateMany(
    { companyId, status: "ACTIVE" },
    { status: "EXPIRED" }
  );

  return await CompanyLicense.create({
    companyId,
    licenseId,
    startDate,
    expiryDate,
    status: "ACTIVE",
    userLimitSnapshot: license.userLimit,
    featuresSnapshot: license.features
  });
};

export const getCompanyLicense = async (companyId: string) => {
  const license = await CompanyLicense.findOne({
    companyId,
    status: "ACTIVE"
  }).populate("licenseId");

  if (!license) {
    throw new NotFoundError("No active license found");
  }

  return license;
};