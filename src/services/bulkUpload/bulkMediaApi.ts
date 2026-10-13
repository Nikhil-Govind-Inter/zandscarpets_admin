import { apiFetch } from "@/lib/apiClient";
import { BULK_UPLOAD_API_URL, BulkUploadApiError } from "./bulkUploadApi";

// Bulk media upload for the spreadsheet wizard: many files in one request,
// returning the stored path each sheet row needs to paste into main_image /
// list_image / media_path. Modeled on src/services/details/mediaApi.ts.

export type BulkMediaType = "products" | "products-variants";

export interface BulkMediaFileResult {
  originalName: string | null;
  storedPath?: string;
  previewUrl?: string;
  status: "success" | "failed";
  error?: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}
interface ApiErrorEnvelope {
  success: false;
  error?: { message?: string; code?: string };
  message?: string;
}

export const uploadBulkMedia = async (type: BulkMediaType, files: File[]): Promise<BulkMediaFileResult[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await apiFetch(`${BULK_UPLOAD_API_URL}/media?type=${type}`, {
    method: "POST",
    body: formData,
  });
  const body = await response.json().catch(() => ({}) as ApiEnvelope<{ files: BulkMediaFileResult[] }> & ApiErrorEnvelope);
  if (!response.ok || !body.success) {
    const errorBody = body as ApiErrorEnvelope;
    throw new BulkUploadApiError(errorBody.error?.message || errorBody.message || "Upload failed", errorBody.error?.code);
  }
  return (body as ApiEnvelope<{ files: BulkMediaFileResult[] }>).data.files;
};
