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
  description: string;
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

// Server has no partial-patch route, so quick actions must resend the full
// record (see adsBannerApi.ts's buildAdsBannerFormData for the same
// convention). media_path needs special handling: multerMiddleware only
// keeps a text media_path value if it's a freshly uploaded file or an
// absolute `https?://<host>/uploads/...` URL — a bare relative path (what's
// actually held in state/returned by the API) matches neither and gets
// silently dropped.
const buildHomeBannerFormData = (
  item: HomeBannerRecord,
  overrides: Partial<
    Pick<
      HomeBannerRecord,
      "industry_id" | "title" | "description" | "media_alt" | "sort_order" | "is_active"
    >
  >,
): FormData => {
  const formData = new FormData();
  formData.append(
    "industry_id",
    (overrides.industry_id ?? item.industry_id).toString(),
  );
  formData.append("title", overrides.title ?? item.title ?? "");
  formData.append("description", overrides.description ?? item.description ?? "");
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

export const toggleHomeBannerStatus = (item: HomeBannerRecord, isActive: boolean) =>
  updateHomeBanner(item.id, buildHomeBannerFormData(item, { is_active: isActive }));

export const updateHomeBannerSortOrder = (item: HomeBannerRecord, sortOrder: number) =>
  updateHomeBanner(item.id, buildHomeBannerFormData(item, { sort_order: Math.max(1, sortOrder) }));
