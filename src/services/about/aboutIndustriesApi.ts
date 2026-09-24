import { apiFetch } from "@/lib/apiClient";

// About > Industries — backed by `/api/backend/about/about-industries`. List resource with a
// bilingual title plus media; separate from Masters > Industry.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ABOUT_INDUSTRIES_URL = `${API_BASE_URL}/about/about-industries`;

export interface AboutIndustriesRecord {
  id: number;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  media_path: string | null;
  media_alt: string | null;
  media_alt_ar: string | null;
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

export interface AboutIndustriesListResponse {
  data: {
    data: AboutIndustriesRecord[];
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
export const fetchAboutIndustriesList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<AboutIndustriesListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${ABOUT_INDUSTRIES_URL}?${params}`);
  return parseEnvelope<AboutIndustriesListResponse["data"]>(response);
};

export const fetchAboutIndustriesById = async (
  id: number,
): Promise<{ data: AboutIndustriesRecord }> => {
  const response = await apiFetch(`${ABOUT_INDUSTRIES_URL}/${id}`);
  return parseEnvelope<AboutIndustriesRecord>(response);
};

export const createAboutIndustries = async (
  formData: FormData,
): Promise<{ data: AboutIndustriesRecord }> => {
  const response = await apiFetch(ABOUT_INDUSTRIES_URL, {
    method: "POST",
    body: formData,
  });
  return parseEnvelope<AboutIndustriesRecord>(response);
};

export const updateAboutIndustries = async (
  id: number,
  formData: FormData,
): Promise<{ data: AboutIndustriesRecord }> => {
  const response = await apiFetch(`${ABOUT_INDUSTRIES_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<AboutIndustriesRecord>(response);
};

export const deleteAboutIndustries = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${ABOUT_INDUSTRIES_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

// Server has no partial-patch route, so quick actions must resend the full record. media_path
// needs special handling: multerMiddleware only keeps a text media_path value if it's a
// freshly uploaded file or an absolute `https?://<host>/uploads/...` URL — a bare relative
// path (what's actually held in state/returned by the API) matches neither and gets silently
// dropped.
const buildAboutIndustriesFormData = (
  item: AboutIndustriesRecord,
  overrides: Partial<Pick<AboutIndustriesRecord, "media_alt" | "media_alt_ar" | "sort_order" | "is_active">>,
): FormData => {
  const formData = new FormData();

  formData.append("title", item.title ?? "");
  formData.append("title_ar", item.title_ar ?? "");
  formData.append("description", item.description ?? "");
  formData.append("description_ar", item.description_ar ?? "");
  formData.append("media_alt", overrides.media_alt ?? item.media_alt ?? "");
  formData.append("media_alt_ar", overrides.media_alt_ar ?? item.media_alt_ar ?? "");
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

export const toggleAboutIndustriesStatus = (
  item: AboutIndustriesRecord,
  isActive: boolean,
) => updateAboutIndustries(item.id, buildAboutIndustriesFormData(item, { is_active: isActive }));

export const updateAboutIndustriesSortOrder = (
  item: AboutIndustriesRecord,
  sortOrder: number,
) =>
  updateAboutIndustries(
    item.id,
    buildAboutIndustriesFormData(item, { sort_order: Math.max(1, sortOrder) }),
  );
