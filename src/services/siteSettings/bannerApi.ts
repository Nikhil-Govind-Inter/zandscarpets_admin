import { apiFetch } from "@/lib/apiClient";

// Site Settings > Banners — backed by `/api/backend/site-settings/banners`.
// One banner per page (unique `page_id` FK on the server, enforced as a 409
// on duplicate create). File uploads use FormData, following the same
// media-path round-trip rules as socialMediaApi.ts; envelope parsing follows
// the apiFetch + ApiError convention from usersApi.ts / pagesApi.ts.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/backend";

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
  desktop_media_path: string;
  mobile_media_path: string;
  media_alt: string;
  title: string;
  sub_title: string;
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
): Promise<BannersListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

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

export interface BannerFormPayload {
  page_id: number;
  title: string;
  sub_title: string;
  media_alt: string;
  desktop_media_path: File | string;
  mobile_media_path: File | string;
}

// multerMiddleware.js on the server only keeps a text media-path value if
// it's a freshly uploaded file or an absolute `https?://<host>/uploads/...`
// URL — a bare relative path (what's actually held in form state) matches
// neither and gets silently dropped. So an unchanged existing path must be
// resent as an absolute URL to round-trip on update (see socialMediaApi.ts).
const appendMediaPath = (
  formData: FormData,
  key: string,
  value: File | string,
) => {
  if (value instanceof File) {
    formData.append(key, value);
    return;
  }
  const isAbsoluteUrl = /^https?:\/\//.test(value);
  formData.append(
    key,
    isAbsoluteUrl ? value : `${import.meta.env.VITE_IMAGE_URL}/${value}`,
  );
};

const buildBannerFormData = (data: BannerFormPayload): FormData => {
  const formData = new FormData();
  formData.append("page_id", data.page_id.toString());
  formData.append("title", data.title);
  formData.append("sub_title", data.sub_title);
  formData.append("media_alt", data.media_alt);
  appendMediaPath(formData, "desktop_media_path", data.desktop_media_path);
  appendMediaPath(formData, "mobile_media_path", data.mobile_media_path);
  return formData;
};

export const createBanner = async (
  data: BannerFormPayload,
): Promise<{ data: Banner }> => {
  const response = await apiFetch(BANNERS_URL, {
    method: "POST",
    body: buildBannerFormData(data),
  });
  return parseEnvelope<Banner>(response);
};

export const updateBanner = async (
  id: number,
  data: BannerFormPayload,
): Promise<{ data: Banner }> => {
  const response = await apiFetch(`${BANNERS_URL}/${id}`, {
    method: "PUT",
    body: buildBannerFormData(data),
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
