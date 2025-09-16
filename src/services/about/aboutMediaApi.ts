const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface AboutMediaItem {
  id?: number;
  thumbnail: string | File;
  thumbnail_alt: string;
  media_type: "image" | "video";
  media_desktop_path: string | File;
  media_mobile_path: string | File;
  media_alt: string;
  status: boolean;
  sort_order: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AboutMediaResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: {
    list: AboutMediaItem[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied: boolean;
    };
  };
}

export interface AboutMediaSingleResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: AboutMediaItem;
}

// Fetch About Media items with pagination and search
export const fetchAboutMedia = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<AboutMediaResponse> => {
  let url = `${API_BASE_URL}/backend/about/about-media?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch About Media items");
  }

  return response.json();
};

// Fetch single About Media item by ID
export const fetchAboutMediaById = async (
  id: number
): Promise<AboutMediaSingleResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/backend/about/about-media/${id}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch About Media item");
  }

  return response.json();
};

// Create or Update About Media item
export const saveAboutMediaItem = async (
  data: {
    thumbnail?: File;
    thumbnail_alt: string;
    media_type: "image" | "video";
    media_desktop_file?: File;
    media_mobile_file?: File;
    media_alt: string;
    status: boolean;
    sort_order: number;
  },
  id?: number
): Promise<AboutMediaSingleResponse> => {
  const formData = new FormData();

  // Append all fields
  formData.append("thumbnail_alt", data.thumbnail_alt);
  formData.append("media_type", data.media_type);
  formData.append("media_alt", data.media_alt);
  formData.append("status", data.status ? "1" : "0");
  formData.append("sort_order", data.sort_order.toString());

  // Append files if provided
  if (data.thumbnail) {
    formData.append("thumbnail", data.thumbnail);
  }
  if (data.media_desktop_file) {
    formData.append("media_desktop_path", data.media_desktop_file);
  }
  if (data.media_mobile_file) {
    formData.append("media_mobile_path", data.media_mobile_file);
  }

  const url = id 
    ? `${API_BASE_URL}/backend/about/about-media/${id}`
    : `${API_BASE_URL}/backend/about/about-media`;

  const response = await fetch(url, {
    method: id ? "PUT" : "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save About Media item");
  }

  return response.json();
};

// Delete About Media item
export const deleteAboutMediaItem = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(
    `${API_BASE_URL}/backend/about/about-media/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete About Media item");
  }

  return response.json();
};