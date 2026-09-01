import { apiFetch } from "@/lib/apiClient";

// About > History — backed by `/api/backend/about/history`. No media fields, so this
// mirrors ourFeaturesApi.ts's plain-JSON shape exactly (title/description -> year/title/description).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HISTORY_URL = `${API_BASE_URL}/about/history`;

export interface HistoryRecord {
  id: number;
  year: string;
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

export interface HistoryListResponse {
  data: {
    data: HistoryRecord[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied?: boolean;
    };
  };
}

export interface HistoryPayload {
  year: string;
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

// Fetcher shape matches usePaginatedList's `Fetcher<T>` contract.
export const fetchHistoryList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<HistoryListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${HISTORY_URL}?${params}`);
  return parseEnvelope<HistoryListResponse["data"]>(response);
};

export const fetchHistoryById = async (
  id: number,
): Promise<{ data: HistoryRecord }> => {
  const response = await apiFetch(`${HISTORY_URL}/${id}`);
  return parseEnvelope<HistoryRecord>(response);
};

export const createHistory = async (
  payload: HistoryPayload,
): Promise<{ data: HistoryRecord }> => {
  const response = await apiFetch(HISTORY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<HistoryRecord>(response);
};

export const updateHistory = async (
  id: number,
  payload: HistoryPayload,
): Promise<{ data: HistoryRecord }> => {
  const response = await apiFetch(`${HISTORY_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<HistoryRecord>(response);
};

export const deleteHistory = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${HISTORY_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

// Server has no partial-patch route, so quick actions must resend the full record.
export const toggleHistoryStatus = (item: HistoryRecord, isActive: boolean) =>
  updateHistory(item.id, {
    year: item.year,
    title: item.title,
    description: item.description,
    sort_order: item.sort_order,
    is_active: isActive,
  });

export const updateHistorySortOrder = (item: HistoryRecord, sortOrder: number) =>
  updateHistory(item.id, {
    year: item.year,
    title: item.title,
    description: item.description,
    sort_order: Math.max(1, sortOrder),
    is_active: item.is_active,
  });
