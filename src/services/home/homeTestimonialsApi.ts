import { apiFetch } from "@/lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HOME_TESTIMONIALS_URL = `${API_BASE_URL}/home/home-testimonials`;

export interface HomeTestimonialsRecord {
  id: number;
  profile_media_path: string | null;
  name: string;
  designation?: string | null;
  message: string;
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

export interface HomeTestimonialsListResponse {
  data: {
    data: HomeTestimonialsRecord[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

export const fetchHomeTestimonialsList = async (
  page: number,
  limit: number,
  search?: string,
  attributes?: string[],
): Promise<HomeTestimonialsListResponse> => {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  if (attributes && attributes.length) params.append("attributes", attributes.join(","));
  if (search) params.append("search", search);

  const response = await apiFetch(`${HOME_TESTIMONIALS_URL}?${params}`);
  return parseEnvelope<HomeTestimonialsListResponse["data"]>(response);
};

export const fetchHomeTestimonialsById = async (id: number): Promise<{ data: HomeTestimonialsRecord }> => {
  const response = await apiFetch(`${HOME_TESTIMONIALS_URL}/${id}`);
  return parseEnvelope<HomeTestimonialsRecord>(response);
};

export const createHomeTestimonials = async (formData: FormData): Promise<{ data: HomeTestimonialsRecord }> => {
  const response = await apiFetch(HOME_TESTIMONIALS_URL, { method: "POST", body: formData });
  return parseEnvelope<HomeTestimonialsRecord>(response);
};

export const updateHomeTestimonials = async (id: number, formData: FormData): Promise<{ data: HomeTestimonialsRecord }> => {
  const response = await apiFetch(`${HOME_TESTIMONIALS_URL}/${id}`, { method: "PUT", body: formData });
  return parseEnvelope<HomeTestimonialsRecord>(response);
};

export const deleteHomeTestimonials = async (id: number): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${HOME_TESTIMONIALS_URL}/${id}`, { method: "DELETE" });
  return parseEnvelope<{ id: number }>(response);
};

const buildHomeTestimonialsFormData = (
  item: HomeTestimonialsRecord,
  overrides: Partial<Pick<HomeTestimonialsRecord, "name" | "designation" | "message" | "sort_order" | "is_active">>,
): FormData => {
  const formData = new FormData();
  formData.append("name", overrides.name ?? item.name ?? "");
  formData.append("designation", overrides.designation ?? item.designation ?? "");
  formData.append("message", overrides.message ?? item.message ?? "");
  formData.append("sort_order", (overrides.sort_order ?? item.sort_order ?? 1).toString());
  formData.append("is_active", (overrides.is_active ?? item.is_active ?? true).toString());

  if (item.profile_media_path) {
    const isAbsolute = /^https?:\/\//.test(item.profile_media_path);
    const mediaPath = isAbsolute ? item.profile_media_path : `${import.meta.env.VITE_IMAGE_URL}/${item.profile_media_path}`;
    formData.append("profile_media_path", mediaPath);
  }

  return formData;
};

export const toggleHomeTestimonialsStatus = (item: HomeTestimonialsRecord, isActive: boolean) =>
  updateHomeTestimonials(item.id, buildHomeTestimonialsFormData(item, { is_active: isActive }));

export const updateHomeTestimonialsSortOrder = (item: HomeTestimonialsRecord, sortOrder: number) =>
  updateHomeTestimonials(item.id, buildHomeTestimonialsFormData(item, { sort_order: Math.max(1, sortOrder) }));

export { ApiError };
