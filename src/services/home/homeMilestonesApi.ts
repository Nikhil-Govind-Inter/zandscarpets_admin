import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { apiFetch } from "@/lib/apiClient";

// Home > Milestones — backed by `/api/backend/home/home-milestones`. File upload via
// FormData, following the same media-path round-trip rules as
// adsMilestonesApi.ts; envelope parsing follows the apiFetch + ApiError
// convention from pagesApi.ts.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HOME_BANNER_URL = `${API_BASE_URL}/home/home-milestones`;

export interface HomeMilestonesRecord {
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

export interface HomeMilestonesListResponse {
  data: {
    data: HomeMilestonesRecord[];
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
export const fetchHomeMilestoneList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<HomeMilestonesListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${HOME_BANNER_URL}?${params}`);
  return parseEnvelope<HomeMilestonesListResponse["data"]>(response);
};

export const fetchHomeMilestoneById = async (
  id: number,
): Promise<{ data: HomeMilestonesRecord }> => {
  const response = await apiFetch(`${HOME_BANNER_URL}/${id}`);
  return parseEnvelope<HomeMilestonesRecord>(response);
};

export const createHomeMilestone = async (
  formData: FormData,
): Promise<{ data: HomeMilestonesRecord }> => {
  const response = await apiFetch(HOME_BANNER_URL, {
    method: "POST",
    body: formData,
  });
  return parseEnvelope<HomeMilestonesRecord>(response);
};

export const updateHomeMilestone = async (
  id: number,
  formData: FormData,
): Promise<{ data: HomeMilestonesRecord }> => {
  const response = await apiFetch(`${HOME_BANNER_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<HomeMilestonesRecord>(response);
};

export const deleteHomeMilestone = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${HOME_BANNER_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

export const toggleHomeMilestoneStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("home-milestones", item.id!, isActive);

export const updateHomeMilestoneSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("home-milestones", item.id!, sortOrder);
