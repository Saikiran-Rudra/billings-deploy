import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { SKUGeneratorService } from "../services/skuGeneratorService.js";

// POST /api/products/generate-sku - Generate SKU based on product type and category
export const generateSKU = async (req: Request, res: Response) => {
  try {
    const { productType, categoryName } = req.body;

    if (!productType || !categoryName) {
      res.status(400).json({ message: "Product type and category name are required" });
      return;
    }

    const categoryCode = SKUGeneratorService.generateCategoryCode(categoryName);
    const sku = await SKUGeneratorService.generateSKU({
      productType: productType as "goods" | "service",
      categoryCode,
      categoryName,
    });

    res.status(200).json({
      sku,
      categoryCode,
      format: "PRD-{TYPE}-{CATEGORY_CODE}-{SEQUENCE}",
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating SKU", error });
  }
};

// GET /api/products/next-sku - Generate next SKU for a category (simple format: PREFIX-XXX)
export const getNextSKU = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const companyId = (req as any).companyId;

    if (!category) {
      res.status(400).json({ message: "Category is required" });
      return;
    }

    if (!companyId) {
      res.status(400).json({ message: "Company context is required" });
      return;
    }

    const sku = await SKUGeneratorService.generateSimpleSKU(
      category as string,
      companyId as string
    );

    res.status(200).json({
      success: true,
      data: { sku },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating SKU",
      error,
    });
  }
};

// GET /api/products - Get all products with pagination and filtering
export const getProducts = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    
    if (!companyId) {
      res.status(400).json({ message: "Company context is required" });
      return;
    }

    const { page = 1, limit = 20, category = "", search = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Always filter by companyId for multi-tenant isolation (NOT userId - allows all company users to see)
    const filter: Record<string, unknown> = { companyId };

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .populate("companyId", "name email")
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// GET /api/products/:id - Get product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).companyId;
    
    if (!companyId) {
      res.status(400).json({ message: "Company context is required" });
      return;
    }

    const { id } = req.params;

    const product = await Product.findOne({ _id: id, companyId })
      .populate("companyId", "name email")
      .populate("userId", "firstName lastName email");

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};

// POST /api/products - Create new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    // Extract company context from middleware
    const companyId = (req as any).companyId;
    
    if (!companyId) {
      res.status(400).json({ message: "Company context is required" });
      return;
    }

    const {
      productName,
      sku,
      category,
      productType = "goods",
      description,
      salePrice,
      purchasePrice,
      taxType = "exclusive",
      barcode,
      unit,
      gst,
      status,
    } = req.body;

    // Validation
    if (!productName || !sku || salePrice === undefined) {
      res.status(400).json({ message: "Product name, SKU, and sale price are required" });
      return;
    }

    // Purchase price is required for goods, optional for services
    if (productType === "goods" && purchasePrice === undefined) {
      res.status(400).json({ message: "Purchase price is required for goods" });
      return;
    }

    // Check for duplicate SKU within company (not globally)
    // Convert companyId string to ObjectId for proper matching
    const companyObjectId = new mongoose.Types.ObjectId(companyId);
    const existingProduct = await Product.findOne({ sku, companyId: companyObjectId });
    if (existingProduct) {
      res.status(409).json({ message: "Product with this SKU already exists in your company" });
      return;
    }

    // Calculate profit margin (only for goods with purchase price)
    const profitMargin = productType === "goods" && purchasePrice ? Number(salePrice) - Number(purchasePrice) : 0;
    
    const product = await Product.create({
      companyId: companyObjectId,  // Inject from middleware as ObjectId
      userId: req.userId!,
      productName,
      sku,
      category: category || "",
      productType: productType || "goods",
      description: description || "",
      salePrice: Number(salePrice),
      purchasePrice: productType === "goods" ? Number(purchasePrice) : undefined,
      profitMargin,
      taxType: taxType || "exclusive",
      barcode: barcode || undefined,
      unit: unit || "Pcs",
      gst: gst !== undefined ? Number(gst) : undefined,
      status: status || "active",
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: number }).code === 11000) {
      res.status(409).json({ message: "Product with this SKU already exists" });
      return;
    }
    res.status(500).json({ message: "Error creating product", error });
  }
};

// PUT /api/products/:id - Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      productName,
      sku,
      category,
      productType,
      description,
      salePrice,
      purchasePrice,
      taxType,
      barcode,
      unit,
      gst,
      status,
    } = req.body;

    const companyObjectId = new mongoose.Types.ObjectId((req as any).companyId);
    
    const product = await Product.findOne({ _id: id, companyId: companyObjectId });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Check if SKU is being changed and if new SKU already exists within company
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku, companyId: companyObjectId });
      if (existingProduct) {
        res.status(409).json({ message: "Another product with this SKU already exists in your company" });
        return;
      }
    }

    // Update fields
    if (productName) product.productName = productName;
    if (sku) product.sku = sku;
    if (category !== undefined) product.category = category;
    if (productType !== undefined) product.productType = productType;
    if (description !== undefined) product.description = description;
    if (salePrice !== undefined) product.salePrice = Number(salePrice);

    // Handle purchase price based on product type
    if (purchasePrice !== undefined && productType !== "service") {
      product.purchasePrice = Number(purchasePrice);
    } else if (productType === "service") {
      product.purchasePrice = undefined;
    }

    // Calculate profit margin if prices are updated (only for goods)
    if (productType === "goods" && (salePrice !== undefined || purchasePrice !== undefined)) {
      product.profitMargin = product.purchasePrice ? product.salePrice - product.purchasePrice : 0;
    } else if (productType === "service") {
      product.profitMargin = 0;
    }

    if (taxType !== undefined) product.taxType = taxType;
    if (barcode !== undefined) product.barcode = barcode || undefined;

    if (unit !== undefined) product.unit = unit;
    if (gst !== undefined) product.gst = gst === null || gst === undefined ? undefined : Number(gst);
    if (status !== undefined) product.status = status;

    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
};

// DELETE /api/products/:id - Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyObjectId = new mongoose.Types.ObjectId((req as any).companyId);

    const product = await Product.findOne({ _id: id, companyId: companyObjectId });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    await Product.deleteOne({ _id: id, companyId: companyObjectId });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};
