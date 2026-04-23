import { Request, Response } from "express";
import {
  getSalesReport,
  getInventoryReport,
  getCustomerReport,
  getPaymentReport,
  getGSTReport,
  getProfitLossReport,
} from "../services/reportService.js";

/**
 * GET /api/reports/sales
 * Sales report with aggregation of invoices
 */
export const getSalesReportHandler = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate, customerId, limit = 100, skip = 0 } = req.query;

    const report = await getSalesReport({
      userId: req.userId!,
      fromDate: fromDate as string,
      toDate: toDate as string,
      customerId: customerId as string,
      limit: parseInt(limit as string) || 100,
      skip: parseInt(skip as string) || 0,
    });

    res.json(report);
  } catch (error) {
    console.error("Sales report error:", error);
    res.status(500).json({ message: "Failed to generate sales report" });
  }
};

/**
 * GET /api/reports/inventory
 * Inventory report with stock valuation and movement
 */
export const getInventoryReportHandler = async (req: Request, res: Response) => {
  try {
    const { limit = 100, skip = 0 } = req.query;

    const report = await getInventoryReport({
      userId: req.userId!,
      limit: parseInt(limit as string) || 100,
      skip: parseInt(skip as string) || 0,
    });

    res.json(report);
  } catch (error) {
    console.error("Inventory report error:", error);
    res.status(500).json({ message: "Failed to generate inventory report" });
  }
};

/**
 * GET /api/reports/customer
 * Customer report with outstanding tracking
 */
export const getCustomerReportHandler = async (req: Request, res: Response) => {
  try {
    const { limit = 100, skip = 0 } = req.query;

    const report = await getCustomerReport({
      userId: req.userId!,
      limit: parseInt(limit as string) || 100,
      skip: parseInt(skip as string) || 0,
    });

    res.json(report);
  } catch (error) {
    console.error("Customer report error:", error);
    res.status(500).json({ message: "Failed to generate customer report" });
  }
};

/**
 * GET /api/reports/payment
 * Payment collection report
 */
export const getPaymentReportHandler = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate, customerId, limit = 100, skip = 0 } = req.query;

    const report = await getPaymentReport({
      userId: req.userId!,
      fromDate: fromDate as string,
      toDate: toDate as string,
      customerId: customerId as string,
      limit: parseInt(limit as string) || 100,
      skip: parseInt(skip as string) || 0,
    });

    res.json(report);
  } catch (error) {
    console.error("Payment report error:", error);
    res.status(500).json({ message: "Failed to generate payment report" });
  }
};

/**
 * GET /api/reports/gst
 * GST/Tax report for compliance
 */
export const getGSTReportHandler = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate } = req.query;

    const report = await getGSTReport({
      userId: req.userId!,
      fromDate: fromDate as string,
      toDate: toDate as string,
    });

    res.json(report);
  } catch (error) {
    console.error("GST report error:", error);
    res.status(500).json({ message: "Failed to generate GST report" });
  }
};

/**
 * GET /api/reports/profit-loss
 * Profit & Loss statement
 */
export const getProfitLossReportHandler = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate } = req.query;

    const report = await getProfitLossReport({
      userId: req.userId!,
      fromDate: fromDate as string,
      toDate: toDate as string,
    });

    res.json(report);
  } catch (error) {
    console.error("P&L report error:", error);
    res.status(500).json({ message: "Failed to generate profit & loss report" });
  }
};

/**
 * GET /api/reports/dashboard
 * Comprehensive dashboard with key metrics
 */
export const getDashboardReportHandler = async (req: Request, res: Response) => {
  try {
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - 1);
    const currentMonth = fromDate.toISOString().split("T")[0];

    const [salesReport, customerReport, paymentReport, inventoryReport] = await Promise.all([
      getSalesReport({ userId: req.userId!, limit: 5, skip: 0 }),
      getCustomerReport({ userId: req.userId!, limit: 5, skip: 0 }),
      getPaymentReport({ userId: req.userId!, limit: 5, skip: 0 }),
      getInventoryReport({ userId: req.userId!, limit: 5, skip: 0 }),
    ]);

    res.json({
      sales: salesReport.summary,
      customers: customerReport.summary,
      payments: paymentReport.summary,
      inventory: inventoryReport.summary,
      recentTransactions: {
        sales: salesReport.detailedInvoices,
        payments: paymentReport.detailedPayments,
      },
    });
  } catch (error) {
    console.error("Dashboard report error:", error);
    res.status(500).json({ message: "Failed to generate dashboard report" });
  }
};
