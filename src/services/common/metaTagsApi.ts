export interface MetaTag {
  id: number;
  page: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  other_meta_tags?: string | null;
  canonical_url?: string | null;
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

export interface UpdateMetaTagRequest {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  other_meta_tags?: string;
  canonical_url?: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3000/api/backend";

export const fetchMetaTagsList = async (): Promise<MetaTagsListResponse> => {
  const response = await fetch(`${API_BASE_URL}/meta-tags`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch meta tags");
  }

  return response.json();
};

export const updateMetaTag = async (
  id: number,
  data: UpdateMetaTagRequest
): Promise<{ success: boolean; message: string; data?: MetaTag }> => {
  const formData = new FormData();

  formData.append("meta_title", data.meta_title);
  formData.append("meta_description", data.meta_description);
  formData.append("meta_keywords", data.meta_keywords);

  if (data.other_meta_tags) {
    formData.append("other_meta_tags", data.other_meta_tags);
  }

  if (data.canonical_url) {
    formData.append("canonical_url", data.canonical_url);
  }

  const response = await fetch(`${API_BASE_URL}/meta-tags/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to update meta tag");
  }

  return response.json();
};
