import { apiFetch } from "@/lib/apiClient";

// Services > Process Steps — backed by `/api/backend/services/process-steps`. File
// upload via FormData, following the same media-path round-trip rules as
// homeMilestonesApi.ts; envelope parsing follows the apiFetch + ApiError convention
// from pagesApi.ts.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PROCESS_STEP_URL = `${API_BASE_URL}/services/process-steps`;

export interface ProcessStepRecord {
  id: number;
  title: string;
  description: string;
  media_path: string | null;
  media_alt: string | null;
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

export interface ProcessStepListResponse {
  data: {
    data: ProcessStepRecord[];
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
export const fetchProcessStepList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<ProcessStepListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${PROCESS_STEP_URL}?${params}`);
  return parseEnvelope<ProcessStepListResponse["data"]>(response);
};

export const fetchProcessStepById = async (
  id: number,
): Promise<{ data: ProcessStepRecord }> => {
  const response = await apiFetch(`${PROCESS_STEP_URL}/${id}`);
  return parseEnvelope<ProcessStepRecord>(response);
};

export const createProcessStep = async (
  formData: FormData,
): Promise<{ data: ProcessStepRecord }> => {
  const response = await apiFetch(PROCESS_STEP_URL, {
    method: "POST",
    body: formData,
  });
  return parseEnvelope<ProcessStepRecord>(response);
};

export const updateProcessStep = async (
  id: number,
  formData: FormData,
): Promise<{ data: ProcessStepRecord }> => {
  const response = await apiFetch(`${PROCESS_STEP_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<ProcessStepRecord>(response);
};

export const deleteProcessStep = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${PROCESS_STEP_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

// Server has no partial-patch route, so quick actions must resend the full
// record (see homeMilestonesApi.ts's buildHomeMilestonesFormData for the same
// convention). media_path needs special handling: multerMiddleware only
// keeps a text media_path value if it's a freshly uploaded file or an
// absolute `https?://<host>/uploads/...` URL — a bare relative path (what's
// actually held in state/returned by the API) matches neither and gets
// silently dropped.
const buildProcessStepFormData = (
  item: ProcessStepRecord,
  overrides: Partial<
    Pick<
      ProcessStepRecord,
      "title" | "description" | "media_alt" | "sort_order" | "is_active"
    >
  >,
): FormData => {
  const formData = new FormData();

  formData.append("title", overrides.title ?? item.title ?? "");
  formData.append(
    "description",
    overrides.description ?? item.description ?? "",
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

export const toggleProcessStepStatus = (
  item: ProcessStepRecord,
  isActive: boolean,
) =>
  updateProcessStep(
    item.id,
    buildProcessStepFormData(item, { is_active: isActive }),
  );

export const updateProcessStepSortOrder = (
  item: ProcessStepRecord,
  sortOrder: number,
) =>
  updateProcessStep(
    item.id,
    buildProcessStepFormData(item, { sort_order: Math.max(1, sortOrder) }),
  );
