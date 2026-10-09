import { apiFetch } from "@/lib/apiClient";

// Site Settings > Banners — backed by `/api/backend/site-settings/banners`.
// One banner per page (unique `page_id` FK on the server, enforced as a 409
// on duplicate create). File uploads use caller-built FormData; envelope parsing follows
// the apiFetch + ApiError convention from usersApi.ts / pagesApi.ts.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

const BANNERS_URL = `${API_BASE_URL}/site-settings/banners`;

export interface BannerPage {
  id: number;
  page: string;
  page_slug: string;
}

export interface Banner {
  id: number;
  page_id: number;
  page?: BannerPage;
  media_path: string;
  media_alt: string;
  media_alt_ar: string;
  title: string;
  title_ar: string;
  sub_title: string;
  sub_title_ar: string;
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

export interface BannersListResponse {
  data: {
    data: Banner[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied?: boolean;
    };
  };
}

// Fetcher shape matches usePaginatedList's `Fetcher<T>` contract.
export const fetchBannersList = async (
  page: number,
  limit: number,
  search?: string,
  attributes?: string[],
): Promise<BannersListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (attributes && attributes.length) {
    params.append("attributes", attributes.join(","));
  }

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${BANNERS_URL}?${params}`);
  return parseEnvelope<BannersListResponse["data"]>(response);
};

export const fetchBannerById = async (
  id: number,
): Promise<{ data: Banner }> => {
  const response = await apiFetch(`${BANNERS_URL}/${id}`);
  return parseEnvelope<Banner>(response);
};

export const createBanner = async (
  formData: FormData,
): Promise<{ data: Banner }> => {
  const response = await apiFetch(BANNERS_URL, {
    method: "POST",
    body: formData,
  });
  return parseEnvelope<Banner>(response);
};

export const updateBanner = async (
  id: number,
  formData: FormData,
): Promise<{ data: Banner }> => {
  const response = await apiFetch(`${BANNERS_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<Banner>(response);
};

export const deleteBanner = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${BANNERS_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};
