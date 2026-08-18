import { apiFetch } from "@/lib/apiClient";

// Masters > Ads Banner — backed by `/api/backend/masters/ads-banner`. File
// upload via FormData, following the same media-path round-trip rules as
// socialMediaApi.ts; envelope parsing follows the apiFetch + ApiError
// convention from pagesApi.ts.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

const ADS_BANNER_URL = `${API_BASE_URL}/masters/ads-banner`;

export interface AdsBannerRecord {
  id: number;
  media_path: string | null;
  media_alt: string | null;
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

export interface AdsBannerListResponse {
  data: {
    data: AdsBannerRecord[];
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
export const fetchAdsBannerList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<AdsBannerListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${ADS_BANNER_URL}?${params}`);
  return parseEnvelope<AdsBannerListResponse["data"]>(response);
};

export const fetchAdsBannerById = async (
  id: number,
): Promise<{ data: AdsBannerRecord }> => {
  const response = await apiFetch(`${ADS_BANNER_URL}/${id}`);
  return parseEnvelope<AdsBannerRecord>(response);
};

export const createAdsBanner = async (
  formData: FormData,
): Promise<{ data: AdsBannerRecord }> => {
  const response = await apiFetch(ADS_BANNER_URL, {
    method: "POST",
    body: formData,
  });
  return parseEnvelope<AdsBannerRecord>(response);
};

export const updateAdsBanner = async (
  id: number,
  formData: FormData,
): Promise<{ data: AdsBannerRecord }> => {
  const response = await apiFetch(`${ADS_BANNER_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<AdsBannerRecord>(response);
};

export const deleteAdsBanner = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${ADS_BANNER_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

// Server has no partial-patch route, so quick actions must resend the full
// record (see socialMediaApi.ts's buildSocialMediaFormData for the same
// convention). media_path needs special handling: multerMiddleware only
// keeps a text media_path value if it's a freshly uploaded file or an
// absolute `https?://<host>/uploads/...` URL — a bare relative path (what's
// actually held in state/returned by the API) matches neither and gets
// silently dropped.
const buildAdsBannerFormData = (
  item: AdsBannerRecord,
  overrides: Partial<Pick<AdsBannerRecord, "media_alt" | "sort_order" | "is_active">>,
): FormData => {
  const formData = new FormData();
  formData.append("media_alt", overrides.media_alt ?? item.media_alt ?? "");
  formData.append(
    "sort_order",
    (overrides.sort_order ?? item.sort_order ?? 1).toString(),
  );
  formData.append(
    "is_active",
    (overrides.is_active ?? item.is_active ?? true).toString(),
  );

  if (item.media_path) {
    const isAbsoluteUrl = /^https?:\/\//.test(item.media_path);
    const mediaPath = isAbsoluteUrl
      ? item.media_path
      : `${import.meta.env.VITE_IMAGE_URL}/${item.media_path}`;
    formData.append("media_path", mediaPath);
  }

  return formData;
};

export const toggleAdsBannerStatus = (item: AdsBannerRecord, isActive: boolean) =>
  updateAdsBanner(item.id, buildAdsBannerFormData(item, { is_active: isActive }));

export const updateAdsBannerSortOrder = (item: AdsBannerRecord, sortOrder: number) =>
  updateAdsBanner(item.id, buildAdsBannerFormData(item, { sort_order: Math.max(1, sortOrder) }));
