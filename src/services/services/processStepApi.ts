import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { apiFetch } from "@/lib/apiClient";

// Services > Process Steps — backed by `/api/backend/services/process-steps`. File
// upload via FormData, following the same media-path round-trip rules as
// homeMilestonesApi.ts; envelope parsing follows the apiFetch + ApiError convention
// from pagesApi.ts.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PROCESS_STEP_URL = `${API_BASE_URL}/services/process-steps`;

export interface ProcessStepRecord {
  id: number;
  title: string;
  description: string;
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

export interface ProcessStepListResponse {
  data: {
    data: ProcessStepRecord[];
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
export const fetchProcessStepList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<ProcessStepListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${PROCESS_STEP_URL}?${params}`);
  return parseEnvelope<ProcessStepListResponse["data"]>(response);
};

export const fetchProcessStepById = async (
  id: number,
): Promise<{ data: ProcessStepRecord }> => {
  const response = await apiFetch(`${PROCESS_STEP_URL}/${id}`);
  return parseEnvelope<ProcessStepRecord>(response);
};

export const createProcessStep = async (
  formData: FormData,
): Promise<{ data: ProcessStepRecord }> => {
  const response = await apiFetch(PROCESS_STEP_URL, {
    method: "POST",
    body: formData,
  });
  return parseEnvelope<ProcessStepRecord>(response);
};

export const updateProcessStep = async (
  id: number,
  formData: FormData,
): Promise<{ data: ProcessStepRecord }> => {
  const response = await apiFetch(`${PROCESS_STEP_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<ProcessStepRecord>(response);
};

export const deleteProcessStep = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${PROCESS_STEP_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

export const toggleProcessStepStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("process-steps", item.id!, isActive);

export const updateProcessStepSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("process-steps", item.id!, sortOrder);
