import { apiFetch } from "@/lib/apiClient";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface HomeBannerSlider {
  id?: number;
  title: string;
  description: string;
  media_type: "image" | "video";
  media_desktop_path: string | File;
  media_mobile_path: string | File;
  media_alt: string;
  button_text_one: string;
  button_text_one_link: string;
  button_text_two: string;
  button_text_two_link: string;
  status: boolean;
  sort_order: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeBannerSliderResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: {
    list: HomeBannerSlider[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied: boolean;
    };
  };
}

export interface HomeBannerSliderSingleResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: HomeBannerSlider;
}

// Fetch Home Banner Sliders with pagination and search
export const fetchHomeBannerSliders = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<HomeBannerSliderResponse> => {
  let url = `${API_BASE_URL}/backend/home/home-banner?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  const response = await apiFetch(url, {
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Home Banner Sliders");
  }

  return response.json();
};

// Fetch single Home Banner Slider by ID
export const fetchHomeBannerSliderById = async (
  id: number
): Promise<HomeBannerSliderSingleResponse> => {
  const response = await apiFetch(
    `${API_BASE_URL}/backend/home/home-banner/${id}`,
    {
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Home Banner Slider");
  }

  return response.json();
};

// Create or Update Home Banner Slider
export const saveHomeBannerSlider = async (
  data: {
    title: string;
    description: string;
    media_type: "image" | "video";
    media_desktop_file?: File;
    media_mobile_file?: File;
    media_alt: string;
    button_text_one: string;
    button_text_one_link: string;
    button_text_two: string;
    button_text_two_link: string;
    status: boolean;
    sort_order: number;
  },
  id?: number
): Promise<HomeBannerSliderSingleResponse> => {
  const formData = new FormData();

  // Append all text fields
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("media_type", data.media_type);
  formData.append("media_alt", data.media_alt);
  formData.append("button_text_one", data.button_text_one);
  formData.append("button_text_one_link", data.button_text_one_link);
  formData.append("button_text_two", data.button_text_two);
  formData.append("button_text_two_link", data.button_text_two_link);
  formData.append("status", data.status ? "1" : "0");
  formData.append("sort_order", data.sort_order.toString());

  // Append file fields if provided
  if (data.media_desktop_file) {
    formData.append("media_desktop_path", data.media_desktop_file);
  }
  if (data.media_mobile_file) {
    formData.append("media_mobile_path", data.media_mobile_file);
  }

  const url = id 
    ? `${API_BASE_URL}/backend/home/home-banner/${id}`
    : `${API_BASE_URL}/backend/home/home-banner`;

  const response = await apiFetch(url, {
    method: id ? "PUT" : "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save Home Banner Slider");
  }

  return response.json();
};

// Delete Home Banner Slider
export const deleteHomeBannerSlider = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiFetch(
    `${API_BASE_URL}/backend/home/home-banner/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete Home Banner Slider");
  }

  return response.json();
};