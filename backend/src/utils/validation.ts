import mongoose from "mongoose";
import { BadRequestError } from "./AppError.js";

/**
 * Validates and converts unknown value to valid ObjectId string
 * Handles various input formats: ObjectId instance, string, plain object with _id
 * 
 * @param id - Value to validate (can be ObjectId, string, or object)
 * @param fieldName - Field name for error message
 * @returns Valid ObjectId string
 * @throws BadRequestError if invalid format
 * 
 * @example
 * const userId = validateObjectId(req.body.userId, "User ID");
 * const companyId = validateObjectId(req.user.companyId, "Company ID");
 */
export const validateObjectId = (id: unknown, fieldName = "ID"): string => {
  // Handle Mongoose ObjectId instances
  if (mongoose.Types.ObjectId.isValid(id as string | mongoose.Types.ObjectId)) {
    const objId = new mongoose.Types.ObjectId(id as string | mongoose.Types.ObjectId);
    return objId.toString();
  }

  // Handle plain objects with _id property (from Mongoose toJSON)
  if (typeof id === "object" && id !== null && "_id" in id) {
    return validateObjectId((id as any)._id, fieldName);
  }

  // Handle objects with toString() method
  if (typeof id === "object" && id !== null && "toString" in id) {
    try {
      const converted = (id as any).toString();
      if (typeof converted === "string" && converted !== "[object Object]") {
        return validateObjectId(converted, fieldName);
      }
    } catch (e) {
      // Fall through to error handling
    }
  }

  // Convert to string and validate
  const idStr = String(id ?? "").trim();

  if (!idStr) {
    throw new BadRequestError(`${fieldName} is required`);
  }

  if (!mongoose.Types.ObjectId.isValid(idStr)) {
    throw new BadRequestError(`${fieldName} must be a valid ID string (received: ${idStr})`);
  }

  return idStr;
};

/**
 * Validates multiple ObjectId values
 * 
 * @param ids - Object with field names as keys and IDs as values
 * @returns Object with validated ID strings
 * 
 * @example
 * const { userId, companyId } = validateObjectIds({
 *   userId: req.user._id,
 *   companyId: req.user.companyId
 * });
 */
export const validateObjectIds = (
  ids: Record<string, unknown>,
): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(ids)) {
    result[key] = validateObjectId(value, key);
  }

  return result;
};

/**
 * Safely converts ObjectId to string (returns empty string if invalid)
 * Used for non-critical conversions where we don't want to throw
 * 
 * @param id - Value to convert
 * @returns ObjectId string or empty string if invalid
 */
export const safeObjectIdToString = (id: unknown): string => {
  try {
    if (!id) return "";
    if (typeof id === "string") return id;
    if (mongoose.Types.ObjectId.isValid(id as string | mongoose.Types.ObjectId)) {
      return new mongoose.Types.ObjectId(id as string | mongoose.Types.ObjectId).toString();
    }
    if (typeof id === "object" && "_id" in id) {
      return safeObjectIdToString((id as any)._id);
    }
    return "";
  } catch (e) {
    return "";
  }
};
