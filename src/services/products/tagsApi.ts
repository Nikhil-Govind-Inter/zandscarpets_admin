import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { PRODUCTS_API_URL, createCrudApi } from "./productsApiClient";

// Products > Tags — backed by `/api/backend/products/tags` (JSON bodies).
// A product has at most one tag (products.tag_id), e.g. "New" or "Best Seller".
export { ApiError } from "./productsApiClient";

export interface TagRecord {
  id: number;
  title: string;
  title_ar: string;
  sort_order: number;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TagPayload {
  title: string;
  title_ar: string;
  sort_order: number;
  is_active: boolean;
}

export type TagOption = Pick<TagRecord, "id" | "title" | "title_ar">;

const api = createCrudApi<TagRecord, TagOption>(`${PRODUCTS_API_URL}/tags`);

export const fetchTagList = (page: number, limit: number, search?: string) =>
  api.list(page, limit, search);
export const fetchTagById = (id: number) => api.getById(id);
export const fetchActiveTags = () => api.active();
export const createTag = (payload: TagPayload) => api.create(payload);
export const updateTag = (id: number, payload: TagPayload) => api.update(id, payload);
export const deleteTag = (id: number) => api.remove(id);

export const toggleTagStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("tags", item.id!, isActive);

export const updateTagSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("tags", item.id!, sortOrder);
