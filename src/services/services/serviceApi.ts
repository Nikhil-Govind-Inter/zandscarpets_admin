import { updateCmsStatus, updateCmsSortOrder, updateCmsFooter } from "@/services/common/cmsOrderStatusApi";
import { apiFetch } from "@/lib/apiClient";

// Services > Service — backed by `/api/backend/services/service`. Uses the
// apiFetch + ApiError + envelope-parsing convention from pagesApi.ts.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SERVICE_URL = `${API_BASE_URL}/services/service`;

export interface ServiceRecord {
  id: number;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  sort_order: number;
  is_active: boolean;
  show_in_footer: boolean;
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

export interface ServiceFilters {
  status?: "active" | "inactive";
  show_in_footer?: boolean;
}

export interface ServicePayload {
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  sort_order: number;
  is_active: boolean;
  show_in_footer: boolean;
}

// Fetcher shape matches usePaginatedList's `Fetcher<T>` contract.
export const fetchServiceList = async (
  page: number,
  limit: number,
  search?: string,
  filters?: ServiceFilters,
): Promise<ServiceListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }
  if (filters?.status) {
    params.append("status", filters.status);
  }
  if (filters?.show_in_footer !== undefined) {
    params.append("show_in_footer", String(filters.show_in_footer));
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

// Source for pickers elsewhere.
export const fetchActiveServices = async (): Promise<{
  data: Pick<ServiceRecord, "id" | "title">[];
}> => {
  const response = await apiFetch(`${SERVICE_URL}/active`);
  return parseEnvelope<Pick<ServiceRecord, "id" | "title">[]>(response);
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

// Quick status toggle / sort-order change via the shared single-field CMS endpoints.
export const toggleServiceStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("services", item.id!, isActive);

export const toggleServiceFooter = (item: { id?: number | string }, showInFooter: boolean) =>
  updateCmsFooter("services", item.id!, showInFooter);

export const updateServiceSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("services", item.id!, sortOrder);
