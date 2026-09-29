import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { PRODUCTS_API_URL, createCrudApi } from "./productsApiClient";

// Products > Sizes — backed by `/api/backend/products/sizes` (JSON bodies).
export { ApiError } from "./productsApiClient";

export interface SizeRecord {
  id: number;
  title: string;
  title_ar: string;
  slug: string | null;
  sort_order: number;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SizePayload {
  title: string;
  title_ar: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

export type SizeOption = Pick<SizeRecord, "id" | "title" | "title_ar" | "slug">;

const api = createCrudApi<SizeRecord, SizeOption>(`${PRODUCTS_API_URL}/sizes`);

export const fetchSizeList = (page: number, limit: number, search?: string) =>
  api.list(page, limit, search);
export const fetchSizeById = (id: number) => api.getById(id);
export const fetchActiveSizes = () => api.active();
export const createSize = (payload: SizePayload) => api.create(payload);
export const updateSize = (id: number, payload: SizePayload) => api.update(id, payload);
export const deleteSize = (id: number) => api.remove(id);

export const toggleSizeStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("sizes", item.id!, isActive);

export const updateSizeSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("sizes", item.id!, sortOrder);
