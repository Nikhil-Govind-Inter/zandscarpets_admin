import { apiFetch } from "@/lib/apiClient";

// Shared plumbing for the Products > Sizes/Colors/Tags/Product Tags/Products/FAQ/Media
// services: the apiFetch + ApiError + envelope-parsing convention from pagesApi.ts,
// defined once here and re-exported by each resource file.
export const PRODUCTS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/products`;

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

// Backend express-validator / relation errors: `{ path, msg }` per field.
export interface ApiFieldError {
  path?: string;
  msg?: string;
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

  get fieldErrors(): ApiFieldError[] {
    return Array.isArray(this.details) ? (this.details as ApiFieldError[]) : [];
  }
}

export const parseEnvelope = async <T>(
  response: Response,
): Promise<ApiEnvelope<T>> => {
  const body = await response
    .json()
    .catch(() => ({}) as ApiEnvelope<T> & ApiErrorEnvelope);
  if (!response.ok || !body.success) {
    const errorBody = body as ApiErrorEnvelope;
    // A validation failure's top-level message is just "Validation failed";
    // surface the first field message instead so toasts are useful.
    const details = errorBody.error?.details;
    const firstDetail = Array.isArray(details)
      ? (details[0] as ApiFieldError | undefined)?.msg
      : undefined;
    const message =
      firstDetail ||
      errorBody.error?.message ||
      errorBody.message ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, errorBody.error?.code, details);
  }
  return body;
};

export interface PaginatedListResponse<T> {
  data: {
    data: T[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied?: boolean;
    };
  };
}

export const listParams = (
  page: number,
  limit: number,
  search?: string,
  extra?: Record<string, string | number | undefined>,
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.append("search", search);
  Object.entries(extra || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.append(key, String(value));
  });
  return params;
};

type Body = FormData | object;

const send = async <T>(url: string, method: string, body?: Body) => {
  const init: RequestInit = { method };
  if (body instanceof FormData) {
    init.body = body;
  } else if (body) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(body);
  }
  const response = await apiFetch(url, init);
  return parseEnvelope<T>(response);
};

// Standard list/get/active/create/update/delete calls for one resource URL.
export const createCrudApi = <TRecord, TActive = TRecord>(baseUrl: string) => ({
  list: (
    page: number,
    limit: number,
    search?: string,
    extra?: Record<string, string | number | undefined>,
  ) =>
    apiFetch(`${baseUrl}?${listParams(page, limit, search, extra)}`).then(
      (response) =>
        parseEnvelope<PaginatedListResponse<TRecord>["data"]>(response),
    ),
  getById: (id: number) => apiFetch(`${baseUrl}/${id}`).then((r) => parseEnvelope<TRecord>(r)),
  active: (query = "") =>
    apiFetch(`${baseUrl}/active${query}`).then((r) => parseEnvelope<TActive[]>(r)),
  create: (body: Body) => send<TRecord>(baseUrl, "POST", body),
  update: (id: number, body: Body) => send<TRecord>(`${baseUrl}/${id}`, "PUT", body),
  remove: (id: number) => send<{ id: number }>(`${baseUrl}/${id}`, "DELETE"),
});
