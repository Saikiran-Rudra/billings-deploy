import { Request, Response, NextFunction } from "express";
import { CompanyLicense } from "../models/companyLicense.model.js";
import { UnauthorizedError, BadRequestError } from "../utils/AppError.js";

export const checkLicense = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const companyId = req.user?.companyId;

  if (!companyId) {
    throw new UnauthorizedError("Company context missing");
  }

  const license = await CompanyLicense.findOne({
    companyId,
    status: "ACTIVE"
  });

  if (!license) {
    throw new BadRequestError("No active license found");
  }

  const expiryDate = license.expiryDate;

  if (!expiryDate) {
    throw new BadRequestError("License expiry date is missing");
  }

  if (new Date() > expiryDate) {
    license.status = "EXPIRED";
    await license.save();

    throw new UnauthorizedError("License expired. Upgrade required.");
  }

  const diffDays = Math.ceil(
    (expiryDate.getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 7) {
    res.setHeader("x-license-warning", "License expiring soon");
  }

  req.license = license;

  next();
};