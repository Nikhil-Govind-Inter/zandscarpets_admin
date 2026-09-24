import { apiFetch } from "@/lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const baseUrl = `${API_BASE_URL}/site-settings/floating-icon`;

export interface FloatingIcon {
  id?: number;
  media_path: string | null;
  media_alt: string;
  media_alt_ar?: string;
  link: string;
  sort_order?: number;
  is_active?: boolean;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FloatingIconResponse {
  success: boolean;
  message: string;
  timestamp: string;
  statusCode: number;
  data: {
    data: FloatingIcon[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied: boolean;
    };
  };
}

export interface FloatingIconItemResponse {
  success: boolean;
  message: string;
  timestamp: string;
  statusCode: number;
  data: FloatingIcon;
}

export interface CreateFloatingIconData {
  media_path?: File | string;
  media_alt: string;
  link: string;
  sort_order?: number;
  is_active?: boolean;
}

// Fetch all floating icon items
export const fetchFloatingIconList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<FloatingIconResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${baseUrl}?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch floating icon data");
  }

  return response.json();
};

// Fetch single floating icon item
export const fetchFloatingIconById = async (
  id: number,
): Promise<FloatingIconItemResponse> => {
  const response = await apiFetch(`${baseUrl}/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch floating icon item");
  }

  return response.json();
};

// Create floating icon item
export const createFloatingIcon = async (
  formData: FormData,
): Promise<FloatingIconItemResponse> => {
  const response = await apiFetch(`${baseUrl}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to create floating icon item");
  }

  return response.json();
};

// Update floating icon item
export const updateFloatingIcon = async (
  id: number,
  formData: FormData,
): Promise<FloatingIconItemResponse> => {
  const response = await apiFetch(`${baseUrl}/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to update floating icon item");
  }

  return response.json();
};

// Delete floating icon item
export const deleteFloatingIcon = async (id: number): Promise<void> => {
  const response = await apiFetch(`${baseUrl}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete floating icon item");
  }
};

// The backend validates every field as required on PUT /:id (no partial-patch
// support anywhere in this API — see floatingIconRequest.js), so quick actions
// like toggling status or bumping sort order must resend the full record, not
// just the one field that changed. This builds that full FormData from the
// current row plus whatever's being overridden.
//
// media_path needs special handling: multerMiddleware only keeps a text
// media_path value if it's a freshly uploaded file or a URL matching
// `https?://<host>/uploads/<subfolder>/...` — a bare relative path (what's
// actually held in state/returned by the API) matches neither and gets
// silently dropped, which then fails the "Media path is required" check. So
// we resend it as an absolute URL to round-trip correctly.
const buildFloatingIconFormData = (
  item: FloatingIcon,
  overrides: Partial<
    Pick<FloatingIcon, "media_alt" | "link" | "sort_order" | "is_active" | "media_alt_ar">
  >,
): FormData => {
  const formData = new FormData();
  formData.append("media_alt", overrides.media_alt ?? item.media_alt ?? "");
  formData.append("media_alt_ar", overrides.media_alt_ar ?? item.media_alt_ar ?? "");
  formData.append("link", overrides.link ?? item.link ?? "");
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

// Toggle status — resends the full record (see buildFloatingIconFormData)
// since there is no separate toggle-status route on the backend.
export const toggleFloatingIconStatus = (item: FloatingIcon, isActive: boolean) =>
  updateFloatingIcon(
    item.id!,
    buildFloatingIconFormData(item, { is_active: isActive }),
  );

// Persist a new sort order — same idea, clamped to the backend's `min: 1`.
export const updateFloatingIconSortOrder = (
  item: FloatingIcon,
  sortOrder: number,
) =>
  updateFloatingIcon(
    item.id!,
    buildFloatingIconFormData(item, { sort_order: Math.max(1, sortOrder) }),
  );
