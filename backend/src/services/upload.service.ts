import AppError from "../utils/AppError.js";

export const ALLOWED_UPLOAD_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
] as const;

export type UploadDocumentType = "gst" | "pan";

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

interface ImageKitUploadResponse {
  url?: string;
  message?: string;
}

const getImageKitAuthHeader = () => {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!privateKey) {
    throw new AppError(500, "ImageKit is not configured");
  }

  return `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`;
};

export const uploadService = {
  validateFile(file: Express.Multer.File | undefined) {
    if (!file) {
      throw new AppError(400, "File is required");
    }

    if (!ALLOWED_UPLOAD_TYPES.includes(file.mimetype as (typeof ALLOWED_UPLOAD_TYPES)[number])) {
      throw new AppError(400, "Only PDF, JPG, PNG allowed");
    }
  },

  async uploadDocument(file: Express.Multer.File, type: UploadDocumentType): Promise<string> {
    this.validateFile(file);

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
    const extension = file.originalname.includes(".")
      ? file.originalname.slice(file.originalname.lastIndexOf("."))
      : "";

    formData.append("file", blob, file.originalname);
    formData.append("fileName", `${type}_${Date.now()}${extension}`);
    formData.append("folder", `/documents/${type}`);

    const response = await fetch(IMAGEKIT_UPLOAD_URL, {
      method: "POST",
      headers: {
        Authorization: getImageKitAuthHeader(),
      },
      body: formData,
    });

    const payload = (await response.json().catch(() => ({}))) as ImageKitUploadResponse;

    if (!response.ok || !payload.url) {
      throw new AppError(502, payload.message || "ImageKit upload failed");
    }

    return payload.url;
  },
};
