import { apiFetch } from "@/lib/apiClient";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface HomeInvestment {
  id?: number;
  title: string;
  subtitle: string;
  description: string;
  button_text: string;
  button_text_link: string;
  status: boolean;
  sort_order: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeInvestmentResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: {
    list: HomeInvestment[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied: boolean;
    };
  };
}

export interface HomeInvestmentSingleResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: HomeInvestment;
}

// Fetch Home Investments with pagination and search
export const fetchHomeInvestments = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<HomeInvestmentResponse> => {
  let url = `${API_BASE_URL}/backend/home/home-investment?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  const response = await apiFetch(url, {
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Home Investments");
  }

  return response.json();
};

// Fetch single Home Investment by ID
export const fetchHomeInvestmentById = async (
  id: number
): Promise<HomeInvestmentSingleResponse> => {
  const response = await apiFetch(
    `${API_BASE_URL}/backend/home/home-investment/${id}`,
    {
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Home Investment");
  }

  return response.json();
};

// Create or Update Home Investment
export const saveHomeInvestment = async (
  data: {
    title: string;
    subtitle: string;
    description: string;
    button_text: string;
    button_text_link: string;
    status: boolean;
    sort_order: number;
  },
  id?: number
): Promise<HomeInvestmentSingleResponse> => {
  const formData = new FormData();

  // Append all fields
  formData.append("title", data.title);
  formData.append("subtitle", data.subtitle);
  formData.append("description", data.description);
  formData.append("button_text", data.button_text);
  formData.append("button_text_link", data.button_text_link);
  formData.append("status", data.status ? "1" : "0");
  formData.append("sort_order", data.sort_order.toString());

  const url = id 
    ? `${API_BASE_URL}/backend/home/home-investment/${id}`
    : `${API_BASE_URL}/backend/home/home-investment`;

  const response = await apiFetch(url, {
    method: id ? "PUT" : "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save Home Investment");
  }

  return response.json();
};

// Delete Home Investment
export const deleteHomeInvestment = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiFetch(
    `${API_BASE_URL}/backend/home/home-investment/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete Home Investment");
  }

  return response.json();
};