import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { apiFetch } from "@/lib/apiClient";

// Products > Categories — backed by `/api/backend/products/product-category`.
// File upload via FormData (media_path); envelope parsing follows the
// apiFetch + ApiError convention from pagesApi.ts.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CATEGORIES_URL = `${API_BASE_URL}/products/product-category`;

export interface ProductCategoryHighlightRef {
  id: number;
  title: string;
  title_ar: string;
  is_active: boolean;
}

export interface ProductCategoryRecord {
  id: number;
  parent_id: number | null;
  industry_id: number;
  title: string;
  title_ar: string;
  description: string | null;
  description_ar: string | null;
  material_type: string | null;
  material_type_ar: string | null;
  media_path: string | null;
  is_active: boolean;
  sort_order: number;
  industry?: { id: number; title: string } | null;
  parent?: { id: number; title: string } | null;
  children?: { id: number; title?: string; is_active?: boolean }[];
  highlights?: ProductCategoryHighlightRef[];
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Flat row from `/active`, used to build the parent-category tree select.
export interface ProductCategoryOption {
  id: number;
  title: string;
  parent_id: number | null;
  industry_id: number;
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

export interface ProductCategoryListResponse {
  data: {
    data: ProductCategoryRecord[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied?: boolean;
    };
  };
}

export interface ProductCategoryFilters {
  type?: "category" | "subcategory";
  parent_id?: number;
}

// Fetcher shape matches usePaginatedList's `Fetcher<T>` contract.
export const fetchProductCategoryList = async (
  page: number,
  limit: number,
  search?: string,
  filters?: ProductCategoryFilters,
): Promise<ProductCategoryListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }
  if (filters?.type) params.append("type", filters.type);
  if (filters?.parent_id) params.append("parent_id", String(filters.parent_id));

  const response = await apiFetch(`${CATEGORIES_URL}?${params}`);
  return parseEnvelope<ProductCategoryListResponse["data"]>(response);
};

export const fetchProductCategoryById = async (
  id: number,
): Promise<{ data: ProductCategoryRecord }> => {
  const response = await apiFetch(`${CATEGORIES_URL}/${id}`);
  return parseEnvelope<ProductCategoryRecord>(response);
};

// Parent-category picker source. Pass the category being edited so it and its
// whole subtree are excluded (a category can't be moved under itself).
export const fetchActiveProductCategories = async (
  excludeId?: number,
): Promise<{ data: ProductCategoryOption[] }> => {
  const query = excludeId ? `?excludeId=${excludeId}` : "";
  const response = await apiFetch(`${CATEGORIES_URL}/active${query}`);
  return parseEnvelope<ProductCategoryOption[]>(response);
};

export const createProductCategory = async (
  formData: FormData,
): Promise<{ data: ProductCategoryRecord }> => {
  const response = await apiFetch(CATEGORIES_URL, {
    method: "POST",
    body: formData,
  });
  return parseEnvelope<ProductCategoryRecord>(response);
};

export const updateProductCategory = async (
  id: number,
  formData: FormData,
): Promise<{ data: ProductCategoryRecord }> => {
  const response = await apiFetch(`${CATEGORIES_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<ProductCategoryRecord>(response);
};

export const deleteProductCategory = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${CATEGORIES_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

export const toggleProductCategoryStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("product-categories", item.id!, isActive);

export const updateProductCategorySortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("product-categories", item.id!, sortOrder);
