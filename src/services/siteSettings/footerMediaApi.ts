import { apiFetch } from "@/lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/backend";

const baseUrl = `${API_BASE_URL}/site-settings/footer-media`;

export interface FooterMedia {
  id?: number;
  media_path: string | null;
  media_alt: string;
  sort_order?: number;
  is_active?: boolean;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FooterMediaResponse {
  success: boolean;
  message: string;
  timestamp: string;
  statusCode: number;
  data: {
    data: FooterMedia[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied: boolean;
    };
  };
}

export interface FooterMediaItemResponse {
  success: boolean;
  message: string;
  timestamp: string;
  statusCode: number;
  data: FooterMedia;
}

export interface CreateFooterMediaData {
  media_path?: File | string;
  media_alt: string;
  sort_order?: number;
  is_active?: boolean;
}

// Fetch all footer media items
export const fetchFooterMediaList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<FooterMediaResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append('search', search);
  }

  const response = await apiFetch(`${baseUrl}?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch footer media data");
  }

  return response.json();
};

// Fetch single footer media item
export const fetchFooterMediaById = async (id: number): Promise<FooterMediaItemResponse> => {
  const response = await apiFetch(`${baseUrl}/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch footer media item");
  }

  return response.json();
};

// Create footer media item
export const createFooterMedia = async (formData: FormData): Promise<FooterMediaItemResponse> => {
  const response = await apiFetch(`${baseUrl}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to create footer media item");
  }

  return response.json();
};

// Update footer media item
export const updateFooterMedia = async (
  id: number,
  formData: FormData
): Promise<FooterMediaItemResponse> => {
  const response = await apiFetch(`${baseUrl}/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to update footer media item");
  }

  return response.json();
};

// Delete footer media item
export const deleteFooterMedia = async (id: number): Promise<void> => {
  const response = await apiFetch(`${baseUrl}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete footer media item");
  }
};

// The backend validates every field as required on PUT /:id (no partial-patch
// support anywhere in this API — see footerMediaRequest.js), so quick actions
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
const buildFooterMediaFormData = (
  item: FooterMedia,
  overrides: Partial<Pick<FooterMedia, "media_alt" | "sort_order" | "is_active">>
): FormData => {
  const formData = new FormData();
  formData.append("media_alt", overrides.media_alt ?? item.media_alt ?? "");
  formData.append("sort_order", ((overrides.sort_order ?? item.sort_order ?? 1)).toString());
  formData.append("is_active", ((overrides.is_active ?? item.is_active ?? true)).toString());

  if (item.media_path) {
    const isAbsoluteUrl = /^https?:\/\//.test(item.media_path);
    const mediaPath = isAbsoluteUrl
      ? item.media_path
      : `${import.meta.env.VITE_IMAGE_URL}/${item.media_path}`;
    formData.append("media_path", mediaPath);
  }

  return formData;
};

// Toggle status — resends the full record (see buildFooterMediaFormData)
// since there is no separate toggle-status route on the backend.
export const toggleFooterMediaStatus = (item: FooterMedia, isActive: boolean) =>
  updateFooterMedia(item.id!, buildFooterMediaFormData(item, { is_active: isActive }));

// Persist a new sort order — same idea, clamped to the backend's `min: 1`.
export const updateFooterMediaSortOrder = (item: FooterMedia, sortOrder: number) =>
  updateFooterMedia(item.id!, buildFooterMediaFormData(item, { sort_order: Math.max(1, sortOrder) }));
