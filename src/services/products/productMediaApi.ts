import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { PRODUCTS_API_URL, createCrudApi } from "./productsApiClient";

// Products > Gallery media — backed by `/api/backend/products/products-media`.
// FormData bodies (media_path upload). Managed from the per-product media pages,
// always scoped by product_id.
export { ApiError } from "./productsApiClient";

export type ProductMediaType = "image" | "video";

export interface ProductMediaRecord {
  id: number;
  product_id: number;
  media_type: ProductMediaType;
  media_path: string | null;
  thumbnail: string | null;
  media_alt: string | null;
  media_alt_ar: string | null;
  sort_order: number;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const api = createCrudApi<ProductMediaRecord>(`${PRODUCTS_API_URL}/products-media`);

export const fetchProductMediaList = (
  page: number,
  limit: number,
  search?: string,
  filters?: { product_id: number },
) => api.list(page, limit, search, { product_id: filters?.product_id });
export const fetchProductMediaById = (id: number) => api.getById(id);
export const createProductMedia = (formData: FormData) => api.create(formData);
export const updateProductMedia = (id: number, formData: FormData) =>
  api.update(id, formData);
export const deleteProductMedia = (id: number) => api.remove(id);

export const toggleProductMediaStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("product-media", item.id!, isActive);

export const updateProductMediaSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("product-media", item.id!, sortOrder);
