import { apiFetch } from "@/lib/apiClient";

// Services > Service — backed by `/api/backend/services/service`. Uses the
// apiFetch + ApiError + envelope-parsing convention from pagesApi.ts.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SERVICE_URL = `${API_BASE_URL}/services/service`;

export interface ServiceRecord {
  id: number;
  title: string;
  description: string;
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

export interface ServiceListResponse {
  data: {
    data: ServiceRecord[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied?: boolean;
    };
  };
}

export interface ServicePayload {
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

// Fetcher shape matches usePaginatedList's `Fetcher<T>` contract.
export const fetchServiceList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<ServiceListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${SERVICE_URL}?${params}`);
  return parseEnvelope<ServiceListResponse["data"]>(response);
};

export const fetchServiceById = async (
  id: number,
): Promise<{ data: ServiceRecord }> => {
  const response = await apiFetch(`${SERVICE_URL}/${id}`);
  return parseEnvelope<ServiceRecord>(response);
};

export const createService = async (
  payload: ServicePayload,
): Promise<{ data: ServiceRecord }> => {
  const response = await apiFetch(SERVICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<ServiceRecord>(response);
};

export const updateService = async (
  id: number,
  payload: ServicePayload,
): Promise<{ data: ServiceRecord }> => {
  const response = await apiFetch(`${SERVICE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<ServiceRecord>(response);
};

export const deleteService = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${SERVICE_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

// Server has no partial-patch route, so quick actions must resend the full
// record (see industryApi.ts's toggleIndustryStatus for the same convention).
export const toggleServiceStatus = (item: ServiceRecord, isActive: boolean) =>
  updateService(item.id, {
    title: item.title,
    description: item.description,
    sort_order: item.sort_order,
    is_active: isActive,
  });

export const updateServiceSortOrder = (
  item: ServiceRecord,
  sortOrder: number,
) =>
  updateService(item.id, {
    title: item.title,
    description: item.description,
    sort_order: Math.max(1, sortOrder),
    is_active: item.is_active,
  });
