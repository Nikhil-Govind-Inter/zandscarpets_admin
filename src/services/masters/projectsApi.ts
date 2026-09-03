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
  thumbnail: string | null;
  title: string;
  location: string | null;
  date_of_completion: string | null;
  material_type: string | null;
  media_path: string | null;
  description: string | null;
  project_media: string[];
  is_active: boolean;
  is_show_in_home: boolean;
  sort_order: number;
  category?: { id: number; title: string } | null;
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

// Server has no partial-patch route, so quick actions must resend the full
// record (see homeBannerApi.ts's buildHomeBannerFormData for the same
// convention). thumbnail/media_path need the same absolute-URL round trip so
// multerMiddleware recognizes the unchanged file instead of dropping it.
// project_media is resent as-is (already relative `uploads/projects/...`
// paths, which the controller's own gallery parsing recognizes directly).
// related_project_ids is deliberately omitted — list rows don't carry
// relatedProjects, and omitting the field tells the controller to leave the
// relation untouched rather than wiping it.
const toAbsoluteMediaUrl = (path: string) => {
  const isAbsoluteUrl = /^https?:\/\//.test(path);
  return isAbsoluteUrl ? path : `${import.meta.env.VITE_IMAGE_URL}/${path}`;
};

const buildProjectFormData = (
  item: ProjectRecord,
  overrides: Partial<
    Pick<
      ProjectRecord,
      | "category_id"
      | "title"
      | "location"
      | "date_of_completion"
      | "material_type"
      | "description"
      | "sort_order"
      | "is_active"
      | "is_show_in_home"
    >
  >,
): FormData => {
  const formData = new FormData();
  formData.append(
    "category_id",
    (overrides.category_id ?? item.category_id).toString(),
  );
  formData.append("title", overrides.title ?? item.title ?? "");
  formData.append("location", overrides.location ?? item.location ?? "");
  formData.append(
    "date_of_completion",
    overrides.date_of_completion ?? item.date_of_completion ?? "",
  );
  formData.append(
    "material_type",
    overrides.material_type ?? item.material_type ?? "",
  );
  formData.append(
    "description",
    overrides.description ?? item.description ?? "",
  );
  formData.append(
    "sort_order",
    (overrides.sort_order ?? item.sort_order ?? 0).toString(),
  );
  formData.append(
    "is_active",
    (overrides.is_active ?? item.is_active ?? true).toString(),
  );
  formData.append(
    "is_show_in_home",
    (overrides.is_show_in_home ?? item.is_show_in_home ?? false).toString(),
  );

  if (item.thumbnail)
    formData.append("thumbnail", toAbsoluteMediaUrl(item.thumbnail));
  if (item.media_path)
    formData.append("media_path", toAbsoluteMediaUrl(item.media_path));
  formData.append("project_media", JSON.stringify(item.project_media || []));

  return formData;
};

export const toggleProjectStatus = (item: ProjectRecord, isActive: boolean) =>
  updateProject(item.id, buildProjectFormData(item, { is_active: isActive }));

export const updateProjectSortOrder = (
  item: ProjectRecord,
  sortOrder: number,
) =>
  updateProject(
    item.id,
    buildProjectFormData(item, { sort_order: Math.max(0, sortOrder) }),
  );
