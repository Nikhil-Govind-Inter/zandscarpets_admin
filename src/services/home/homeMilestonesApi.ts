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
  value: string;
  label: string;
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

// Server has no partial-patch route, so quick actions must resend the full
// record (see adsMilestonesApi.ts's buildAdsMilestonesFormData for the same
// convention). media_path needs special handling: multerMiddleware only
// keeps a text media_path value if it's a freshly uploaded file or an
// absolute `https?://<host>/uploads/...` URL — a bare relative path (what's
// actually held in state/returned by the API) matches neither and gets
// silently dropped.
const buildHomeMilestonesFormData = (
  item: HomeMilestonesRecord,
  overrides: Partial<
    Pick<
      HomeMilestonesRecord,
      "value" | "label" | "media_alt" | "sort_order" | "is_active"
    >
  >,
): FormData => {
  const formData = new FormData();
 
  formData.append("value", overrides.value ?? item.value ?? "");
  formData.append(
    "label",
    overrides.label ?? item.label ?? "",
  );
  formData.append("media_alt", overrides.media_alt ?? item.media_alt ?? "");
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

export const toggleHomeMilestoneStatus = (
  item: HomeMilestonesRecord,
  isActive: boolean,
) =>
  updateHomeMilestone(
    item.id,
    buildHomeMilestonesFormData(item, { is_active: isActive }),
  );

export const updateHomeMilestoneSortOrder = (
  item: HomeMilestonesRecord,
  sortOrder: number,
) =>
  updateHomeMilestone(
    item.id,
    buildHomeMilestonesFormData(item, { sort_order: Math.max(1, sortOrder) }),
  );
