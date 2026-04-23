import { Request, Response } from "express";
import { Purchase, IPurchase } from "../models/Purchase.js";
import { Supplier } from "../models/Supplier.js";
import Product from "../models/Product.js";
import Company from "../models/Company.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * HELPER: Determine GST Type
 * CASE 1: Supplier NOT GST registered → No GST
 * CASE 2: Supplier is SEZ → Zero-rated (GST = 0)
 * CASE 3: Normal GST
 *   IF company.state === supplier.state → INTRA-STATE
 *   ELSE → INTER-STATE
 */
const determineGSTType = (
  supplier: any,
  companyState?: string
): "intra" | "inter" | "zero" | "none" => {
  // Case 1: Supplier not GST registered
  if (!supplier.isGSTRegistered) {
    return "none";
  }

  // Case 2: Check if SEZ (could be in GST number or special flag)
  // For now, we assume no SEZ flag exists, but we can add it later

  // Case 3: Normal GST - check state match
  if (companyState && supplier.billingAddress?.state) {
    if (companyState === supplier.billingAddress.state) {
      return "intra"; // Intra-state
    } else {
      return "inter"; // Inter-state
    }
  }

  return "none";
};

/**
 * HELPER: Calculate GST for an item
 * Handles CGST/SGST for intra-state and IGST for inter-state
 */
const calculateItemTax = (
  quantity: number,
  purchasePrice: number,
  taxRate: number,
  taxType: "intra" | "inter" | "zero" | "none"
) => {
  const taxableAmount = quantity * purchasePrice;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (taxType === "intra") {
    // INTRA-STATE: Split GST into CGST and SGST
    const halfRate = taxRate / 2;
    cgst = (taxableAmount * halfRate) / 100;
    sgst = (taxableAmount * halfRate) / 100;
  } else if (taxType === "inter") {
    // INTER-STATE: Full tax as IGST
    igst = (taxableAmount * taxRate) / 100;
  } else if (taxType === "zero") {
    // ZERO-RATED: No tax
    cgst = 0;
    sgst = 0;
    igst = 0;
  } else {
    // NO GST
    cgst = 0;
    sgst = 0;
    igst = 0;
  }

  const totalTax = cgst + sgst + igst;
  const totalAmount = taxableAmount + totalTax;

  return {
    taxableAmount,
    cgst,
    sgst,
    igst,
    totalTax,
    totalAmount,
  };
};

/**
 * Generate Purchase Number
 * Format: PUR-YYYYMMDD-XXXXX
 */
const generatePurchaseNumber = async (companyId: string): Promise<string> => {
  const today = new Date();
  const dateString = today.toISOString().split("T")[0].replace(/-/g, "");

  // Count purchases created today for this company
  const count = await Purchase.countDocuments({
    companyId,
    createdAt: {
      $gte: new Date(today.setHours(0, 0, 0, 0)),
      $lte: new Date(today.setHours(23, 59, 59, 999)),
    },
  });

  const sequence = String(count + 1).padStart(5, "0");
  return `PUR-${dateString}-${sequence}`;
};

/**
 * Create a new purchase
 * POST /api/purchases
 */
export const createPurchase = asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req as any).companyId;

  if (!companyId) {
    throw new AppError(400, "Company context is required");
  }

  const { supplierId, items, notes } = req.body;

  // Validate required fields
  if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
    throw new AppError(400, "Supplier and at least one item are required");
  }

  // Fetch supplier
  const supplier = await Supplier.findOne({
    _id: supplierId,
    companyId,
    isDeleted: false,
  });

  if (!supplier) {
    throw new AppError(404, "Supplier not found");
  }

  // Fetch company to get company state
  const company = await Company.findById(companyId);
  if (!company) {
    throw new AppError(404, "Company not found");
  }

  // Determine GST type
  const companyState = company.businessInfo?.businessAddress; // You may need to parse this or add a state field
  const taxType = determineGSTType(supplier, companyState);

  // Fetch products and validate items
  const processedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const { productId, quantity, purchasePrice, taxRate } = item;

    if (!productId || quantity <= 0 || purchasePrice < 0) {
      throw new AppError(400, "Invalid item data");
    }

    // Check if productId is a valid MongoDB ObjectId or a product name
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(productId);
    let product: any = null;
    let productName = productId;

    if (isValidObjectId) {
      // productId is a valid ObjectId - look it up
      product = await Product.findOne({
        _id: productId,
        companyId,
      });

      if (!product) {
        throw new AppError(404, `Product with ID ${productId} not found`);
      }
      productName = product.productName;
    } else {
      // productId is a product name (manual entry) - accept it as is
      productName = productId;
    }

    // Calculate tax
    const taxCalc = calculateItemTax(quantity, purchasePrice, taxRate || 0, taxType);

    subtotal += taxCalc.taxableAmount;

    processedItems.push({
      productId: isValidObjectId ? productId : undefined,
      productName,
      quantity,
      purchasePrice,
      taxRate: taxRate || 0,
      taxableAmount: taxCalc.taxableAmount,
      cgst: taxCalc.cgst,
      sgst: taxCalc.sgst,
      igst: taxCalc.igst,
      totalAmount: taxCalc.totalAmount,
      unit: product.unit,
    });
  }

  // Calculate totals
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;

  processedItems.forEach((item) => {
    totalCGST += item.cgst;
    totalSGST += item.sgst;
    totalIGST += item.igst;
  });

  const totalGST = totalCGST + totalSGST + totalIGST;
  const grandTotal = subtotal + totalGST;

  // Create supplier snapshot
  const supplierSnapshot = {
    supplierId: supplier._id,
    supplierName: supplier.supplierName,
    companyName: supplier.companyName,
    phone: supplier.phone,
    email: supplier.email,
    address: supplier.billingAddress,
    gstNumber: supplier.gstNumber,
    state: supplier.billingAddress?.state,
    isGSTRegistered: supplier.isGSTRegistered,
  };

  // Generate purchase number
  const purchaseNumber = await generatePurchaseNumber(companyId);

  // Create purchase
  const purchase = await Purchase.create({
    companyId,
    supplierId,
    purchaseNumber,
    supplierSnapshot,
    taxType,
    items: processedItems,
    subtotal,
    totalCGST,
    totalSGST,
    totalIGST,
    totalGST,
    grandTotal,
    notes: notes?.trim() || "",
    status: "draft",
  });

  res.status(201).json({
    success: true,
    message: "Purchase created successfully",
    data: purchase,
  });
});

/**
 * Get all purchases for a company
 * GET /api/purchases?page=1&limit=20&search=name&status=draft
 */
export const getPurchases = asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req as any).companyId;
  const { page = 1, limit = 20, search = "", status } = req.query;

  if (!companyId) {
    throw new AppError(400, "Company context is required");
  }

  const query: any = {
    companyId,
    isDeleted: false,
  };

  if (status) {
    query.status = status;
  }

  // Search by supplier name or purchase number
  if (search) {
    query.$or = [
      { "supplierSnapshot.supplierName": { $regex: search, $options: "i" } },
      { purchaseNumber: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const purchases = await Purchase.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit as string))
    .lean();

  const total = await Purchase.countDocuments(query);

  res.status(200).json({
    success: true,
    data: purchases,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      pages: Math.ceil(total / parseInt(limit as string)),
    },
  });
});

/**
 * Get purchase by ID
 * GET /api/purchases/:id
 */
export const getPurchaseById = asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req as any).companyId;
  const { id } = req.params;

  if (!companyId) {
    throw new AppError(400, "Company context is required");
  }

  const purchase = await Purchase.findOne({
    _id: id,
    companyId,
    isDeleted: false,
  }).populate("supplierId", "supplierName companyName email phone");

  if (!purchase) {
    throw new AppError(404, "Purchase not found");
  }

  res.status(200).json({
    success: true,
    data: purchase,
  });
});

/**
 * Update purchase
 * PUT /api/purchases/:id
 */
export const updatePurchase = asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req as any).companyId;
  const { id } = req.params;
  const { supplierId, items, notes, status } = req.body;

  if (!companyId) {
    throw new AppError(400, "Company context is required");
  }

  const purchase = await Purchase.findOne({
    _id: id,
    companyId,
    isDeleted: false,
  });

  if (!purchase) {
    throw new AppError(404, "Purchase not found");
  }

  // If changing supplier, fetch new supplier
  let supplier = purchase.supplierSnapshot || {};
  if (supplierId && supplierId !== purchase.supplierId.toString()) {
    const newSupplier = await Supplier.findOne({
      _id: supplierId,
      companyId,
      isDeleted: false,
    });

    if (!newSupplier) {
      throw new AppError(404, "Supplier not found");
    }

    supplier = newSupplier;
    purchase.supplierId = newSupplier._id;
  }

  // Recalculate items if provided
  if (items && Array.isArray(items) && items.length > 0) {
    const company = await Company.findById(companyId);
    const companyState = company?.businessInfo?.businessAddress;
    const taxType = determineGSTType(supplier, companyState);

    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const { productId, quantity, purchasePrice, taxRate } = item;

      if (!productId || quantity <= 0 || purchasePrice < 0) {
        throw new AppError(400, "Invalid item data");
      }

      // Check if productId is a valid MongoDB ObjectId or a product name
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(productId);
      let product: any = null;
      let productName = productId;

      if (isValidObjectId) {
        // productId is a valid ObjectId - look it up
        product = await Product.findOne({
          _id: productId,
          companyId,
        });

        if (!product) {
          throw new AppError(404, `Product with ID ${productId} not found`);
        }
        productName = product.productName;
      } else {
        // productId is a product name (manual entry) - accept it as is
        productName = productId;
      }

      const taxCalc = calculateItemTax(quantity, purchasePrice, taxRate || 0, taxType);
      subtotal += taxCalc.taxableAmount;

      processedItems.push({
        productId: isValidObjectId ? productId : undefined,
        productName,
        quantity,
        purchasePrice,
        taxRate: taxRate || 0,
        taxableAmount: taxCalc.taxableAmount,
        cgst: taxCalc.cgst,
        sgst: taxCalc.sgst,
        igst: taxCalc.igst,
        totalAmount: taxCalc.totalAmount,
        unit: product.unit,
      });
    }

    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    processedItems.forEach((item) => {
      totalCGST += item.cgst;
      totalSGST += item.sgst;
      totalIGST += item.igst;
    });

    const totalGST = totalCGST + totalSGST + totalIGST;
    const grandTotal = subtotal + totalGST;

    purchase.items = processedItems as any;
    purchase.taxType = taxType;
    purchase.subtotal = subtotal;
    purchase.totalCGST = totalCGST;
    purchase.totalSGST = totalSGST;
    purchase.totalIGST = totalIGST;
    purchase.totalGST = totalGST;
    purchase.grandTotal = grandTotal;
  }

  if (notes !== undefined) {
    purchase.notes = notes.trim();
  }

  if (status && ["draft", "confirmed", "cancelled"].includes(status)) {
    purchase.status = status;
  }

  await purchase.save();

  res.status(200).json({
    success: true,
    message: "Purchase updated successfully",
    data: purchase,
  });
});

/**
 * Delete purchase (soft delete)
 * DELETE /api/purchases/:id
 */
export const deletePurchase = asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req as any).companyId;
  const { id } = req.params;

  if (!companyId) {
    throw new AppError(400, "Company context is required");
  }

  const purchase = await Purchase.findOne({
    _id: id,
    companyId,
    isDeleted: false,
  });

  if (!purchase) {
    throw new AppError(404, "Purchase not found");
  }

  purchase.isDeleted = true;
  await purchase.save();

  res.status(200).json({
    success: true,
    message: "Purchase deleted successfully",
  });
});
