import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { uploadService, type UploadDocumentType } from "../services/upload.service.js";

const isUploadDocumentType = (value: unknown): value is UploadDocumentType =>
  value === "gst" || value === "pan";

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  const rawType = req.body.type;

  if (!isUploadDocumentType(rawType)) {
    throw new AppError(400, "Upload type must be gst or pan");
  }

  if (!req.file) {
    throw new AppError(400, "File is required");
  }

  const url = await uploadService.uploadDocument(req.file, rawType);

  res.status(201).json({
    success: true,
    url,
  });
});
