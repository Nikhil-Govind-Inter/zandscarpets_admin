import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { apiFetch } from "@/lib/apiClient";

// Common Items > How It Works — backed by `/api/backend/common/how-it-works`. JSON body (no files).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const COMMONHOWITWORKS_URL = `${API_BASE_URL}/common/how-it-works`;

export interface CommonHowItWorksRecord {
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

export interface CommonHowItWorksListResponse {
  data: {
    data: CommonHowItWorksRecord[];
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
export const fetchCommonHowItWorksList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<CommonHowItWorksListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${COMMONHOWITWORKS_URL}?${params}`);
  return parseEnvelope<CommonHowItWorksListResponse["data"]>(response);
};

export const fetchCommonHowItWorksById = async (
  id: number,
): Promise<{ data: CommonHowItWorksRecord }> => {
  const response = await apiFetch(`${COMMONHOWITWORKS_URL}/${id}`);
  return parseEnvelope<CommonHowItWorksRecord>(response);
};

export const createCommonHowItWorks = async (
  data: Record<string, unknown>,
): Promise<{ data: CommonHowItWorksRecord }> => {
  const response = await apiFetch(COMMONHOWITWORKS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseEnvelope<CommonHowItWorksRecord>(response);
};

export const updateCommonHowItWorks = async (
  id: number,
  data: Record<string, unknown>,
): Promise<{ data: CommonHowItWorksRecord }> => {
  const response = await apiFetch(`${COMMONHOWITWORKS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseEnvelope<CommonHowItWorksRecord>(response);
};

export const deleteCommonHowItWorks = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${COMMONHOWITWORKS_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

export const toggleCommonHowItWorksStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("common-how-it-works", item.id!, isActive);

export const updateCommonHowItWorksSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("common-how-it-works", item.id!, sortOrder);

