import { Request, Response } from "express";
import Payment from "../models/Payment.js";

// POST /api/payments
export const createPayment = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { date, invoice, customer, Amount, paymentmode, reference, notes } = req.body as {
      date?: string;
      invoice?: string;
      customer?: string;
      Amount?: number;
      paymentmode?: "Cash" | "Bank Transfer" | "Credit Card" | "UPI";
      reference?: string;
      notes?: string;
    };

    if (!date || !invoice || !customer || !paymentmode || Amount === undefined) {
      res.status(400).json({ message: "Date, invoice, customer, amount and payment mode are required" });
      return;
    }

    if (!Number.isFinite(Number(Amount)) || Number(Amount) <= 0) {
      res.status(400).json({ message: "Amount must be greater than 0" });
      return;
    }

    const payment = await Payment.create({
      companyId,
      userId: req.userId!,
      date,
      invoice,
      customer,
      Amount: Number(Amount),
      paymentmode,
      reference: reference || "",
      notes: notes || "",
    });

    res.status(201).json({ message: "Payment created successfully", payment });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ message: "Server error while creating payment" });
  }
};

// GET /api/payments
export const getPayments = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const search = req.query.search as string;

    let filter: any = { companyId, userId: req.userId! };
    
    if (search) {
      filter.$or = [
        { customer: { $regex: search, $options: "i" } },
        { invoice: { $regex: search, $options: "i" } },
        { reference: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ message: "Server error while fetching payments" });
  }
};

// GET /api/payments/:id
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { id } = req.params;

    const payment = await Payment.findOne({ _id: id, companyId, userId: req.userId! });
    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    res.json({ payment });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ message: "Server error while fetching payment" });
  }
};

// PUT /api/payments/:id
export const updatePayment = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { id } = req.params;

    const updatePayload = req.body as {
      date?: string;
      invoice?: string;
      customer?: string;
      Amount?: number;
      paymentmode?: "Cash" | "Bank Transfer" | "Credit Card" | "UPI";
      reference?: string;
      notes?: string;
    };

    if (updatePayload.Amount !== undefined && (!Number.isFinite(Number(updatePayload.Amount)) || Number(updatePayload.Amount) <= 0)) {
      res.status(400).json({ message: "Amount must be greater than 0" });
      return;
    }

    const payment = await Payment.findOneAndUpdate(
      { _id: id, companyId, userId: req.userId! },
      {
        $set: {
          ...updatePayload,
          ...(updatePayload.Amount !== undefined ? { Amount: Number(updatePayload.Amount) } : {}),
        },
      },
      { new: true, runValidators: true }
    );

    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    res.json({ message: "Payment updated successfully", payment });
  } catch (error) {
    console.error("Update payment error:", error);
    res.status(500).json({ message: "Server error while updating payment" });
  }
};

// DELETE /api/payments/:id
export const deletePayment = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    const { id } = req.params;

    const payment = await Payment.findOneAndDelete({ _id: id, companyId, userId: req.userId! });
    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Delete payment error:", error);
    res.status(500).json({ message: "Server error while deleting payment" });
  }
};
