import { apiFetch } from "@/lib/apiClient";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface InvestInGoecExploreItem {
  id?: number;
  name: string;
  title: string;
  description: string;
  media_path: string | File;
  media_alt: string;
  points: string;
  status: boolean;
  sort_order: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvestInGoecExploreResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: {
    list: InvestInGoecExploreItem[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied: boolean;
    };
  };
}

export interface InvestInGoecExploreSingleResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: InvestInGoecExploreItem;
}

// Fetch Invest in GO EC Explore items with pagination and search
export const fetchInvestInGoecExplore = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<InvestInGoecExploreResponse> => {
  let url = `${API_BASE_URL}/backend/investingoec/invest-in-zandcarpets-explore?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  const response = await apiFetch(url, {
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Invest in GO EC Explore items");
  }

  return response.json();
};

// Fetch single Invest in GO EC Explore item by ID
export const fetchInvestInGoecExploreById = async (
  id: number
): Promise<InvestInGoecExploreSingleResponse> => {
  const response = await apiFetch(
    `${API_BASE_URL}/backend/investingoec/invest-in-zandcarpets-explore/${id}`,
    {
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Invest in GO EC Explore item");
  }

  return response.json();
};

// Create or Update Invest in GO EC Explore item
export const saveInvestInGoecExploreItem = async (
  data: {
    name: string;
    title: string;
    description: string;
    media_file?: File;
    media_alt: string;
    points: string;
    status: boolean;
    sort_order: number;
  },
  id?: number
): Promise<InvestInGoecExploreSingleResponse> => {
  const formData = new FormData();

  // Append all fields
  formData.append("name", data.name);
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("media_alt", data.media_alt);
  formData.append("points", data.points);
  formData.append("status", data.status ? "1" : "0");
  formData.append("sort_order", data.sort_order.toString());

  // Append file if provided
  if (data.media_file) {
    formData.append("media_path", data.media_file);
  }

  const url = id 
    ? `${API_BASE_URL}/backend/investingoec/invest-in-zandcarpets-explore/${id}`
    : `${API_BASE_URL}/backend/investingoec/invest-in-zandcarpets-explore`;

  const response = await apiFetch(url, {
    method: id ? "PUT" : "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save Invest in GO EC Explore item");
  }

  return response.json();
};

// Delete Invest in GO EC Explore item
export const deleteInvestInGoecExploreItem = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiFetch(
    `${API_BASE_URL}/backend/investingoec/invest-in-zandcarpets-explore/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete Invest in GO EC Explore item");
  }

  return response.json();
};