import { Request, Response } from "express";
import { Supplier, ISupplier } from "../models/Supplier.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Create a new supplier
 * POST /api/suppliers
 */
export const createSupplier = asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req as any).companyId;

  if (!companyId) {
    throw new AppError(400, "Company context is required");
  }

  const { supplierName, companyName, email, phone, isGSTRegistered, gstNumber, billingAddress, shippingAddress, paymentTerms, openingBalance, notes, status } = req.body;

  // Validate required fields
  if (!supplierName || !companyName || !email || !phone || !billingAddress || !shippingAddress || !paymentTerms) {
    throw new AppError(400, "Missing required fields");
  }

  // Check if supplier with same email already exists in the company
  const existingSupplier = await Supplier.findOne({
    companyId,
    email: email.toLowerCase(),
    isDeleted: false,
  });

  if (existingSupplier) {
    throw new AppError(400, "Supplier with this email already exists");
  }

  // Create supplier
  const supplier = await Supplier.create({
    companyId,
    supplierName: supplierName.trim(),
    companyName: companyName.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    isGSTRegistered,
    gstNumber: isGSTRegistered ? gstNumber?.trim().toUpperCase() : undefined,
    billingAddress: {
      street: billingAddress.street.trim(),
      city: billingAddress.city.trim(),
      state: billingAddress.state.trim(),
      country: billingAddress.country || "India",
      pincode: billingAddress.pincode.trim(),
    },
    shippingAddress: {
      street: shippingAddress.street.trim(),
      city: shippingAddress.city.trim(),
      state: shippingAddress.state.trim(),
      country: shippingAddress.country || "India",
      pincode: shippingAddress.pincode.trim(),
    },
    paymentTerms: paymentTerms.trim(),
    openingBalance: openingBalance || 0,
    notes: notes?.trim() || "",
    status: status || "active",
  });

  res.status(201).json({
    success: true,
    message: "Supplier created successfully",
    data: supplier,
  });
});

/**
 * Get all suppliers for a company
 * GET /api/suppliers?page=1&limit=20&search=name
 */
export const getSuppliers = asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req as any).companyId;
  const { page = 1, limit = 20, search = "" } = req.query;

  if (!companyId) {
    throw new AppError(400, "Company context is required");
  }

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  // Build search query
  let query: any = { companyId, isDeleted: false };

  if (search) {
    query.$or = [
      { supplierName: { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { gstNumber: { $regex: search, $options: "i" } },
    ];
  }

  // Fetch suppliers
  const suppliers = await Supplier.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit as string));

  // Get total count
  const total = await Supplier.countDocuments(query);

  res.status(200).json({
    success: true,
    data: suppliers,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      pages: Math.ceil(total / parseInt(limit as string)),
    },
  });
});

/**
 * Get supplier by ID
 * GET /api/suppliers/:id
 */
export const getSupplierById = asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req as any).companyId;
  const { id } = req.params;

  if (!companyId) {
    throw new AppError(400, "Company context is required");
  }

  const supplier = await Supplier.findOne({
    _id: id,
    companyId,
    isDeleted: false,
  });

  if (!supplier) {
    throw new AppError(404, "Supplier not found");
  }

  res.status(200).json({
    success: true,
    data: supplier,
  });
});

/**
 * Update supplier
 * PUT /api/suppliers/:id
 */
export const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req as any).companyId;
  const { id } = req.params;
  const { supplierName, companyName, email, phone, isGSTRegistered, gstNumber, billingAddress, shippingAddress, paymentTerms, openingBalance, notes, status } = req.body;

  if (!companyId) {
    throw new AppError(400, "Company context is required");
  }

  const supplier = await Supplier.findOne({
    _id: id,
    companyId,
    isDeleted: false,
  });

  if (!supplier) {
    throw new AppError(404, "Supplier not found");
  }

  // Check if email is being changed and if new email already exists
  if (email && email.toLowerCase() !== supplier.email) {
    const existingSupplier = await Supplier.findOne({
      companyId,
      email: email.toLowerCase(),
      isDeleted: false,
      _id: { $ne: id },
    });

    if (existingSupplier) {
      throw new AppError(400, "Supplier with this email already exists");
    }
  }

  // Update fields
  if (supplierName) supplier.supplierName = supplierName.trim();
  if (companyName) supplier.companyName = companyName.trim();
  if (email) supplier.email = email.toLowerCase().trim();
  if (phone) supplier.phone = phone.trim();
  if (isGSTRegistered !== undefined) supplier.isGSTRegistered = isGSTRegistered;
  if (gstNumber !== undefined) {
    supplier.gstNumber = isGSTRegistered ? gstNumber?.trim().toUpperCase() : undefined;
  }
  if (billingAddress) {
    supplier.billingAddress = {
      street: billingAddress.street.trim(),
      city: billingAddress.city.trim(),
      state: billingAddress.state.trim(),
      country: billingAddress.country || "India",
      pincode: billingAddress.pincode.trim(),
    };
  }
  if (shippingAddress) {
    supplier.shippingAddress = {
      street: shippingAddress.street.trim(),
      city: shippingAddress.city.trim(),
      state: shippingAddress.state.trim(),
      country: shippingAddress.country || "India",
      pincode: shippingAddress.pincode.trim(),
    };
  }
  if (paymentTerms) supplier.paymentTerms = paymentTerms.trim();
  if (openingBalance !== undefined) supplier.openingBalance = openingBalance;
  if (notes !== undefined) supplier.notes = notes?.trim() || "";
  if (status) supplier.status = status;

  await supplier.save();

  res.status(200).json({
    success: true,
    message: "Supplier updated successfully",
    data: supplier,
  });
});

/**
 * Delete supplier (soft delete)
 * DELETE /api/suppliers/:id
 */
export const deleteSupplier = asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req as any).companyId;
  const { id } = req.params;

  if (!companyId) {
    throw new AppError(400, "Company context is required");
  }

  const supplier = await Supplier.findOne({
    _id: id,
    companyId,
    isDeleted: false,
  });

  if (!supplier) {
    throw new AppError(404, "Supplier not found");
  }

  // Soft delete
  supplier.isDeleted = true;
  await supplier.save();

  res.status(200).json({
    success: true,
    message: "Supplier deleted successfully",
  });
});
