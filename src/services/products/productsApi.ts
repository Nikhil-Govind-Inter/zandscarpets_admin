import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { PRODUCTS_API_URL, createCrudApi } from "./productsApiClient";
import type { ProductLabelOption } from "./productLabelsApi";
import type { ProductFaqRecord } from "./productFaqApi";
import type { ProductMediaRecord } from "./productMediaApi";
import type { AttributeOption } from "./attributesApi";

// Attributes the product uses to build variants, with the link's sort order.
export type ProductAttributeOption = AttributeOption & {
  ProductAttributes?: { sort_order: number };
};

// Products > Products — backed by `/api/backend/products/products`. FormData
// bodies: main_media_path / list_media_path (image uploads); the *_ids relation
// arrays are sent as JSON strings.
export { ApiError } from "./productsApiClient";

export interface ProductRecord {
  id: number;
  product_category_id: number;
  title: string;
  title_ar: string;
  slug: string;
  short_description: string;
  short_description_ar: string;
  product_description: string;
  product_description_ar: string;
  main_media_path: string | null;
  media_alt: string | null;
  media_alt_ar: string | null;
  list_media_path: string | null;
  list_media_alt: string | null;
  list_media_alt_ar: string | null;
  price: string | number | null;
  list_in_navbar: boolean;
  sort_order: number;
  is_active: boolean;
  category?: { id: number; title: string; title_ar?: string } | null;
  labels?: ProductLabelOption[];
  attributes?: ProductAttributeOption[];
  relatedProducts?: ProductOption[];
  productFaq?: ProductFaqRecord[];
  productMedia?: ProductMediaRecord[];
  createdAt?: string;
  updatedAt?: string;
}

export type ProductOption = Pick<
  ProductRecord,
  "id" | "title" | "title_ar" | "slug" | "main_media_path" | "price"
>;

export interface ProductFilters {
  product_category_id?: number;
}

const api = createCrudApi<ProductRecord, ProductOption>(`${PRODUCTS_API_URL}/products`);

// Fetcher shape matches usePaginatedList's `Fetcher<T, F>` contract.
export const fetchProductList = (
  page: number,
  limit: number,
  search?: string,
  filters?: ProductFilters,
) =>
  api.list(page, limit, search, {
    product_category_id: filters?.product_category_id,
  });
export const fetchProductById = (id: number) => api.getById(id);
// Related-products picker source; pass the product being edited to exclude it.
export const fetchActiveProducts = (excludeId?: number) =>
  api.active(excludeId ? `?excludeId=${excludeId}` : "");
export const createProduct = (formData: FormData) => api.create(formData);
export const updateProduct = (id: number, formData: FormData) => api.update(id, formData);
export const deleteProduct = (id: number) => api.remove(id);

export const toggleProductStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("products", item.id!, isActive);

export const updateProductSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("products", item.id!, sortOrder);