import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";

interface ReportFilters {
  userId: string;
  fromDate?: string;
  toDate?: string;
  customerId?: string;
  productId?: string;
  status?: string;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: -1 | 1;
}

interface DateRange {
  $gte?: string;
  $lte?: string;
}

/**
 * Helper function to build date filters
 */
const getDateFilter = (fromDate?: string, toDate?: string): DateRange => {
  const filter: DateRange = {};
  if (fromDate) filter.$gte = fromDate;
  if (toDate) filter.$lte = toDate;
  return Object.keys(filter).length > 0 ? filter : {};
};

/**
 * Sales Report - Using aggregation pipeline for performance
 */
export const getSalesReport = async (filters: ReportFilters) => {
  const { userId, fromDate, toDate, customerId, limit = 100, skip = 0 } = filters;
  const dateFilter = getDateFilter(fromDate, toDate);

  const matchStage = {
    userId: new mongoose.Types.ObjectId(userId),
    ...(dateFilter && { invoiceDate: dateFilter }),
    ...(customerId && { customerId: new mongoose.Types.ObjectId(customerId) }),
  };

  // Sales summary aggregation
  const salesSummary = await Invoice.aggregate([
    { $match: matchStage },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalSales: { $sum: "$total" },
              totalInvoices: { $sum: 1 },
              averageInvoiceValue: { $avg: "$total" },
              paidAmount: {
                $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$total", 0] },
              },
              pendingAmount: {
                $sum: {
                  $cond: [
                    { $in: ["$status", ["pending", "partially_paid", "overdue"]] },
                    "$total",
                    0,
                  ],
                },
              },
              draftCount: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
            },
          },
        ],
        byStatus: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              amount: { $sum: "$total" },
            },
          },
        ],
        topCustomers: [
          {
            $group: {
              _id: "$customerName",
              totalAmount: { $sum: "$total" },
              invoiceCount: { $sum: 1 },
              lastInvoiceDate: { $max: "$invoiceDate" },
            },
          },
          { $sort: { totalAmount: -1 } },
          { $limit: 10 },
        ],
        byDate: [
          {
            $group: {
              _id: { $substr: ["$invoiceDate", 0, 7] }, // YYYY-MM format
              totalSales: { $sum: "$total" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  // Detailed invoices
  const detailedInvoices = await Invoice.find(matchStage)
    .select("invoiceNumber invoiceDate customerName total status customerId")
    .sort({ invoiceDate: -1 })
    .limit(limit)
    .skip(skip)
    .lean();

  return {
    summary: salesSummary[0].summary[0] || {
      totalSales: 0,
      totalInvoices: 0,
      averageInvoiceValue: 0,
      paidAmount: 0,
      pendingAmount: 0,
      draftCount: 0,
    },
    byStatus: salesSummary[0].byStatus,
    topCustomers: salesSummary[0].topCustomers,
    byDate: salesSummary[0].byDate,
    detailedInvoices,
    pagination: { limit, skip, total: detailedInvoices.length },
  };
};

/**
 * Inventory Report - Stock levels, valuation, and movement
 */
export const getInventoryReport = async (filters: ReportFilters) => {
  const { userId, limit = 100, skip = 0 } = filters;

  const inventorySummary = await Product.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              totalStockValue: {
                $sum: { $multiply: ["$currentStock", "$purchasePrice"] },
              },
              lowStockCount: {
                $sum: {
                  $cond: [
                    { $lt: ["$currentStock", 5] },
                    1,
                    0,
                  ],
                },
              },
              activeProducts: {
                $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
              },
              inactiveProducts: {
                $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] },
              },
            },
          },
        ],
        byCategory: [
          {
            $group: {
              _id: "$category",
              productCount: { $sum: 1 },
              totalStock: { $sum: "$currentStock" },
              totalValue: {
                $sum: { $multiply: ["$currentStock", "$purchasePrice"] },
              },
              minStockItems: {
                $sum: {
                  $cond: [{ $lt: ["$currentStock", 5] }, 1, 0],
                },
              },
            },
          },
          { $sort: { totalValue: -1 } },
        ],
        lowStockProducts: [
          { $match: { $expr: { $lt: ["$currentStock", 5] } } },
          {
            $project: {
              productName: 1,
              sku: 1,
              currentStock: 1,
              unit: 1,
              category: 1,
              purchasePrice: 1,
            },
          },
          { $sort: { currentStock: 1 } },
          { $limit: 20 },
        ],
      },
    },
  ]);

  const allProducts = await Product.find({ userId: new mongoose.Types.ObjectId(userId) })
    .select(
      "productName sku category currentStock minStock openingStock purchasePrice salePrice unit"
    )
    .sort({ currentStock: -1 })
    .limit(limit)
    .skip(skip)
    .lean();

  return {
    summary: inventorySummary[0].summary[0] || {
      totalProducts: 0,
      totalStockValue: 0,
      lowStockCount: 0,
      activeProducts: 0,
      inactiveProducts: 0,
    },
    byCategory: inventorySummary[0].byCategory,
    lowStockProducts: inventorySummary[0].lowStockProducts,
    allProducts,
    pagination: { limit, skip, total: allProducts.length },
  };
};

/**
 * Customer Report - Outstanding, credit limit, and transaction history
 */
export const getCustomerReport = async (filters: ReportFilters) => {
  const { userId, limit = 100, skip = 0 } = filters;

  // Get customers with their outstanding amounts
  const customers = await Customer.find({
    userId: new mongoose.Types.ObjectId(userId),
    customerStatus: "active",
  })
    .select(
      "displayName email primaryPhone openingBalance creditLimit customerStatus"
    )
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();

  // Get customer statistics
  const customerStats = await Customer.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalCustomers: { $sum: 1 },
              activeCount: {
                $sum: { $cond: [{ $eq: ["$customerStatus", "active"] }, 1, 0] },
              },
              inactiveCount: {
                $sum: { $cond: [{ $eq: ["$customerStatus", "inactive"] }, 1, 0] },
              },
              totalOpeningBalance: { $sum: "$openingBalance" },
              totalCreditLimit: { $sum: "$creditLimit" },
            },
          },
        ],
        byStatus: [
          {
            $group: {
              _id: "$customerStatus",
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  // Get customer transaction summary
  const customerTransactions = await Invoice.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$customerName",
        totalInvoices: { $sum: 1 },
        totalSales: { $sum: "$total" },
        lastTransactionDate: { $max: "$invoiceDate" },
        paidAmount: {
          $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$total", 0] },
        },
        pendingAmount: {
          $sum: {
            $cond: [
              { $in: ["$status", ["pending", "partially_paid", "overdue"]] },
              "$total",
              0,
            ],
          },
        },
      },
    },
    { $sort: { totalSales: -1 } },
    { $limit: 20 },
  ]);

  return {
    summary: customerStats[0].summary[0] || {
      totalCustomers: 0,
      activeCount: 0,
      inactiveCount: 0,
      totalOpeningBalance: 0,
      totalCreditLimit: 0,
    },
    byStatus: customerStats[0].byStatus,
    topCustomers: customerTransactions,
    customers,
    pagination: { limit, skip, total: customers.length },
  };
};

/**
 * Payment Report - Payment modes, collections tracking
 */
export const getPaymentReport = async (filters: ReportFilters) => {
  const { userId, fromDate, toDate, customerId, limit = 100, skip = 0 } = filters;
  const dateFilter = getDateFilter(fromDate, toDate);

  const matchStage = {
    userId: new mongoose.Types.ObjectId(userId),
    ...(dateFilter && { date: dateFilter }),
    ...(customerId && { customerId: new mongoose.Types.ObjectId(customerId) }),
  };

  const paymentSummary = await Payment.aggregate([
    { $match: matchStage },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalPayments: { $sum: "$Amount" },
              totalTransactions: { $sum: 1 },
              averagePayment: { $avg: "$Amount" },
              maxPayment: { $max: "$Amount" },
              minPayment: { $min: "$Amount" },
            },
          },
        ],
        byPaymentMode: [
          {
            $group: {
              _id: "$paymentmode",
              totalAmount: { $sum: "$Amount" },
              count: { $sum: 1 },
              averageAmount: { $avg: "$Amount" },
            },
          },
          { $sort: { totalAmount: -1 } },
        ],
        byCustomer: [
          {
            $group: {
              _id: "$customer",
              totalPayments: { $sum: "$Amount" },
              paymentCount: { $sum: 1 },
              lastPaymentDate: { $max: "$date" },
            },
          },
          { $sort: { totalPayments: -1 } },
          { $limit: 10 },
        ],
        byDate: [
          {
            $group: {
              _id: { $substr: ["$date", 0, 7] },
              totalAmount: { $sum: "$Amount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  const detailedPayments = await Payment.find(matchStage)
    .select("date invoice customer Amount paymentmode reference")
    .sort({ date: -1 })
    .limit(limit)
    .skip(skip)
    .lean();

  return {
    summary: paymentSummary[0].summary[0] || {
      totalPayments: 0,
      totalTransactions: 0,
      averagePayment: 0,
      maxPayment: 0,
      minPayment: 0,
    },
    byPaymentMode: paymentSummary[0].byPaymentMode,
    byCustomer: paymentSummary[0].byCustomer,
    byDate: paymentSummary[0].byDate,
    detailedPayments,
    pagination: { limit, skip, total: detailedPayments.length },
  };
};

/**
 * GST / Tax Report - Tax calculations and compliance
 */
export const getGSTReport = async (filters: ReportFilters) => {
  const { userId, fromDate, toDate, limit = 100, skip = 0 } = filters;
  const dateFilter = getDateFilter(fromDate, toDate);

  const matchStage = {
    userId: new mongoose.Types.ObjectId(userId),
    ...(dateFilter && { invoiceDate: dateFilter }),
  };

  // Sales GST aggregation
  const salesGST = await Invoice.aggregate([
    { $match: matchStage },
    { $unwind: "$lineItems" },
    {
      $group: {
        _id: "$lineItems.gst",
        totalAmount: { $sum: "$lineItems.amount" },
        totalGST: {
          $sum: {
            $multiply: [
              "$lineItems.amount",
              { $divide: ["$lineItems.gst", 100] },
            ],
          },
        },
        invoiceCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Purchase GST aggregation
  const purchaseGST = await Purchase.aggregate([
    { $match: matchStage },
    { $unwind: "$lineItems" },
    {
      $group: {
        _id: "$lineItems.gst",
        totalAmount: { $sum: "$lineItems.amount" },
        totalGST: {
          $sum: {
            $multiply: [
              "$lineItems.amount",
              { $divide: ["$lineItems.gst", 100] },
            ],
          },
        },
        invoiceCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Total summary
  const totalSalesGST = salesGST.reduce((sum, item) => sum + (item.totalGST || 0), 0);
  const totalPurchaseGST = purchaseGST.reduce((sum, item) => sum + (item.totalGST || 0), 0);

  return {
    salesGST,
    purchaseGST,
    summary: {
      totalSalesGST,
      totalPurchaseGST,
      netGSTPayable: Math.max(0, totalSalesGST - totalPurchaseGST),
      netGSTRefundable: Math.max(0, totalPurchaseGST - totalSalesGST),
    },
  };
};

/**
 * Profit & Loss Report - Income statement analysis
 */
export const getProfitLossReport = async (filters: ReportFilters) => {
  const { userId, fromDate, toDate } = filters;
  const dateFilter = getDateFilter(fromDate, toDate);

  const matchStage = {
    userId: new mongoose.Types.ObjectId(userId),
    ...(dateFilter && { invoiceDate: dateFilter, purchaseDate: dateFilter }),
  };

  // Revenue from sales
  const salesData = await Invoice.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), ...(dateFilter && { invoiceDate: dateFilter }) } },
    {
      $group: {
        _id: null,
        grossRevenue: { $sum: "$subtotal" },
        discounts: { $sum: "$discountValue" },
        taxes: { $sum: "$taxAmount" },
        netRevenue: { $sum: "$total" },
      },
    },
  ]);

  // Cost of goods sold
  const purchaseData = await Purchase.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), ...(dateFilter && { purchaseDate: dateFilter }) } },
    {
      $group: {
        _id: null,
        totalCost: { $sum: "$total" },
        purchaseTax: { $sum: "$taxAmount" },
      },
    },
  ]);

  const sales = salesData[0] || {
    grossRevenue: 0,
    discounts: 0,
    taxes: 0,
    netRevenue: 0,
  };
  const purchases = purchaseData[0] || { totalCost: 0, purchaseTax: 0 };

  const grossProfit = sales.netRevenue - purchases.totalCost;
  const grossProfitMargin = sales.netRevenue > 0 ? (grossProfit / sales.netRevenue) * 100 : 0;

  return {
    revenue: {
      grossRevenue: sales.grossRevenue,
      discounts: sales.discounts,
      taxes: sales.taxes,
      netRevenue: sales.netRevenue,
    },
    costOfSales: {
      totalCost: purchases.totalCost,
      purchaseTax: purchases.purchaseTax,
    },
    profitAnalysis: {
      grossProfit,
      grossProfitMargin: Number(grossProfitMargin.toFixed(2)),
    },
  };
};
