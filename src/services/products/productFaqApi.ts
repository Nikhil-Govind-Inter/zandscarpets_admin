import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { PRODUCTS_API_URL, createCrudApi } from "./productsApiClient";

// Products > FAQs — backed by `/api/backend/products/product-faq` (JSON bodies).
// Managed from the per-product FAQ pages, always scoped by product_id.
export { ApiError } from "./productsApiClient";

export interface ProductFaqRecord {
  id: number;
  product_id: number;
  question: string;
  question_ar: string;
  answer: string;
  answer_ar: string;
  sort_order: number;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFaqPayload {
  product_id: number;
  question: string;
  question_ar: string;
  answer: string;
  answer_ar: string;
  sort_order: number;
  is_active: boolean;
}

const api = createCrudApi<ProductFaqRecord>(`${PRODUCTS_API_URL}/product-faq`);

export const fetchProductFaqList = (
  page: number,
  limit: number,
  search?: string,
  filters?: { product_id: number },
) => api.list(page, limit, search, { product_id: filters?.product_id });
export const fetchProductFaqById = (id: number) => api.getById(id);
export const createProductFaq = (payload: ProductFaqPayload) => api.create(payload);
export const updateProductFaq = (id: number, payload: ProductFaqPayload) =>
  api.update(id, payload);
export const deleteProductFaq = (id: number) => api.remove(id);

export const toggleProductFaqStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("product-faq", item.id!, isActive);

export const updateProductFaqSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("product-faq", item.id!, sortOrder);
