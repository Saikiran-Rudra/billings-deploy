import { z } from "zod";

const nameRegex = /^[A-Za-z\s]+$/;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .min(3, "First name must be at least 3 characters")
      .regex(nameRegex, "Only letters and spaces are allowed"),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required")
      .min(3, "Last name must be at least 3 characters")
      .regex(nameRegex, "Only letters and spaces are allowed"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .transform((val) => val.toLowerCase()),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include at least 1 uppercase letter")
      .regex(/[a-z]/, "Must include at least 1 lowercase letter")
      .regex(/[0-9]/, "Must include at least 1 number")
      .regex(/[^A-Za-z0-9]/, "Must include at least 1 special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z
      .boolean()
      .refine((val) => val === true, "You must accept the terms and conditions"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
