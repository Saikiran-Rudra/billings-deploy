// utils/validate.ts

import { ZodSchema } from "zod";
import { BadRequestError } from "../utils/AppError.js";

export const validate = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map(e => e.message).join(", ");
    throw new BadRequestError(errors);
  }

  return result.data;
};