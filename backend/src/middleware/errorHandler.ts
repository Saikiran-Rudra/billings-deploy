import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import multer from "multer";
import AppError from "../utils/AppError.js";

/**
 * Global error-handling middleware.
 * Catches errors thrown by asyncHandler (or next(err)) and sends
 * a consistent JSON response.
 */
const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Custom operational errors (thrown by services / validators)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // MongoDB duplicate-key error
  if (
    err &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code: number }).code === 11000
  ) {
    res.status(409).json({ message: "Duplicate entry — record already exists" });
    return;
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const firstMessage =
      Object.values(err.errors)[0]?.message || "Validation failed";
    res.status(400).json({ message: firstMessage });
    return;
  }

  // Mongoose cast error (bad ObjectId, etc.)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: `Invalid value for ${err.path}` });
    return;
  }

  if (err instanceof multer.MulterError) {
    const multerError = err as multer.MulterError;

    if (multerError.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ message: "File must be less than 5MB" });
      return;
    }

    res.status(400).json({ message: multerError.message });
    return;
  }

  // Unexpected errors
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
};

export default errorHandler;
