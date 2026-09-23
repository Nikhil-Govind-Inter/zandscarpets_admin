import { apiFetch } from "@/lib/apiClient";

// About > Milestones — backed by `/api/backend/about/milestones`. No media fields, so this
// mirrors historyApi.ts's plain-JSON shape exactly (year/title/description -> label/value).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MILESTONES_URL = `${API_BASE_URL}/about/milestones`;

export interface MilestonesRecord {
  id: number;
  label: string;
  label_ar: string;
  value: string;
  value_ar: string;
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

export interface MilestonesListResponse {
  data: {
    data: MilestonesRecord[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied?: boolean;
    };
  };
}

export interface MilestonesPayload {
  label: string;
  label_ar: string;
  value: string;
  value_ar: string;
  sort_order: number;
  is_active: boolean;
}

// Fetcher shape matches usePaginatedList's `Fetcher<T>` contract.
export const fetchMilestonesList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<MilestonesListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${MILESTONES_URL}?${params}`);
  return parseEnvelope<MilestonesListResponse["data"]>(response);
};

export const fetchMilestonesById = async (
  id: number,
): Promise<{ data: MilestonesRecord }> => {
  const response = await apiFetch(`${MILESTONES_URL}/${id}`);
  return parseEnvelope<MilestonesRecord>(response);
};

export const createMilestones = async (
  payload: MilestonesPayload,
): Promise<{ data: MilestonesRecord }> => {
  const response = await apiFetch(MILESTONES_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<MilestonesRecord>(response);
};

export const updateMilestones = async (
  id: number,
  payload: MilestonesPayload,
): Promise<{ data: MilestonesRecord }> => {
  const response = await apiFetch(`${MILESTONES_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseEnvelope<MilestonesRecord>(response);
};

export const deleteMilestones = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${MILESTONES_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

// Server has no partial-patch route, so quick actions must resend the full record.
export const toggleMilestonesStatus = (item: MilestonesRecord, isActive: boolean) =>
  updateMilestones(item.id, {
    label: item.label,
    label_ar: item.label_ar,
    value: item.value,
    value_ar: item.value_ar,
    sort_order: item.sort_order,
    is_active: isActive,
  });

export const updateMilestonesSortOrder = (item: MilestonesRecord, sortOrder: number) =>
  updateMilestones(item.id, {
    label: item.label,
    label_ar: item.label_ar,
    value: item.value,
    value_ar: item.value_ar,
    sort_order: Math.max(1, sortOrder),
    is_active: item.is_active,
  });
