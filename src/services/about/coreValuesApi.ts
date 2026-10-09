import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { apiFetch } from "@/lib/apiClient";

// About > Core Values — backed by `/api/backend/about/core-values`. List resource with a
// bilingual title plus media; mirrors homeBrandsApi.ts's shape minus `industry_id`.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CORE_VALUES_URL = `${API_BASE_URL}/about/core-values`;

export interface CoreValuesRecord {
  id: number;
  title: string;
  title_ar: string;
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

export interface CoreValuesListResponse {
  data: {
    data: CoreValuesRecord[];
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
export const fetchCoreValuesList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<CoreValuesListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${CORE_VALUES_URL}?${params}`);
  return parseEnvelope<CoreValuesListResponse["data"]>(response);
};

export const fetchCoreValuesById = async (
  id: number,
): Promise<{ data: CoreValuesRecord }> => {
  const response = await apiFetch(`${CORE_VALUES_URL}/${id}`);
  return parseEnvelope<CoreValuesRecord>(response);
};

export const createCoreValues = async (
  formData: FormData,
): Promise<{ data: CoreValuesRecord }> => {
  const response = await apiFetch(CORE_VALUES_URL, {
    method: "POST",
    body: formData,
  });
  return parseEnvelope<CoreValuesRecord>(response);
};

export const updateCoreValues = async (
  id: number,
  formData: FormData,
): Promise<{ data: CoreValuesRecord }> => {
  const response = await apiFetch(`${CORE_VALUES_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<CoreValuesRecord>(response);
};

export const deleteCoreValues = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${CORE_VALUES_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

export const toggleCoreValuesStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("core-values", item.id!, isActive);

export const updateCoreValuesSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("core-values", item.id!, sortOrder);
