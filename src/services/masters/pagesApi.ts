import { apiFetch } from "@/lib/apiClient";

// Masters > Pages — backed by `/api/backend/masters/pages` (authMiddleware-gated,
// same as users). Uses the apiFetch + ApiError + envelope-parsing convention from
// usersApi.ts rather than the older raw-fetch style in socialMediaApi.ts.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/backend";

const PAGES_URL = `${API_BASE_URL}/masters/pages`;

export interface PageRecord {
  id: number;
  page: string;
  page_slug: string;
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

export interface PagesListResponse {
  data: {
    data: PageRecord[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied?: boolean;
    };
  };
}

export interface PagePayload {
  page: string;
  page_slug: string;
  is_active: boolean;
}

// Fetcher shape matches usePaginatedList's `Fetcher<T>` contract.
export const fetchPagesList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<PagesListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${PAGES_URL}?${params}`);
  return parseEnvelope<PagesListResponse["data"]>(response);
};

// Pulls every page in one shot (high limit, no search) for use in dropdowns
// (e.g. the Banner form's Page select) where pagination doesn't apply.
export const fetchAllPages = async (): Promise<PageRecord[]> => {
  const response = await fetchPagesList(1, 100);
  return response.data.data;
};

export const fetchActivePages = async (): Promise<PageRecord[]> => {
  const response = await apiFetch(`${PAGES_URL}/active`);
  const parsed = await parseEnvelope<PageRecord[]>(response);
  return parsed.data;
};

export const fetchPageById = async (
  id: number,
): Promise<{ data: PageRecord }> => {
  const response = await apiFetch(`${PAGES_URL}/${id}`);
  return parseEnvelope<PageRecord>(response);
};

export const createPage = async (
  payload: PagePayload,
): Promise<{ data: PageRecord }> => {
  const response = await apiFetch(PAGES_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<PageRecord>(response);
};

// The backend validates page/page_slug/is_active as required on every PUT
// /:id (no partial-patch support — see pagesRequest.js), so quick actions
// like the status toggle must resend the full record.
export const updatePage = async (
  id: number,
  payload: PagePayload,
): Promise<{ data: PageRecord }> => {
  const response = await apiFetch(`${PAGES_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<PageRecord>(response);
};

export const deletePage = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${PAGES_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

export const togglePageStatus = (item: PageRecord, isActive: boolean) =>
  updatePage(item.id, {
    page: item.page,
    page_slug: item.page_slug,
    is_active: isActive,
  });
