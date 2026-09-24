import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { apiFetch } from "@/lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const baseUrl = `${API_BASE_URL}/site-settings/footer-media`;

export interface FooterMedia {
  id?: number;
  media_path: string | null;
  media_alt: string;
  media_alt_ar?: string;
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
  media_alt_ar?: string;
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

// Quick status toggle / sort-order change via the shared single-field CMS endpoints.
export const toggleFooterMediaStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("footer-media", item.id!, isActive);

export const updateFooterMediaSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("footer-media", item.id!, sortOrder);
