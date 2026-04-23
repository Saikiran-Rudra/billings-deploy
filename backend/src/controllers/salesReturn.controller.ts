import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as salesReturnService from "../services/salesReturn.service.js";

/**
 * Sales Return Controller
 *
 * Rules followed:
 * ✅ No business logic
 * ✅ No validation logic
 * ✅ No try-catch (handled by asyncHandler + errorHandler middleware)
 * ✅ Only: extract data from req → call service → send response
 */

// POST /api/sales-returns
export const createSalesReturn = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = (req as any).companyId;
    const salesReturn = await salesReturnService.createSalesReturn(
      req.userId!,
      { ...req.body, companyId }
    );

    res
      .status(201)
      .json({ message: "Sales return created successfully", salesReturn });
  }
);

// GET /api/sales-returns
export const getSalesReturns = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = (req as any).companyId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const search = req.query.search as string;
    const status = req.query.status as string;

    const result = await salesReturnService.getAllSalesReturns(
      companyId,
      page,
      limit,
      search,
      status
    );

    res.json(result);
  }
);

// GET /api/sales-returns/:id
export const getSalesReturnById = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = (req as any).companyId;
    const id = req.params.id as string;

    const salesReturn = await salesReturnService.getSalesReturnById(companyId, id);

    res.json({ salesReturn });
  }
);

// PUT /api/sales-returns/:id
export const updateSalesReturn = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = (req as any).companyId;
    const id = req.params.id as string;

    const salesReturn = await salesReturnService.updateSalesReturn(
      companyId,
      id,
      { ...req.body, companyId }
    );

    res.json({ message: "Sales return updated successfully", salesReturn });
  }
);

// DELETE /api/sales-returns/:id
export const deleteSalesReturn = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = (req as any).companyId;
    const id = req.params.id as string;

    await salesReturnService.deleteSalesReturn(companyId, id);

    res.json({ message: "Sales return deleted successfully" });
  }
);
