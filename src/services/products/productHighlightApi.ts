import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { apiFetch } from "@/lib/apiClient";

// Products > Highlights — backed by `/api/backend/products/product-highlight`.
// Uses the apiFetch + ApiError + envelope-parsing convention from pagesApi.ts.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HIGHLIGHTS_URL = `${API_BASE_URL}/products/product-highlight`;

export interface ProductHighlightRecord {
  id: number;
  title: string;
  title_ar: string;
  sort_order: number;
  is_active: boolean;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  statusCode?: number;
  timestamp?: string;
  data: T;
}

interface ApiErrorEnvelope {
  success: false;
  error?: {
    message?: string;
    code?: string;
    statusCode?: number;
    details?: unknown;
  };
  message?: string;
}

export class ApiError extends Error {
  code?: string;
  details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

const parseEnvelope = async <T>(
  response: Response,
): Promise<ApiEnvelope<T>> => {
  const body = await response
    .json()
    .catch(() => ({}) as ApiEnvelope<T> & ApiErrorEnvelope);
  if (!response.ok || !body.success) {
    const errorBody = body as ApiErrorEnvelope;
    const message =
      errorBody.error?.message ||
      errorBody.message ||
      `Request failed with status ${response.status}`;
    throw new ApiError(
      message,
      errorBody.error?.code,
      errorBody.error?.details,
    );
  }
  return body;
};

export interface ProductHighlightListResponse {
  data: {
    data: ProductHighlightRecord[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied?: boolean;
    };
  };
}

export interface ProductHighlightPayload {
  title: string;
  title_ar: string;
  sort_order: number;
  is_active: boolean;
}

// Fetcher shape matches usePaginatedList's `Fetcher<T>` contract.
export const fetchProductHighlightList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<ProductHighlightListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${HIGHLIGHTS_URL}?${params}`);
  return parseEnvelope<ProductHighlightListResponse["data"]>(response);
};

export const fetchProductHighlightById = async (
  id: number,
): Promise<{ data: ProductHighlightRecord }> => {
  const response = await apiFetch(`${HIGHLIGHTS_URL}/${id}`);
  return parseEnvelope<ProductHighlightRecord>(response);
};

// Source for the category form's highlight multi-select (active highlights only).
export const fetchActiveProductHighlights = async (): Promise<{
  data: Pick<ProductHighlightRecord, "id" | "title" | "title_ar">[];
}> => {
  const response = await apiFetch(`${HIGHLIGHTS_URL}/active`);
  return parseEnvelope<Pick<ProductHighlightRecord, "id" | "title" | "title_ar">[]>(
    response,
  );
};

export const createProductHighlight = async (
  payload: ProductHighlightPayload,
): Promise<{ data: ProductHighlightRecord }> => {
  const response = await apiFetch(HIGHLIGHTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<ProductHighlightRecord>(response);
};

export const updateProductHighlight = async (
  id: number,
  payload: ProductHighlightPayload,
): Promise<{ data: ProductHighlightRecord }> => {
  const response = await apiFetch(`${HIGHLIGHTS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<ProductHighlightRecord>(response);
};

export const deleteProductHighlight = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${HIGHLIGHTS_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

// Quick status toggle / sort-order change via the shared single-field CMS endpoints.
export const toggleProductHighlightStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("product-highlights", item.id!, isActive);

export const updateProductHighlightSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("product-highlights", item.id!, sortOrder);
