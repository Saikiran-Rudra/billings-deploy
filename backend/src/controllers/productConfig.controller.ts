import { Request, Response } from "express";
import { ProductConfigService } from "../services/productConfigService.js";

/**
 * Product Config Controller
 * Handles config-related requests
 */

// GET /api/config/products
export const getProductConfig = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const config = await ProductConfigService.getOrCreateConfig(userId);

    res.status(200).json({
      config,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching product config",
      error,
    });
  }
};

// PUT /api/config/products
export const updateProductConfig = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const data = req.body;

    const config = await ProductConfigService.updateConfig(userId, data);

    if (!config) {
      res.status(404).json({
        message: "Config not found",
      });
      return;
    }

    res.status(200).json({
      message: "Config updated successfully",
      config,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating product config",
      error,
    });
  }
};

// POST /api/config/products/categories
export const addCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { category } = req.body;

    if (!category) {
      res.status(400).json({
        message: "Category is required",
      });
      return;
    }

    const config = await ProductConfigService.addCategory(userId, category);

    if (!config) {
      res.status(404).json({
        message: "Config not found",
      });
      return;
    }

    res.status(201).json({
      message: "Category added successfully",
      config,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding category",
      error,
    });
  }
};

// DELETE /api/config/products/categories/:category
export const removeCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { category } = req.params;

    const config = await ProductConfigService.removeCategory(userId, category as string);

    if (!config) {
      res.status(404).json({
        message: "Config not found",
      });
      return;
    }

    res.status(200).json({
      message: "Category removed successfully",
      config,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error removing category",
      error,
    });
  }
};

// POST /api/config/products/units
export const addUnit = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { unit } = req.body;

    if (!unit) {
      res.status(400).json({
        message: "Unit is required",
      });
      return;
    }

    const config = await ProductConfigService.addUnit(userId, unit);

    if (!config) {
      res.status(404).json({
        message: "Config not found",
      });
      return;
    }

    res.status(201).json({
      message: "Unit added successfully",
      config,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding unit",
      error,
    });
  }
};

// DELETE /api/config/products/units/:unit
export const removeUnit = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { unit } = req.params;

    const config = await ProductConfigService.removeUnit(userId, unit as string);

    if (!config) {
      res.status(404).json({
        message: "Config not found",
      });
      return;
    }

    res.status(200).json({
      message: "Unit removed successfully",
      config,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error removing unit",
      error,
    });
  }
};

// PUT /api/config/products/gst-rates
export const updateGstRates = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { rates } = req.body;

    if (!Array.isArray(rates)) {
      res.status(400).json({
        message: "Rates must be an array",
      });
      return;
    }

    const config = await ProductConfigService.updateGstRates(userId, rates);

    if (!config) {
      res.status(404).json({
        message: "Config not found",
      });
      return;
    }

    res.status(200).json({
      message: "GST rates updated successfully",
      config,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating GST rates",
      error,
    });
  }
};

// PUT /api/config/products/sku-settings
export const updateSkuSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { prefix, sequence } = req.body;

    if (!prefix || sequence === undefined) {
      res.status(400).json({
        message: "Prefix and sequence are required",
      });
      return;
    }

    const config = await ProductConfigService.updateSkuSettings(
      userId,
      prefix,
      sequence
    );

    if (!config) {
      res.status(404).json({
        message: "Config not found",
      });
      return;
    }

    res.status(200).json({
      message: "SKU settings updated successfully",
      config,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating SKU settings",
      error,
    });
  }
};
