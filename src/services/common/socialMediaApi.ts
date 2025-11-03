const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/backend";

export interface SocialMedia {
  id?: number;
  name: string;
  icon: string | null;
  icon_alt: string;
  link: string;
  sort_order?: number;
  status?: boolean;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SocialMediaResponse {
  success: boolean;
  message: string;
  timestamp: string;
  statusCode: number;
  data: {
    data: SocialMedia[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied: boolean;
    };
  };
}

export interface SocialMediaItemResponse {
  success: boolean;
  message: string;
  timestamp: string;
  statusCode: number;
  data: SocialMedia;
}

export interface CreateSocialMediaData {
  name: string;
  icon?: File | string;
  icon_alt: string;
  link: string;
  sort_order?: number;
  status?: boolean;
}

// Fetch all social media items
export const fetchSocialMediaList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<SocialMediaResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (search) {
    params.append('search', search);
  }

  const response = await fetch(`${API_BASE_URL}/social-media?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch social media data");
  }

  return response.json();
};

// Fetch single social media item
export const fetchSocialMediaById = async (id: number): Promise<SocialMediaItemResponse> => {
  const response = await fetch(`${API_BASE_URL}/social-media/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch social media item");
  }

  return response.json();
};

// Create social media item
export const createSocialMedia = async (formData: FormData): Promise<SocialMediaItemResponse> => {
  const response = await fetch(`${API_BASE_URL}/social-media`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to create social media item");
  }

  return response.json();
};

// Update social media item
export const updateSocialMedia = async (
  id: number,
  formData: FormData
): Promise<SocialMediaItemResponse> => {
  const response = await fetch(`${API_BASE_URL}/social-media/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to update social media item");
  }

  return response.json();
};

// Delete social media item
export const deleteSocialMedia = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/social-media/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete social media item");
  }
};

// Toggle status
export const toggleSocialMediaStatus = async (id: number): Promise<SocialMediaItemResponse> => {
  const response = await fetch(`${API_BASE_URL}/social-media/${id}/toggle-status`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error("Failed to toggle social media status");
  }

  return response.json();
};