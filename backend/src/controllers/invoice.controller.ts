import { Request, Response } from "express";
import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Customer from "../models/Customer.js";

type LineItemInput = {
  itemName: string;
  description?: string;
  quantity: number;
  rate: number;
};

type InvoiceInput = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerId?: string;
  customerName?: string;
  lineItems: LineItemInput[];
  discountType?: "flat" | "percent";
  discountValue?: number;
  taxPercent?: number;
  notes?: string;
  terms?: string;
  status?: "draft" | "sent" | "partially_paid" | "paid" | "overdue";
};

const computeAmounts = (lineItems: LineItemInput[], discountType: "flat" | "percent", discountValue: number, taxPercent: number) => {
  const computedItems = lineItems.map((item) => {
    const quantity = Number(item.quantity);
    const rate = Number(item.rate);
    return {
      itemName: item.itemName,
      description: item.description || "",
      quantity,
      rate,
      amount: Number((quantity * rate).toFixed(2)),
    };
  });

  const subtotal = Number(computedItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2));

  const discountAmount = discountType === "percent"
    ? Number(((subtotal * discountValue) / 100).toFixed(2))
    : Number(discountValue.toFixed(2));

  const taxable = Math.max(0, Number((subtotal - discountAmount).toFixed(2)));
  const taxAmount = Number(((taxable * taxPercent) / 100).toFixed(2));
  const total = Number((taxable + taxAmount).toFixed(2));

  return { computedItems, subtotal, taxAmount, total };
};

const validateBasic = (payload: InvoiceInput, res: Response): boolean => {
  if (!payload.invoiceNumber || !payload.invoiceDate || !payload.dueDate) {
    res.status(400).json({ message: "Invoice number, invoice date and due date are required" });
    return false;
  }

  if (!payload.customerId && !payload.customerName?.trim()) {
    res.status(400).json({ message: "Customer is required" });
    return false;
  }

  if (!Array.isArray(payload.lineItems) || payload.lineItems.length === 0) {
    res.status(400).json({ message: "At least one line item is required" });
    return false;
  }

  const hasInvalidItem = payload.lineItems.some(
    (item) => !item.itemName || !Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0 || !Number.isFinite(Number(item.rate)) || Number(item.rate) < 0
  );

  if (hasInvalidItem) {
    res.status(400).json({ message: "Each line item must have item name, positive quantity and valid rate" });
    return false;
  }

  return true;
};

// POST /api/invoices
export const createInvoice = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const payload = req.body as InvoiceInput;
    if (!validateBasic(payload, res)) return;

    const discountType = payload.discountType === "percent" ? "percent" : "flat";
    const discountValue = Number(payload.discountValue || 0);
    const taxPercent = Number(payload.taxPercent || 0);

    const { computedItems, subtotal, taxAmount, total } = computeAmounts(payload.lineItems, discountType, discountValue, taxPercent);

    let customerName = payload.customerName || "";
    let customerId: mongoose.Types.ObjectId | undefined;

    if (payload.customerId && !mongoose.Types.ObjectId.isValid(payload.customerId)) {
      res.status(400).json({ message: "Invalid customer id" });
      return;
    }

    if (payload.customerId && mongoose.Types.ObjectId.isValid(payload.customerId)) {
      const customer = await Customer.findOne({ _id: payload.customerId, companyId, userId: req.userId! });
      if (!customer) {
        res.status(404).json({ message: "Customer not found" });
        return;
      }
      customerName = customer.displayName;
      customerId = customer._id as mongoose.Types.ObjectId;
    }

    if (!customerName.trim()) {
      res.status(400).json({ message: "Customer is required" });
      return;
    }

    const invoice = await Invoice.create({
      companyId,
      userId: req.userId!,
      invoiceNumber: payload.invoiceNumber,
      invoiceDate: payload.invoiceDate,
      dueDate: payload.dueDate,
      customerId,
      customerName,
      lineItems: computedItems,
      subtotal,
      discountType,
      discountValue,
      taxPercent,
      taxAmount,
      total,
      notes: payload.notes || "",
      terms: payload.terms || "",
      status: payload.status || "draft",
    });

    res.status(201).json({ message: "Invoice created successfully", invoice });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: number }).code === 11000) {
      res.status(409).json({ message: "Invoice number already exists" });
      return;
    }
    if (error instanceof mongoose.Error.ValidationError) {
      const firstMessage = Object.values(error.errors)[0]?.message || "Validation failed";
      res.status(400).json({ message: firstMessage });
      return;
    }
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: `Invalid value for ${error.path}` });
      return;
    }
    console.error("Create invoice error:", error);
    res.status(500).json({ message: "Server error while creating invoice" });
  }
};

// GET /api/invoices
export const getInvoices = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const search = req.query.search as string;
    const status = req.query.status as string;

    let filter: any = { companyId, userId: req.userId! };
    
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get invoices error:", error);
    res.status(500).json({ message: "Server error while fetching invoices" });
  }
};

// GET /api/invoices/:id
export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { id } = req.params;

    const invoice = await Invoice.findOne({ _id: id, companyId, userId: req.userId! });
    if (!invoice) {
      res.status(404).json({ message: "Invoice not found" });
      return;
    }

    res.json({ invoice });
  } catch (error) {
    console.error("Get invoice error:", error);
    res.status(500).json({ message: "Server error while fetching invoice" });
  }
};

// PUT /api/invoices/:id
export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { id } = req.params;

    const payload = req.body as InvoiceInput;
    if (!validateBasic(payload, res)) return;

    const discountType = payload.discountType === "percent" ? "percent" : "flat";
    const discountValue = Number(payload.discountValue || 0);
    const taxPercent = Number(payload.taxPercent || 0);

    const { computedItems, subtotal, taxAmount, total } = computeAmounts(payload.lineItems, discountType, discountValue, taxPercent);

    let customerName = payload.customerName || "";
    const updateDoc: Record<string, unknown> = {
      invoiceNumber: payload.invoiceNumber,
      invoiceDate: payload.invoiceDate,
      dueDate: payload.dueDate,
      lineItems: computedItems,
      subtotal,
      discountType,
      discountValue,
      taxPercent,
      taxAmount,
      total,
      notes: payload.notes || "",
      terms: payload.terms || "",
      status: payload.status || "draft",
    };

    if (payload.customerId && !mongoose.Types.ObjectId.isValid(payload.customerId)) {
      res.status(400).json({ message: "Invalid customer id" });
      return;
    }

    if (payload.customerId && mongoose.Types.ObjectId.isValid(payload.customerId)) {
      const customer = await Customer.findOne({ _id: payload.customerId, companyId, userId: req.userId! });
      if (!customer) {
        res.status(404).json({ message: "Customer not found" });
        return;
      }
      customerName = customer.displayName;
      updateDoc.customerId = customer._id;
    } else {
      updateDoc.customerId = undefined;
    }

    if (!customerName.trim()) {
      res.status(400).json({ message: "Customer is required" });
      return;
    }

    updateDoc.customerName = customerName;

    const invoice = await Invoice.findOneAndUpdate(
      { _id: id, companyId, userId: req.userId! },
      { $set: updateDoc },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      res.status(404).json({ message: "Invoice not found" });
      return;
    }

    res.json({ message: "Invoice updated successfully", invoice });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: number }).code === 11000) {
      res.status(409).json({ message: "Invoice number already exists" });
      return;
    }
    if (error instanceof mongoose.Error.ValidationError) {
      const firstMessage = Object.values(error.errors)[0]?.message || "Validation failed";
      res.status(400).json({ message: firstMessage });
      return;
    }
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: `Invalid value for ${error.path}` });
      return;
    }
    console.error("Update invoice error:", error);
    res.status(500).json({ message: "Server error while updating invoice" });
  }
};

// DELETE /api/invoices/:id
export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { id } = req.params;

    const invoice = await Invoice.findOneAndDelete({ _id: id, companyId, userId: req.userId! });
    if (!invoice) {
      res.status(404).json({ message: "Invoice not found" });
      return;
    }

    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Delete invoice error:", error);
    res.status(500).json({ message: "Server error while deleting invoice" });
  }
};
