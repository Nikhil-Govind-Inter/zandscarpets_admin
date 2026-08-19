import { apiFetch } from "@/lib/apiClient";

// Masters > Industry — backed by `/api/backend/masters/industry`. Uses the
// apiFetch + ApiError + envelope-parsing convention from pagesApi.ts.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const INDUSTRY_URL = `${API_BASE_URL}/masters/industry`;

export interface IndustryRecord {
  id: number;
  title: string;
  slug: string;
  description: string;
  link?: string | null;
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

export interface IndustryListResponse {
  data: {
    data: IndustryRecord[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied?: boolean;
    };
  };
}

export interface IndustryPayload {
  title: string;
  slug: string;
  description: string;
  link?: string;
  sort_order: number;
  is_active: boolean;
}

// Fetcher shape matches usePaginatedList's `Fetcher<T>` contract.
export const fetchIndustryList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<IndustryListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${INDUSTRY_URL}?${params}`);
  return parseEnvelope<IndustryListResponse["data"]>(response);
};

export const fetchIndustryById = async (
  id: number,
): Promise<{ data: IndustryRecord }> => {
  const response = await apiFetch(`${INDUSTRY_URL}/${id}`);
  return parseEnvelope<IndustryRecord>(response);
};

export const fetchActiveIndustries = async (): Promise<{
  data: IndustryRecord[];
}> => {
  const response = await apiFetch(`${INDUSTRY_URL}/active`);
  return parseEnvelope<IndustryRecord[]>(response);
};

export const createIndustry = async (
  payload: IndustryPayload,
): Promise<{ data: IndustryRecord }> => {
  const response = await apiFetch(INDUSTRY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<IndustryRecord>(response);
};

export const updateIndustry = async (
  id: number,
  payload: IndustryPayload,
): Promise<{ data: IndustryRecord }> => {
  const response = await apiFetch(`${INDUSTRY_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<IndustryRecord>(response);
};

export const deleteIndustry = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${INDUSTRY_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

// Server has no partial-patch route, so quick actions must resend the full
// record (see pagesApi.ts's togglePageStatus for the same convention).
export const toggleIndustryStatus = (item: IndustryRecord, isActive: boolean) =>
  updateIndustry(item.id, {
    title: item.title,
    slug: item.slug,
    description: item.description,
    link: item.link ?? undefined,
    sort_order: item.sort_order,
    is_active: isActive,
  });

export const updateIndustrySortOrder = (
  item: IndustryRecord,
  sortOrder: number,
) =>
  updateIndustry(item.id, {
    title: item.title,
    slug: item.slug,
    description: item.description,
    link: item.link ?? undefined,
    sort_order: Math.max(1, sortOrder),
    is_active: item.is_active,
  });
