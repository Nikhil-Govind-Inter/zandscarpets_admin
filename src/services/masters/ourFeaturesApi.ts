import { apiFetch } from "@/lib/apiClient";

// Masters > Our Features — backed by `/api/backend/masters/our-features`.
// Uses the apiFetch + ApiError + envelope-parsing convention from
// pagesApi.ts.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

const OUR_FEATURES_URL = `${API_BASE_URL}/masters/our-features`;

export interface OurFeatureRecord {
  id: number;
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

export interface OurFeaturesListResponse {
  data: {
    data: OurFeatureRecord[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied?: boolean;
    };
  };
}

export interface OurFeaturePayload {
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

// Fetcher shape matches usePaginatedList's `Fetcher<T>` contract.
export const fetchOurFeaturesList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<OurFeaturesListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${OUR_FEATURES_URL}?${params}`);
  return parseEnvelope<OurFeaturesListResponse["data"]>(response);
};

export const fetchOurFeatureById = async (
  id: number,
): Promise<{ data: OurFeatureRecord }> => {
  const response = await apiFetch(`${OUR_FEATURES_URL}/${id}`);
  return parseEnvelope<OurFeatureRecord>(response);
};

export const createOurFeature = async (
  payload: OurFeaturePayload,
): Promise<{ data: OurFeatureRecord }> => {
  const response = await apiFetch(OUR_FEATURES_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<OurFeatureRecord>(response);
};

export const updateOurFeature = async (
  id: number,
  payload: OurFeaturePayload,
): Promise<{ data: OurFeatureRecord }> => {
  const response = await apiFetch(`${OUR_FEATURES_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<OurFeatureRecord>(response);
};

export const deleteOurFeature = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${OUR_FEATURES_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

// Server has no partial-patch route, so quick actions must resend the full
// record (see pagesApi.ts's togglePageStatus for the same convention).
export const toggleOurFeatureStatus = (
  item: OurFeatureRecord,
  isActive: boolean,
) =>
  updateOurFeature(item.id, {
    title: item.title,
    description: item.description,
    sort_order: item.sort_order,
    is_active: isActive,
  });

export const updateOurFeatureSortOrder = (
  item: OurFeatureRecord,
  sortOrder: number,
) =>
  updateOurFeature(item.id, {
    title: item.title,
    description: item.description,
    sort_order: Math.max(1, sortOrder),
    is_active: item.is_active,
  });
