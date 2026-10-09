import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { apiFetch } from "@/lib/apiClient";

// About > Messages — backed by `/api/backend/about/messages`. File upload via FormData,
// mirrors homeTestimonialsApi.ts's shape (profile media + name/designation/message) extended
// with the extra `quotes`/`Organization` fields the About Messages model carries. `Organization`
// keeps its capitalized field name verbatim, matching the model/request file on the server.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MESSAGES_URL = `${API_BASE_URL}/about/messages`;

export interface MessagesRecord {
  id: number;
  media_path: string | null;
  media_alt: string | null;
  media_alt_ar: string | null;
  quotes: string;
  quotes_ar: string;
  name: string;
  name_ar: string;
  designation: string;
  designation_ar: string;
  Organization: string;
  organization_ar: string;
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

export interface MessagesListResponse {
  data: {
    data: MessagesRecord[];
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
export const fetchMessagesList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<MessagesListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${MESSAGES_URL}?${params}`);
  return parseEnvelope<MessagesListResponse["data"]>(response);
};

export const fetchMessagesById = async (
  id: number,
): Promise<{ data: MessagesRecord }> => {
  const response = await apiFetch(`${MESSAGES_URL}/${id}`);
  return parseEnvelope<MessagesRecord>(response);
};

export const createMessages = async (
  formData: FormData,
): Promise<{ data: MessagesRecord }> => {
  const response = await apiFetch(MESSAGES_URL, {
    method: "POST",
    body: formData,
  });
  return parseEnvelope<MessagesRecord>(response);
};

export const updateMessages = async (
  id: number,
  formData: FormData,
): Promise<{ data: MessagesRecord }> => {
  const response = await apiFetch(`${MESSAGES_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<MessagesRecord>(response);
};

export const deleteMessages = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${MESSAGES_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

export const toggleMessagesStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("messages", item.id!, isActive);

export const updateMessagesSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("messages", item.id!, sortOrder);
