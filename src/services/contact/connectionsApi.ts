import { apiFetch } from "@/lib/apiClient";

// Contact > Connections — backed by `/api/backend/contact/connections`. List resource with an
// optional icon image, mirrors coreValuesApi.ts's structure. Unlike coreValues/messages/homeMilestones,
// this model has no `sort_order`/`is_active` columns, so there is no toggle/reorder support here.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CONNECTIONS_URL = `${API_BASE_URL}/contact/connections`;

export interface ConnectionsRecord {
  id: number;
  title: string;
  description: string;
  content: string;
  icon_media_path: string | null;
  icon_media_alt: string | null;
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

export interface ConnectionsListResponse {
  data: {
    data: ConnectionsRecord[];
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
export const fetchConnectionsList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<ConnectionsListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${CONNECTIONS_URL}?${params}`);
  return parseEnvelope<ConnectionsListResponse["data"]>(response);
};

export const fetchConnectionsById = async (
  id: number,
): Promise<{ data: ConnectionsRecord }> => {
  const response = await apiFetch(`${CONNECTIONS_URL}/${id}`);
  return parseEnvelope<ConnectionsRecord>(response);
};

export const createConnections = async (
  formData: FormData,
): Promise<{ data: ConnectionsRecord }> => {
  const response = await apiFetch(CONNECTIONS_URL, {
    method: "POST",
    body: formData,
  });
  return parseEnvelope<ConnectionsRecord>(response);
};

export const updateConnections = async (
  id: number,
  formData: FormData,
): Promise<{ data: ConnectionsRecord }> => {
  const response = await apiFetch(`${CONNECTIONS_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<ConnectionsRecord>(response);
};

export const deleteConnections = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${CONNECTIONS_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};
