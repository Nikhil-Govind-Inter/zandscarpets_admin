const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/backend";

export interface CommonFAQ {
  id?: number;
  page: string;
  question: string;
  answers: string;
  sort_order?: number;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommonFAQResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: {
    data: CommonFAQ[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied: boolean;
    };
  };
}

export interface CommonFAQItemResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: CommonFAQ;
}

export interface CreateCommonFAQData {
  page: string;
  question: string;
  answers: string;
  sort_order?: number;
  status?: boolean;
}

export const PAGE_OPTIONS = [
  { value: "home", label: "Home" },
  { value: "refer-a-friend", label: "Refer a Friend" },
  { value: "app-feature-professional", label: "App Feature - Professional" },
  { value: "app-feature-providers", label: "App Feature - Providers" },
  { value: "power-of-ai", label: "Power of AI" },
  { value: "about-us", label: "About Us" },
  { value: "contact-us", label: "Contact Us" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "blog", label: "Blog" },
];

// Fetch all Common FAQs with pagination and search
export const fetchCommonFAQList = async (
  page: number = 1,
  limit: number = 15,
  search?: string,
  filterPage?: string
): Promise<CommonFAQResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (search) {
    params.append('search', search);
  }
  
  if (filterPage) {
    params.append('page', filterPage);
  }

  const response = await fetch(`${API_BASE_URL}/common-faq?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch Common FAQ data");
  }

  return response.json();
};

// Fetch single Common FAQ item
export const fetchCommonFAQById = async (id: number): Promise<CommonFAQItemResponse> => {
  const response = await fetch(`${API_BASE_URL}/common-faq/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch Common FAQ item");
  }

  return response.json();
};

// Create Common FAQ item
export const createCommonFAQ = async (data: CreateCommonFAQData): Promise<CommonFAQItemResponse> => {
  const response = await fetch(`${API_BASE_URL}/common-faq`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create Common FAQ item");
  }

  return response.json();
};

// Update Common FAQ item
export const updateCommonFAQ = async (
  id: number,
  data: CreateCommonFAQData
): Promise<CommonFAQItemResponse> => {
  const response = await fetch(`${API_BASE_URL}/common-faq/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update Common FAQ item");
  }

  return response.json();
};

// Delete Common FAQ item
export const deleteCommonFAQ = async (id: number): Promise<{ success: boolean; message: string; data: { id: number } }> => {
  const response = await fetch(`${API_BASE_URL}/common-faq/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete Common FAQ item");
  }

  return response.json();
};