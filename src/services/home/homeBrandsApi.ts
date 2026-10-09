import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { apiFetch } from "@/lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HOME_BRANDS_URL = `${API_BASE_URL}/home/home-brands`;

export interface HomeBrandsRecord {
  id: number;
  industry_id?: number | null;
  media_path: string | null;
  media_alt: string | null;
  media_alt_ar: string | null;
  sort_order: number;
  is_active: boolean;
  industry?: { id: number; title: string } | null;
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
  error?: { message?: string; code?: string; statusCode?: number; details?: unknown };
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

const parseEnvelope = async <T>(response: Response): Promise<ApiEnvelope<T>> => {
  const body = await response.json().catch(() => ({} as ApiEnvelope<T> & ApiErrorEnvelope));
  if (!response.ok || !body.success) {
    const errorBody = body as ApiErrorEnvelope;
    const message = errorBody.error?.message || errorBody.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, errorBody.error?.code, errorBody.error?.details);
  }
  return body;
};

export interface HomeBrandsListResponse {
  data: {
    data: HomeBrandsRecord[];
    pagination: { totalCount: number; totalPages: number; currentPage: number; limit: number; isSearchApplied?: boolean };
  };
}

export const fetchHomeBrandsList = async (
  page: number,
  limit: number,
  search?: string,
  attributes?: string[],
): Promise<HomeBrandsListResponse> => {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  if (attributes && attributes.length) params.append("attributes", attributes.join(","));
  if (search) params.append("search", search);

  const response = await apiFetch(`${HOME_BRANDS_URL}?${params}`);
  return parseEnvelope<HomeBrandsListResponse["data"]>(response);
};

export const fetchHomeBrandsById = async (id: number): Promise<{ data: HomeBrandsRecord }> => {
  const response = await apiFetch(`${HOME_BRANDS_URL}/${id}`);
  return parseEnvelope<HomeBrandsRecord>(response);
};

export const createHomeBrands = async (formData: FormData): Promise<{ data: HomeBrandsRecord }> => {
  const response = await apiFetch(HOME_BRANDS_URL, { method: "POST", body: formData });
  return parseEnvelope<HomeBrandsRecord>(response);
};

export const updateHomeBrands = async (id: number, formData: FormData): Promise<{ data: HomeBrandsRecord }> => {
  const response = await apiFetch(`${HOME_BRANDS_URL}/${id}`, { method: "PUT", body: formData });
  return parseEnvelope<HomeBrandsRecord>(response);
};

export const deleteHomeBrands = async (id: number): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${HOME_BRANDS_URL}/${id}`, { method: "DELETE" });
  return parseEnvelope<{ id: number }>(response);
};

export const toggleHomeBrandsStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("home-brands", item.id!, isActive);

export const updateHomeBrandsSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("home-brands", item.id!, sortOrder);
