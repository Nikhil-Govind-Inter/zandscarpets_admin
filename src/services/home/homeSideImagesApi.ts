import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { apiFetch } from "@/lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HOME_SIDE_IMAGES_URL = `${API_BASE_URL}/home/home-side-images`;

export interface HomeSideImagesRecord {
  id: number;
  before_media_path: string | null;
  after_media_path: string | null;
  before_media_alt?: string | null;
  before_media_alt_ar?: string | null;
  after_media_alt?: string | null;
  after_media_alt_ar?: string | null;
  sort_order: number;
  is_active: boolean;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

class ApiError extends Error {
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
  const body = await response.json().catch(() => ({} as ApiEnvelope<T>));
  if (!response.ok || !body.success) {
    const err = body as any;
    const message = err.error?.message || err.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, err.error?.code, err.error?.details);
  }
  return body;
};

export interface HomeSideImagesListResponse {
  data: {
    data: HomeSideImagesRecord[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

export const fetchHomeSideImagesList = async (
  page: number,
  limit: number,
  search?: string,
  attributes?: string[],
): Promise<HomeSideImagesListResponse> => {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  if (attributes && attributes.length) params.append("attributes", attributes.join(","));
  if (search) params.append("search", search);

  const response = await apiFetch(`${HOME_SIDE_IMAGES_URL}?${params}`);
  return parseEnvelope<HomeSideImagesListResponse["data"]>(response);
};

export const fetchHomeSideImagesById = async (id: number): Promise<{ data: HomeSideImagesRecord }> => {
  const response = await apiFetch(`${HOME_SIDE_IMAGES_URL}/${id}`);
  return parseEnvelope<HomeSideImagesRecord>(response);
};

export const createHomeSideImages = async (formData: FormData): Promise<{ data: HomeSideImagesRecord }> => {
  const response = await apiFetch(HOME_SIDE_IMAGES_URL, { method: "POST", body: formData });
  return parseEnvelope<HomeSideImagesRecord>(response);
};

export const updateHomeSideImages = async (id: number, formData: FormData): Promise<{ data: HomeSideImagesRecord }> => {
  const response = await apiFetch(`${HOME_SIDE_IMAGES_URL}/${id}`, { method: "PUT", body: formData });
  return parseEnvelope<HomeSideImagesRecord>(response);
};

export const deleteHomeSideImages = async (id: number): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${HOME_SIDE_IMAGES_URL}/${id}`, { method: "DELETE" });
  return parseEnvelope<{ id: number }>(response);
};

export const toggleHomeSideImagesStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("home-side-images", item.id!, isActive);

export const updateHomeSideImagesSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("home-side-images", item.id!, sortOrder);

export { ApiError };
