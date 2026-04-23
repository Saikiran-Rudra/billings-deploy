import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  getSalesReportHandler,
  getInventoryReportHandler,
  getCustomerReportHandler,
  getPaymentReportHandler,
  getGSTReportHandler,
  getProfitLossReportHandler,
  getDashboardReportHandler,
} from "../controllers/report.controller.js";

const router = Router();

// All report endpoints require authentication
router.use(authMiddleware);

/**
 * Sales Report
 * GET /api/reports/sales?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD&customerId=xxx&limit=100&skip=0
 */
router.get("/sales", getSalesReportHandler);

/**
 * Inventory Report
 * GET /api/reports/inventory?limit=100&skip=0
 */
router.get("/inventory", getInventoryReportHandler);

/**
 * Customer Report
 * GET /api/reports/customer?limit=100&skip=0
 */
router.get("/customer", getCustomerReportHandler);

/**
 * Payment Report
 * GET /api/reports/payment?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD&customerId=xxx&limit=100&skip=0
 */
router.get("/payment", getPaymentReportHandler);

/**
 * GST/Tax Report
 * GET /api/reports/gst?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
 */
router.get("/gst", getGSTReportHandler);

/**
 * Profit & Loss Report
 * GET /api/reports/profit-loss?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
 */
router.get("/profit-loss", getProfitLossReportHandler);

/**
 * Dashboard Report - Summary metrics
 * GET /api/reports/dashboard
 */
router.get("/dashboard", getDashboardReportHandler);

export default router;
