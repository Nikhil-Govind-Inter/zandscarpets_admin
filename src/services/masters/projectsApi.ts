import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { apiFetch } from "@/lib/apiClient";

// Masters > Projects — backed by `/api/backend/masters/projects`. File upload
// via FormData, following the media-path round-trip rules from
// homeBannerApi.ts; envelope parsing follows the apiFetch + ApiError
// convention from pagesApi.ts.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PROJECTS_URL = `${API_BASE_URL}/masters/projects`;

export interface ProjectRelatedRef {
  id: number;
  title: string;
  thumbnail: string | null;
}

export interface ProjectRecord {
  id: number;
  category_id: number;
  material_id: number | null;
  thumbnail: string | null;
  title: string;
  title_ar: string;
  location: string | null;
  location_ar: string | null;
  date_of_completion: string | null;
  material_type: string | null;
  material_type_ar: string | null;
  media_path: string | null;
  description: string | null;
  description_ar: string | null;
  project_media: string[];
  is_active: boolean;
  is_show_in_home: boolean;
  sort_order: number;
  category?: { id: number; title: string } | null;
  material?: { id: number; title: string } | null;
  relatedProjects?: ProjectRelatedRef[];
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

export interface ProjectsListResponse {
  data: {
    data: ProjectRecord[];
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
export const fetchProjectsList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<ProjectsListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${PROJECTS_URL}?${params}`);
  return parseEnvelope<ProjectsListResponse["data"]>(response);
};

export const fetchProjectById = async (
  id: number,
): Promise<{ data: ProjectRecord }> => {
  const response = await apiFetch(`${PROJECTS_URL}/${id}`);
  return parseEnvelope<ProjectRecord>(response);
};

// Dropdown/picker source for the "Related Projects" multi-select. Pass the
// project currently being edited (omit when creating) so it's excluded from
// its own related-projects options.
export const fetchActiveProjects = async (
  excludeId?: number,
): Promise<{
  data: ProjectRelatedRef[];
}> => {
  const query = excludeId ? `?excludeId=${excludeId}` : "";
  const response = await apiFetch(`${PROJECTS_URL}/active${query}`);
  return parseEnvelope<ProjectRelatedRef[]>(response);
};

export const createProject = async (
  formData: FormData,
): Promise<{ data: ProjectRecord }> => {
  const response = await apiFetch(PROJECTS_URL, {
    method: "POST",
    body: formData,
  });
  return parseEnvelope<ProjectRecord>(response);
};

export const updateProject = async (
  id: number,
  formData: FormData,
): Promise<{ data: ProjectRecord }> => {
  const response = await apiFetch(`${PROJECTS_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return parseEnvelope<ProjectRecord>(response);
};

export const deleteProject = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${PROJECTS_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};

export const toggleProjectStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("projects", item.id!, isActive);

export const updateProjectSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("projects", item.id!, sortOrder);
