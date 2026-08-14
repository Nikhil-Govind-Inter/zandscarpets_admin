import { apiFetch } from "@/lib/apiClient";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface InvestInGoecMilestoneItem {
  id?: number;
  value: number;
  prefix: string;
  subtitle: string;
  status: boolean;
  sort_order: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvestInGoecMilestoneResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: {
    list: InvestInGoecMilestoneItem[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied: boolean;
    };
  };
}

export interface InvestInGoecMilestoneSingleResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: InvestInGoecMilestoneItem;
}

// Fetch Invest in GO EC Milestone items with pagination and search
export const fetchInvestInGoecMilestone = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<InvestInGoecMilestoneResponse> => {
  let url = `${API_BASE_URL}/backend/investingoec/invest-in-zandcarpets-milestone?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  const response = await apiFetch(url, {
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Invest in GO EC Milestone items");
  }

  return response.json();
};

// Fetch single Invest in GO EC Milestone item by ID
export const fetchInvestInGoecMilestoneById = async (
  id: number
): Promise<InvestInGoecMilestoneSingleResponse> => {
  const response = await apiFetch(
    `${API_BASE_URL}/backend/investingoec/invest-in-zandcarpets-milestone/${id}`,
    {
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Invest in GO EC Milestone item");
  }

  return response.json();
};

// Create or Update Invest in GO EC Milestone item
export const saveInvestInGoecMilestoneItem = async (
  data: {
    value: number;
    prefix: string;
    subtitle: string;
    status: boolean;
    sort_order: number;
  },
  id?: number
): Promise<InvestInGoecMilestoneSingleResponse> => {
  const formData = new FormData();

  // Append all fields
  formData.append("value", data.value.toString());
  formData.append("prefix", data.prefix);
  formData.append("subtitle", data.subtitle);
  formData.append("status", data.status ? "true" : "false");
  formData.append("sort_order", data.sort_order.toString());

  const url = id 
    ? `${API_BASE_URL}/backend/investingoec/invest-in-zandcarpets-milestone/${id}`
    : `${API_BASE_URL}/backend/investingoec/invest-in-zandcarpets-milestone`;

  const response = await apiFetch(url, {
    method: id ? "PUT" : "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save Invest in GO EC Milestone item");
  }

  return response.json();
};

// Delete Invest in GO EC Milestone item
export const deleteInvestInGoecMilestoneItem = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiFetch(
    `${API_BASE_URL}/backend/investingoec/invest-in-zandcarpets-milestone/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete Invest in GO EC Milestone item");
  }

  return response.json();
};