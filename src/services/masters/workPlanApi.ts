import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { apiFetch } from "@/lib/apiClient";

// Masters > Work Plans — backed by `/api/backend/masters/work-plan`. Uses the
// apiFetch + ApiError + envelope-parsing convention from industryApi.ts.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const WORK_PLAN_URL = `${API_BASE_URL}/masters/work-plan`;

export interface WorkPlanRecord {
  id: number;
  title: string;
  title_ar?: string;
  short_description: string;
  short_description_ar?: string;
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

export interface WorkPlanListResponse {
  data: {
    data: WorkPlanRecord[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied?: boolean;
    };
  };
}

export interface WorkPlanPayload {
  title: string;
  title_ar?: string;
  short_description: string;
  short_description_ar?: string;
  sort_order: number;
  is_active: boolean;
}

// Fetcher shape matches usePaginatedList's `Fetcher<T>` contract.
export const fetchWorkPlanList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<WorkPlanListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${WORK_PLAN_URL}?${params}`);
  return parseEnvelope<WorkPlanListResponse["data"]>(response);
};

export const fetchWorkPlanById = async (
  id: number,
): Promise<{ data: WorkPlanRecord }> => {
  const response = await apiFetch(`${WORK_PLAN_URL}/${id}`);
  return parseEnvelope<WorkPlanRecord>(response);
};

export const createWorkPlan = async (
  payload: WorkPlanPayload,
): Promise<{ data: WorkPlanRecord }> => {
  const response = await apiFetch(WORK_PLAN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<WorkPlanRecord>(response);
};

export const updateWorkPlan = async (
  id: number,
  payload: WorkPlanPayload,
): Promise<{ data: WorkPlanRecord }> => {
  const response = await apiFetch(`${WORK_PLAN_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<WorkPlanRecord>(response);
};

export const deleteWorkPlan = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${WORK_PLAN_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

// Quick status toggle / sort-order change via the shared single-field CMS endpoints.
export const toggleWorkPlanStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("work-plan", item.id!, isActive);

export const updateWorkPlanSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("work-plan", item.id!, sortOrder);
