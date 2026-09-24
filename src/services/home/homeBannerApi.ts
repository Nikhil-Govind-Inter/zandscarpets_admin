import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { apiFetch } from "@/lib/apiClient";

// Home > Banner — backed by `/api/backend/home/home-banner`. File upload via
// FormData, following the same media-path round-trip rules as
// adsBannerApi.ts; envelope parsing follows the apiFetch + ApiError
// convention from pagesApi.ts.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

const HOME_BANNER_URL = `${API_BASE_URL}/home/home-banner`;

export interface HomeBannerRecord {
  id: number;
  industry_id: number;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
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

export interface HomeBannerListResponse {
  data: {
    data: HomeBannerRecord[];
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
export const fetchHomeBannerList = async (
  page: number,
  limit: number,
  search?: string,
  attributes?: string[],
): Promise<HomeBannerListResponse> => {
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

  const response = await apiFetch(`${HOME_BANNER_URL}?${params}`);
  return parseEnvelope<HomeBannerListResponse["data"]>(response);
};

export const fetchHomeBannerById = async (
  id: number,
): Promise<{ data: HomeBannerRecord }> => {
  const response = await apiFetch(`${HOME_BANNER_URL}/${id}`);
  return parseEnvelope<HomeBannerRecord>(response);
};

export const createHomeBanner = async (
  formData: FormData,
): Promise<{ data: HomeBannerRecord }> => {
  const response = await apiFetch(HOME_BANNER_URL, {
    method: "POST",
    body: formData,
  });
  return parseEnvelope<HomeBannerRecord>(response);
};

export const updateHomeBanner = async (
  id: number,
  formData: FormData,
): Promise<{ data: HomeBannerRecord }> => {
  const response = await apiFetch(`${HOME_BANNER_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<HomeBannerRecord>(response);
};

export const deleteHomeBanner = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${HOME_BANNER_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

export const toggleHomeBannerStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("home-banner", item.id!, isActive);

export const updateHomeBannerSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("home-banner", item.id!, sortOrder);
