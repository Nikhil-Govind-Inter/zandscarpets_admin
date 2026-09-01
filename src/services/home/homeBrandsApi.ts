import { apiFetch } from "@/lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HOME_BRANDS_URL = `${API_BASE_URL}/home/home-brands`;

export interface HomeBrandsRecord {
  id: number;
  industry_id?: number | null;
  media_path: string | null;
  media_alt: string | null;
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

const buildHomeBrandsFormData = (
  item: HomeBrandsRecord,
  overrides: Partial<Pick<HomeBrandsRecord, "industry_id" | "media_alt" | "sort_order" | "is_active">>,
): FormData => {
  const formData = new FormData();
  if (overrides.industry_id ?? item.industry_id) formData.append("industry_id", (overrides.industry_id ?? item.industry_id ?? "").toString());
  formData.append("media_alt", overrides.media_alt ?? item.media_alt ?? "");
  formData.append("sort_order", (overrides.sort_order ?? item.sort_order ?? 1).toString());
  formData.append("is_active", (overrides.is_active ?? item.is_active ?? true).toString());

  if (item.media_path) {
    const isAbsoluteUrl = /^https?:\/\//.test(item.media_path);
    const mediaPath = isAbsoluteUrl ? item.media_path : `${import.meta.env.VITE_IMAGE_URL}/${item.media_path}`;
    formData.append("media_path", mediaPath);
  }

  return formData;
};

export const toggleHomeBrandsStatus = (item: HomeBrandsRecord, isActive: boolean) =>
  updateHomeBrands(item.id, buildHomeBrandsFormData(item, { is_active: isActive }));

export const updateHomeBrandsSortOrder = (item: HomeBrandsRecord, sortOrder: number) =>
  updateHomeBrands(item.id, buildHomeBrandsFormData(item, { sort_order: Math.max(1, sortOrder) }));
