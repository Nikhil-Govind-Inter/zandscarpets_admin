import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { apiFetch } from "@/lib/apiClient";

// Common Items > Milestones — backed by `/api/backend/common/milestones`. File upload via
// FormData, following the same media-path round-trip rules as
// homeMilestonesApi.ts; envelope parsing follows the apiFetch + ApiError
// convention from pagesApi.ts.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const COMMON_MILESTONES_URL = `${API_BASE_URL}/common/milestones`;

export interface CommonMilestonesRecord {
  id: number;
  media_path: string | null;
  media_alt: string | null;
  media_alt_ar: string | null;
  value: string;
  value_ar: string;
  label: string;
  label_ar: string;
  sort_order: number;
  is_active: boolean;
  show_in_home: boolean;
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

export interface CommonMilestonesListResponse {
  data: {
    data: CommonMilestonesRecord[];
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
export const fetchCommonMilestoneList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<CommonMilestonesListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${COMMON_MILESTONES_URL}?${params}`);
  return parseEnvelope<CommonMilestonesListResponse["data"]>(response);
};

export const fetchCommonMilestoneById = async (
  id: number,
): Promise<{ data: CommonMilestonesRecord }> => {
  const response = await apiFetch(`${COMMON_MILESTONES_URL}/${id}`);
  return parseEnvelope<CommonMilestonesRecord>(response);
};

export const createCommonMilestone = async (
  formData: FormData,
): Promise<{ data: CommonMilestonesRecord }> => {
  const response = await apiFetch(COMMON_MILESTONES_URL, {
    method: "POST",
    body: formData,
  });
  return parseEnvelope<CommonMilestonesRecord>(response);
};

export const updateCommonMilestone = async (
  id: number,
  formData: FormData,
): Promise<{ data: CommonMilestonesRecord }> => {
  const response = await apiFetch(`${COMMON_MILESTONES_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<CommonMilestonesRecord>(response);
};

export const deleteCommonMilestone = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${COMMON_MILESTONES_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

export const toggleCommonMilestoneStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("common-milestones", item.id!, isActive);

export const updateCommonMilestoneSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("common-milestones", item.id!, sortOrder);
