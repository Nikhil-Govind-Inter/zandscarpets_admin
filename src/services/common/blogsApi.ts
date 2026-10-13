import { apiFetch } from "@/lib/apiClient";

export interface ActiveBlogOption {
  id: string;
  title: string;
  title_ar?: string | null;
}

export interface ActiveBlogsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: ActiveBlogOption[];
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

// Latest blog posts, sourced from the storefront's i18n dictionary via the
// backend `/api/backend/blogs/active` endpoint. Used for the SEO-meta blog
// picker so admins pick a post instead of typing its slug.
export const fetchActiveBlogs = async (): Promise<ActiveBlogsResponse> => {
  const response = await apiFetch(`${API_BASE_URL}/blogs/active`);

  if (!response.ok) {
    throw new Error("Failed to fetch blog posts");
  }

  return response.json();
};