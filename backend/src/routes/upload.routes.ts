import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.js";
import { uploadDocument } from "../controllers/upload.controller.js";
import { ALLOWED_UPLOAD_TYPES } from "../services/upload.service.js";
import AppError from "../utils/AppError.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_UPLOAD_TYPES.includes(file.mimetype as (typeof ALLOWED_UPLOAD_TYPES)[number])) {
      callback(new AppError(400, "Only PDF, JPG, PNG allowed"));
      return;
    }

    callback(null, true);
  },
});

router.post("/", authMiddleware, upload.single("file"), uploadDocument);

export default router;
