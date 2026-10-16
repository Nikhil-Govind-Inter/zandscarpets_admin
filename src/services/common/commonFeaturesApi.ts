import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { apiFetch } from "@/lib/apiClient";

// Common Items > Our Features — backed by `/api/backend/common/features`. JSON body (no files).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const COMMONFEATURES_URL = `${API_BASE_URL}/common/features`;

export interface CommonFeaturesRecord {
  id: number;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
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

export interface CommonFeaturesListResponse {
  data: {
    data: CommonFeaturesRecord[];
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
export const fetchCommonFeatureList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<CommonFeaturesListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${COMMONFEATURES_URL}?${params}`);
  return parseEnvelope<CommonFeaturesListResponse["data"]>(response);
};

export const fetchCommonFeatureById = async (
  id: number,
): Promise<{ data: CommonFeaturesRecord }> => {
  const response = await apiFetch(`${COMMONFEATURES_URL}/${id}`);
  return parseEnvelope<CommonFeaturesRecord>(response);
};

export const createCommonFeature = async (
  data: Record<string, unknown>,
): Promise<{ data: CommonFeaturesRecord }> => {
  const response = await apiFetch(COMMONFEATURES_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseEnvelope<CommonFeaturesRecord>(response);
};

export const updateCommonFeature = async (
  id: number,
  data: Record<string, unknown>,
): Promise<{ data: CommonFeaturesRecord }> => {
  const response = await apiFetch(`${COMMONFEATURES_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseEnvelope<CommonFeaturesRecord>(response);
};

export const deleteCommonFeature = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${COMMONFEATURES_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

export const toggleCommonFeatureStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("common-features", item.id!, isActive);

export const updateCommonFeatureSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("common-features", item.id!, sortOrder);

