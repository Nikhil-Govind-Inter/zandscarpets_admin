import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { apiFetch } from "@/lib/apiClient";

// Masters > Faqs — backed by `/api/backend/masters/faqs`. Uses the apiFetch
// + ApiError + envelope-parsing convention from pagesApi.ts.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

const FAQS_URL = `${API_BASE_URL}/masters/faqs`;

export interface FaqRecord {
  id: number;
  question: string;
  question_ar?: string;
  answer: string;
  answer_ar?: string;
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

export interface FaqsListResponse {
  data: {
    data: FaqRecord[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied?: boolean;
    };
  };
}

export interface FaqPayload {
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}

// Fetcher shape matches usePaginatedList's `Fetcher<T>` contract.
export const fetchFaqsList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<FaqsListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${FAQS_URL}?${params}`);
  return parseEnvelope<FaqsListResponse["data"]>(response);
};

export const fetchFaqById = async (
  id: number,
): Promise<{ data: FaqRecord }> => {
  const response = await apiFetch(`${FAQS_URL}/${id}`);
  return parseEnvelope<FaqRecord>(response);
};

export const createFaq = async (
  payload: FaqPayload,
): Promise<{ data: FaqRecord }> => {
  const response = await apiFetch(FAQS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<FaqRecord>(response);
};

export const updateFaq = async (
  id: number,
  payload: FaqPayload,
): Promise<{ data: FaqRecord }> => {
  const response = await apiFetch(`${FAQS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<FaqRecord>(response);
};

export const deleteFaq = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${FAQS_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

// Quick status toggle / sort-order change via the shared single-field CMS endpoints.
export const toggleFaqStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("faqs", item.id!, isActive);

export const updateFaqSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("faqs", item.id!, sortOrder);
