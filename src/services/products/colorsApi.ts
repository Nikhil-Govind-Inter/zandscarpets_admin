import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { PRODUCTS_API_URL, createCrudApi } from "./productsApiClient";

// Products > Colors — backed by `/api/backend/products/colors`. FormData bodies
// (media_path is a swatch image upload).
export { ApiError } from "./productsApiClient";

export interface ColorRecord {
  id: number;
  title: string;
  title_ar: string;
  slug: string | null;
  media_path: string | null;
  media_alt: string | null;
  media_alt_ar: string | null;
  sort_order: number;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ColorOption = Pick<ColorRecord, "id" | "title" | "title_ar" | "media_path">;

const api = createCrudApi<ColorRecord, ColorOption>(`${PRODUCTS_API_URL}/colors`);

export const fetchColorList = (page: number, limit: number, search?: string) =>
  api.list(page, limit, search);
export const fetchColorById = (id: number) => api.getById(id);
export const fetchActiveColors = () => api.active();
export const createColor = (formData: FormData) => api.create(formData);
export const updateColor = (id: number, formData: FormData) => api.update(id, formData);
export const deleteColor = (id: number) => api.remove(id);

export const toggleColorStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("colors", item.id!, isActive);

export const updateColorSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("colors", item.id!, sortOrder);
