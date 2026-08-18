import { apiFetch } from "@/lib/apiClient";

export interface MetaTag {
  id: number;
  page: {
    id: number;
    page: string;
    page_slug: string;
    is_active?: boolean;
  };
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  deleted_at?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MetaTagsListResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: {
    data: MetaTag[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied: boolean;
    };
  };
}

export interface MetaTagItemResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: MetaTag;
}

export interface UpdateMetaTagRequest {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

// Fetch all Meta Tags with pagination and search
export const fetchMetaTagsList = async (
  page: number = 1,
  limit: number = 15,
  search?: string
): Promise<MetaTagsListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(
    `${API_BASE_URL}/site-settings/meta-data?${params}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch meta tags");
  }

  return response.json();
};

export const updateMetaTag = async (
  id: number,
  data: UpdateMetaTagRequest
): Promise<MetaTagItemResponse> => {
  const response = await apiFetch(`${API_BASE_URL}/site-settings/meta-data/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update meta tag");
  }

  return response.json();
};
