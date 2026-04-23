import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import companyRoutes from "./routes/company.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import reportRoutes from "./routes/report.routes.js";
import salesReturnRoutes from "./routes/salesReturn.routes.js";
import configRoutes from "./routes/config.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import errorHandler from "./middleware/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import expenses from "./routes/expenses.route.js";
import purchaseRoutes from "./routes/purchase.routes.js";
import licenseRoutes from "./routes/license.route.js";

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://hisaab-kitaab-v2-frontend.vercel.app",
    ];

    if (
      allowedOrigins.includes(origin) ||
      origin.includes("ngrok")
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"
],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello, World!" });
});

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//Request logging middleware (for debugging)
app.use((req,res,next)=>{
  console.log('\n[API HIT]', req.method, req.path);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
})
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/products", productRoutes);
app.use("/api/config/products", configRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/sales-returns", salesReturnRoutes);
app.use("/api/expenses", expenses);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/licenses", licenseRoutes);
// Global error handler (must be AFTER all routes)
app.use(errorHandler);

export default app;
