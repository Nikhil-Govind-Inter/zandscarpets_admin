import { apiFetch } from "@/lib/apiClient";
import { createCrudApi, parseEnvelope, ApiError, listParams } from "@/services/products/productsApiClient";
import type { PaginatedListResponse } from "@/services/products/productsApiClient";

// Shared plumbing for every Dynamic Details service (detail fields, media,
// mappings, variant actions) — backed by `/api/backend/details/*`.
export { createCrudApi, parseEnvelope, ApiError, apiFetch, listParams };
export type { PaginatedListResponse };
export const DETAILS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/details`;
