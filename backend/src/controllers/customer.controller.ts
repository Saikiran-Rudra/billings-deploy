import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerIdSchema,
} from "../validators/customerValidation.js";
import { BadRequestError } from "../utils/AppError.js";
import { CustomerService } from "../services/customerService.js";
import Customer from "../models/Customer.js";

/**
 * POST /api/customers
 * Creates a new customer with full validation
 */
export const createCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // ── Extract company context from middleware ───────────────────
    const companyId = (req as any).companyId;
    
    if (!companyId) {
      next(new BadRequestError("Company context is required"));
      return;
    }

    // ── Validate request body with companyId ──────────────────────
    const validatedData = createCustomerSchema.parse({
      ...req.body,
      companyId, // Inject companyId from middleware (never trust frontend)
    });

    // ── Delegate to service layer ──────────────────────────────────
    const customer = await CustomerService.createCustomer(req.userId!, validatedData);

    res.status(201).json({
      success: true,
      message: "Customer created successfully.",
      data: customer,
    });
  } catch (err) {
    console.error("[createCustomer] Error:", err);
    if (err instanceof z.ZodError) {
      const message = err.issues[0]?.message || "Validation failed.";
      next(new BadRequestError(message));
    } else {
      next(err);
    }
  }
};

/**
 * GET /api/customers
 * Retrieves all customers for the authenticated user
 */
export const getCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // ── Get company context from request ──────────────────────────
    const companyId = (req as any).companyId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const search = req.query.search as string;
    const type = req.query.type as string;
    const status = req.query.status as string;

    let filter: any = { companyId };
    
    if (search) {
      filter.$or = [
        { displayName: { $regex: search, $options: "i" } },
        { primaryPhone: { $regex: search, $options: "i" } },
        { gstNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (type) {
      filter.customerType = type;
    }

    if (status) {
      filter.customerStatus = status;
    }

    const total = await Customer.countDocuments(filter);
    const data = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("companyId", "name email")
      .populate("userId", "firstName lastName email");

    res.status(200).json({
      success: true,
      message: "Customers retrieved successfully.",
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/customers/:id
 * Retrieves a single customer by ID
 */
export const getCustomerById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // ── Validate params ────────────────────────────────────────────
    const { id } = customerIdSchema.parse(req.params);

    // ── Get company context from request ────────────────────────────
    const companyId = (req as any).companyId;

    // ── Delegate to service layer ──────────────────────────────────
    const customer = await CustomerService.getCustomerById(req.userId!, id, companyId);

    res.status(200).json({
      success: true,
      message: "Customer retrieved successfully.",
      data: customer,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const message = err.issues[0]?.message || "Invalid customer ID.";
      next(new BadRequestError(message));
    } else {
      next(err);
    }
  }
};

/**
 * PUT /api/customers/:id
 * Updates a customer record
 */
export const updateCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // ── Get company context from request ────────────────────────────
    const companyId = (req as any).companyId;
    
    if (!companyId) {
      next(new BadRequestError("Company context is required"));
      return;
    }

    // ── Validate params ────────────────────────────────────────────
    const { id } = customerIdSchema.parse(req.params);

    // ── Validate update payload with companyId ─────────────────────
    // This prevents malicious attempts to update other companies' data
    const validatedData = updateCustomerSchema.parse({
      ...req.body,
      companyId, // Inject companyId from middleware
    });

    // ── Delegate to service layer ──────────────────────────────────
    const customer = await CustomerService.updateCustomer(
      req.userId!,
      id,
      validatedData,
      companyId,
    );

    res.status(200).json({
      success: true,
      message: "Customer updated successfully.",
      data: customer,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const message = err.issues[0]?.message || "Validation failed.";
      next(new BadRequestError(message));
    } else {
      next(err);
    }
  }
};

/**
 * DELETE /api/customers/:id
 * Deletes a customer record
 */
export const deleteCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // ── Validate params ────────────────────────────────────────────
    const { id } = customerIdSchema.parse(req.params);

    // ── Get company context from request ────────────────────────────
    const companyId = (req as any).companyId;

    // ── Delegate to service layer ──────────────────────────────────
    const deleted = await CustomerService.deleteCustomer(req.userId!, id, companyId);

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const message = err.issues[0]?.message || "Invalid customer ID.";
      next(new BadRequestError(message));
    } else {
      next(err);
    }
  }
};
