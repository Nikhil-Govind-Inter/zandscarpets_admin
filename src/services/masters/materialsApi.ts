import { apiFetch } from "@/lib/apiClient";

// Masters > Materials — backed by `/api/backend/masters/materials`. Uses the
// apiFetch + ApiError + envelope-parsing convention from industryApi.ts.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MATERIALS_URL = `${API_BASE_URL}/masters/materials`;

export interface MaterialRecord {
  id: number;
  title: string;
  title_ar?: string;
  slug: string;
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

export interface MaterialsListResponse {
  data: {
    data: MaterialRecord[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied?: boolean;
    };
  };
}

export interface MaterialPayload {
  title: string;
  title_ar?: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

// Fetcher shape matches usePaginatedList's `Fetcher<T>` contract.
export const fetchMaterialsList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<MaterialsListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${MATERIALS_URL}?${params}`);
  return parseEnvelope<MaterialsListResponse["data"]>(response);
};

export const fetchMaterialById = async (
  id: number,
): Promise<{ data: MaterialRecord }> => {
  const response = await apiFetch(`${MATERIALS_URL}/${id}`);
  return parseEnvelope<MaterialRecord>(response);
};

export const fetchActiveMaterials = async (): Promise<{
  data: MaterialRecord[];
}> => {
  const response = await apiFetch(`${MATERIALS_URL}/active`);
  return parseEnvelope<MaterialRecord[]>(response);
};

export const createMaterial = async (
  payload: MaterialPayload,
): Promise<{ data: MaterialRecord }> => {
  const response = await apiFetch(MATERIALS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<MaterialRecord>(response);
};

export const updateMaterial = async (
  id: number,
  payload: MaterialPayload,
): Promise<{ data: MaterialRecord }> => {
  const response = await apiFetch(`${MATERIALS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<MaterialRecord>(response);
};

export const deleteMaterial = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${MATERIALS_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

// Server has no partial-patch route, so quick actions must resend the full
// record (see industryApi.ts's toggleIndustryStatus for the same convention).
export const toggleMaterialStatus = (
  item: MaterialRecord,
  isActive: boolean,
) =>
  updateMaterial(item.id, {
    title: item.title,
    title_ar: item.title_ar,
    slug: item.slug,
    sort_order: item.sort_order,
    is_active: isActive,
  });

export const updateMaterialSortOrder = (
  item: MaterialRecord,
  sortOrder: number,
) =>
  updateMaterial(item.id, {
    title: item.title,
    title_ar: item.title_ar,
    slug: item.slug,
    sort_order: Math.max(1, sortOrder),
    is_active: item.is_active,
  });
