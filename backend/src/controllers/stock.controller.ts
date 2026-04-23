import { Request, Response } from "express";
import mongoose from "mongoose";
import { StockService } from "../services/stockService.js";
import { ProductService } from "../services/productService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { BadRequestError, NotFoundError } from "../utils/AppError.js";

/**
 * Stock Controller - Production Ready
 * Handles all stock management HTTP requests
 * Uses asyncHandler for error management and custom error classes
 */

/**
 * GET /api/stock/list
 * Get paginated stock list with optional filters (search, category, low stock)
 */
export const getStockList = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const companyId = (req as any).companyId;
    const { page = 1, limit = 20, search = "", category = "", lowStockOnly = false } = req.query;

    const stocks = await StockService.getStockList(req.userId!, companyId, Number(page), Number(limit), {
      search: search as string,
      category: category as string,
      lowStockOnly: lowStockOnly === "true",
    });

    res.status(200).json({
      success: true,
      ...stocks,
    });
  }
);

/**
 * GET /api/stock/ledger/:productId
 * Get stock transaction history (ledger) for a specific product
 */
export const getStockLedger = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const companyId = (req as any).companyId;
    const productId = (req.params.productId as string);
    const { page = 1, limit = 50 } = req.query;

    // Verify product exists and belongs to user
    const product = await ProductService.getProductById(req.userId!, productId, companyId).catch(() => null);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const ledger = await StockService.getProductStockLedger(
      req.userId!,
      companyId,
      productId,
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      success: true,
      productName: product.productName,
      sku: product.sku,
      ...ledger,
    });
  }
);

/**
 * GET /api/stock/low-stock
 * Get all products with current stock below minimum threshold
 */
export const getLowStockProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const companyId = (req as any).companyId;
    const products = await StockService.getLowStockProducts(req.userId!, companyId);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  }
);

/**
 * GET /api/stock/summary-by-category
 * Get stock analysis grouped by category (total items, stock value, avg)
 */
export const getStockSummaryByCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const companyId = (req as any).companyId;
    const summary = await StockService.getStockSummaryByCategory(req.userId!, companyId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  }
);

/**
 * GET /api/stock/report
 * Generate comprehensive stock report with statistics
 */
export const generateStockReport = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const companyId = (req as any).companyId;
    const report = await StockService.generateStockReport(req.userId!, companyId);

    res.status(200).json({
      success: true,
      data: report,
    });
  }
);
