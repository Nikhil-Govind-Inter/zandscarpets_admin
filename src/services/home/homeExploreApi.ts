import { apiFetch } from "@/lib/apiClient";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface HomeExplore {
  id?: number;
  title: string;
  description: string;
  button_text: string;
  button_text_link: string;
  media_path: string | File;
  media_alt: string;
  status: boolean;
  sort_order: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeExploreResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: {
    list: HomeExplore[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied: boolean;
    };
  };
}

export interface HomeExploreSingleResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: HomeExplore;
}

// Fetch Home Explores with pagination and search
export const fetchHomeExplores = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<HomeExploreResponse> => {
  let url = `${API_BASE_URL}/backend/home/home-explore-our-expertise?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  const response = await apiFetch(url, {
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Home Explores");
  }

  return response.json();
};

// Fetch single Home Explore by ID
export const fetchHomeExploreById = async (
  id: number
): Promise<HomeExploreSingleResponse> => {
  const response = await apiFetch(
    `${API_BASE_URL}/backend/home/home-explore-our-expertise/${id}`,
    {
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Home Explore");
  }

  return response.json();
};

// Create or Update Home Explore
export const saveHomeExplore = async (
  data: {
    title: string;
    description: string;
    button_text: string;
    button_text_link: string;
    media_file?: File;
    media_alt: string;
    status: boolean;
    sort_order: number;
  },
  id?: number
): Promise<HomeExploreSingleResponse> => {
  const formData = new FormData();

  // Append all fields
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("button_text", data.button_text);
  formData.append("button_text_link", data.button_text_link);
  formData.append("media_alt", data.media_alt);
  formData.append("status", data.status ? "1" : "0");
  formData.append("sort_order", data.sort_order.toString());

  // Append file if provided
  if (data.media_file) {
    formData.append("media_path", data.media_file);
  }

  const url = id 
    ? `${API_BASE_URL}/backend/home/home-explore-our-expertise/${id}`
    : `${API_BASE_URL}/backend/home/home-explore-our-expertise`;

  const response = await apiFetch(url, {
    method: id ? "PUT" : "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save Home Explore");
  }

  return response.json();
};

// Delete Home Explore
export const deleteHomeExplore = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiFetch(
    `${API_BASE_URL}/backend/home/home-explore-our-expertise/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete Home Explore");
  }

  return response.json();
};