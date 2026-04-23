import SalesReturn, { ISalesReturn } from "../models/SalesReturn.js";
import AppError from "../utils/AppError.js";
import {
  SalesReturnInput,
  validateSalesReturnInput,
} from "../validators/salesReturn.validator.js";

/**
 * Service layer for Sales Return operations.
 * Contains all business logic and database interactions.
 * Throws AppError for known error conditions.
 */

// ─── CREATE ──────────────────────────────────────────────

export const createSalesReturn = async (
  userId: string,
  data: SalesReturnInput
): Promise<ISalesReturn> => {
  validateSalesReturnInput(data);

  const salesReturn = await SalesReturn.create({
    companyId: data.companyId,
    userId,
    returnId: data.returnId.trim(),
    date: data.date.trim(),
    originalInvoice: data.originalInvoice.trim(),
    customer: data.customer.trim(),
    items: data.items.trim(),
    amount: Number(data.amount),
    status: data.status || "pending",
    notes: data.notes || "",
  });

  return salesReturn;
};

// ─── READ ALL ────────────────────────────────────────────

export const getAllSalesReturns = async (
  companyId: string,
  page: number = 1,
  limit: number = 20,
  search?: string,
  status?: string
): Promise<{ salesReturns: ISalesReturn[]; pagination: any }> => {
  let filter: any = { companyId };
  
  if (search) {
    filter.$or = [
      { returnId: { $regex: search, $options: "i" } },
      { customer: { $regex: search, $options: "i" } },
      { originalInvoice: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    filter.status = status;
  }

  const total = await SalesReturn.countDocuments(filter);
  const salesReturns = await SalesReturn.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    salesReturns,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// ─── READ ONE ────────────────────────────────────────────

export const getSalesReturnById = async (
  companyId: string,
  id: string
): Promise<ISalesReturn> => {
  const salesReturn = await SalesReturn.findOne({ _id: id, companyId });

  if (!salesReturn) {
    throw new AppError("Sales return not found", 404);
  }

  return salesReturn;
};

// ─── UPDATE ──────────────────────────────────────────────

export const updateSalesReturn = async (
  companyId: string,
  id: string,
  data: SalesReturnInput
): Promise<ISalesReturn> => {
  validateSalesReturnInput(data);

  const salesReturn = await SalesReturn.findOneAndUpdate(
    { _id: id, companyId },
    {
      $set: {
        returnId: data.returnId.trim(),
        date: data.date.trim(),
        originalInvoice: data.originalInvoice.trim(),
        customer: data.customer.trim(),
        items: data.items.trim(),
        amount: Number(data.amount),
        status: data.status || "pending",
        notes: data.notes || "",
      },
    },
    { new: true, runValidators: true }
  );

  if (!salesReturn) {
    throw new AppError("Sales return not found", 404);
  }

  return salesReturn;
};

// ─── DELETE ──────────────────────────────────────────────

export const deleteSalesReturn = async (
  companyId: string,
  id: string
): Promise<ISalesReturn> => {
  const salesReturn = await SalesReturn.findOneAndDelete({ _id: id, companyId });

  if (!salesReturn) {
    throw new AppError("Sales return not found", 404);
  }

  return salesReturn;
};
