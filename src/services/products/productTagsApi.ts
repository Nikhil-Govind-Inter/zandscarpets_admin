import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { PRODUCTS_API_URL, createCrudApi } from "./productsApiClient";

// Products > Product Tags — backed by `/api/backend/products/product-tags` (JSON
// bodies). These are the many-to-many hash tags on a product (`hash_tags`).
export { ApiError } from "./productsApiClient";

export interface ProductTagRecord {
  id: number;
  title: string;
  title_ar: string;
  is_global: boolean;
  sort_order: number;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductTagPayload {
  title: string;
  title_ar: string;
  is_global: boolean;
  sort_order: number;
  is_active: boolean;
}

export type ProductTagOption = Pick<ProductTagRecord, "id" | "title" | "title_ar" | "is_global">;

const api = createCrudApi<ProductTagRecord, ProductTagOption>(
  `${PRODUCTS_API_URL}/product-tags`,
);

export const fetchProductTagList = (page: number, limit: number, search?: string) =>
  api.list(page, limit, search);
export const fetchProductTagById = (id: number) => api.getById(id);
export const fetchActiveProductTags = () => api.active();
export const createProductTag = (payload: ProductTagPayload) => api.create(payload);
export const updateProductTag = (id: number, payload: ProductTagPayload) =>
  api.update(id, payload);
export const deleteProductTag = (id: number) => api.remove(id);

export const toggleProductTagStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("product-tags", item.id!, isActive);

export const updateProductTagSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("product-tags", item.id!, sortOrder);
