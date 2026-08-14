import { apiFetch } from "@/lib/apiClient";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface HomeMilestone {
  id?: number;
  title: string;
  value: number;
  status: boolean;
  sort_order: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeMilestoneResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: {
    list: HomeMilestone[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied: boolean;
    };
  };
}

export interface HomeMilestoneSingleResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: HomeMilestone;
}

// Fetch Home Milestones with pagination and search
export const fetchHomeMilestones = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<HomeMilestoneResponse> => {
  let url = `${API_BASE_URL}/backend/home/home-milestone?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  const response = await apiFetch(url, {
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Home Milestones");
  }

  return response.json();
};

// Fetch single Home Milestone by ID
export const fetchHomeMilestoneById = async (
  id: number
): Promise<HomeMilestoneSingleResponse> => {
  const response = await apiFetch(
    `${API_BASE_URL}/backend/home/home-milestone/${id}`,
    {
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Home Milestone");
  }

  return response.json();
};

// Create or Update Home Milestone
export const saveHomeMilestone = async (
  data: {
    title: string;
    value: number;
    status: boolean;
    sort_order: number;
  },
  id?: number
): Promise<HomeMilestoneSingleResponse> => {
  const formData = new FormData();

  // Append all fields
  formData.append("title", data.title);
  formData.append("value", data.value.toString());
  formData.append("status", data.status ? "1" : "0");
  formData.append("sort_order", data.sort_order.toString());

  const url = id 
    ? `${API_BASE_URL}/backend/home/home-milestone/${id}`
    : `${API_BASE_URL}/backend/home/home-milestone`;

  const response = await apiFetch(url, {
    method: id ? "PUT" : "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save Home Milestone");
  }

  return response.json();
};

// Delete Home Milestone
export const deleteHomeMilestone = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiFetch(
    `${API_BASE_URL}/backend/home/home-milestone/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete Home Milestone");
  }

  return response.json();
};