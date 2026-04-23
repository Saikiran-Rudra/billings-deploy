const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["application/pdf", "image/png", "image/jpeg"] as const;
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type UploadDocumentType = "gst" | "pan";

interface UploadResponse {
  url?: string;
  data?: {
    url?: string;
  };
  message?: string;
}

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token") || localStorage.getItem("auth_token");
};

export const validateUploadFile = (file: File): string | null => {
  if (!ALLOWED_FILE_TYPES.includes(file.type as (typeof ALLOWED_FILE_TYPES)[number])) {
    return "Only PDF, JPG, PNG allowed";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "File must be less than 5MB";
  }

  return null;
};

export const handleFileUpload = async (
  file: File,
  type: UploadDocumentType
): Promise<string> => {
  const validationError = validateUploadFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const data = (await response.json().catch(() => ({}))) as UploadResponse;

  if (!response.ok) {
    throw new Error(data.message || "Upload failed");
  }

  const url = data.url || data.data?.url;

  if (!url) {
    throw new Error("Upload failed");
  }

  return url;
};

export { ALLOWED_FILE_TYPES, MAX_FILE_SIZE };
