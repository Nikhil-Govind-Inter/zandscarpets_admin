import { apiFetch } from "@/lib/apiClient";
import {
  PRODUCTS_API_URL,
  parseEnvelope,
  listParams,
  PaginatedListResponse,
} from "./productsApiClient";

export { ApiError } from "./productsApiClient";

// Products > Data Sheets — backed by `/api/backend/products/product-data-sheet`.
// One PDF per product (columns on the products row, not a separate table).
// Keyed by product_id, not its own id — upload/replace auto-replaces the
// existing file, so there is no separate create vs. update call.

const BASE_URL = `${PRODUCTS_API_URL}/product-data-sheet`;

export interface ProductDataSheetRecord {
  id: number;
  title: string;
  data_sheet_path: string | null;
  data_sheet_original_filename: string | null;
  data_sheet_size_bytes: number | null;
  data_sheet_mime_type: string | null;
  updatedAt?: string;
}

export const fetchProductDataSheets = (page: number, limit: number, search?: string) =>
  apiFetch(`${BASE_URL}?${listParams(page, limit, search)}`).then((r) =>
    parseEnvelope<PaginatedListResponse<ProductDataSheetRecord>["data"]>(r),
  );

export const fetchProductDataSheetByProduct = (productId: number) =>
  apiFetch(`${BASE_URL}/${productId}`).then((r) => parseEnvelope<ProductDataSheetRecord>(r));

export const uploadProductDataSheet = (productId: number, file: File) => {
  const formData = new FormData();
  formData.append("file_path", file);
  return apiFetch(`${BASE_URL}/${productId}`, { method: "PUT", body: formData }).then((r) =>
    parseEnvelope<ProductDataSheetRecord>(r),
  );
};

export const removeProductDataSheet = (productId: number) =>
  apiFetch(`${BASE_URL}/${productId}`, { method: "DELETE" }).then((r) =>
    parseEnvelope<{ id: number }>(r),
  );
