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
  quotes: string;
  name: string;
  designation: string;
  Organization: string;
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

// Server has no partial-patch route, so quick actions must resend the full record. media_path
// needs special handling: multerMiddleware only keeps a text media_path value if it's a
// freshly uploaded file or an absolute `https?://<host>/uploads/...` URL — a bare relative
// path (what's actually held in state/returned by the API) matches neither and gets silently
// dropped.
const buildMessagesFormData = (
  item: MessagesRecord,
  overrides: Partial<
    Pick<
      MessagesRecord,
      | "media_alt"
      | "quotes"
      | "name"
      | "designation"
      | "Organization"
      | "sort_order"
      | "is_active"
    >
  >,
): FormData => {
  const formData = new FormData();

  formData.append("media_alt", overrides.media_alt ?? item.media_alt ?? "");
  formData.append("quotes", overrides.quotes ?? item.quotes ?? "");
  formData.append("name", overrides.name ?? item.name ?? "");
  formData.append("designation", overrides.designation ?? item.designation ?? "");
  formData.append("Organization", overrides.Organization ?? item.Organization ?? "");
  formData.append(
    "sort_order",
    (overrides.sort_order ?? item.sort_order ?? 1).toString(),
  );
  formData.append(
    "is_active",
    (overrides.is_active ?? item.is_active ?? true).toString(),
  );

  if (item.media_path) {
    const isAbsoluteUrl = /^https?:\/\//.test(item.media_path);
    const mediaPath = isAbsoluteUrl
      ? item.media_path
      : `${import.meta.env.VITE_IMAGE_URL}/${item.media_path}`;
    formData.append("media_path", mediaPath);
  }

  return formData;
};

export const toggleMessagesStatus = (item: MessagesRecord, isActive: boolean) =>
  updateMessages(item.id, buildMessagesFormData(item, { is_active: isActive }));

export const updateMessagesSortOrder = (item: MessagesRecord, sortOrder: number) =>
  updateMessages(
    item.id,
    buildMessagesFormData(item, { sort_order: Math.max(1, sortOrder) }),
  );
