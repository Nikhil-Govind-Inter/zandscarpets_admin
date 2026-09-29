import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { PRODUCTS_API_URL, createCrudApi } from "./productsApiClient";
import type { ColorOption } from "./colorsApi";
import type { SizeOption } from "./sizesApi";
import type { TagOption } from "./tagsApi";
import type { ProductTagOption } from "./productTagsApi";
import type { ProductFaqRecord } from "./productFaqApi";
import type { ProductMediaRecord } from "./productMediaApi";

// Products > Products — backed by `/api/backend/products/products`. FormData
// bodies: media_path (image) and data_sheet (PDF) uploads; specification arrays
// and the *_ids relation arrays are sent as JSON strings.
export { ApiError } from "./productsApiClient";

export interface ProductRecord {
  id: number;
  product_category_id: number;
  tag_id: number | null;
  title: string;
  title_ar: string;
  slug: string;
  short_description: string;
  short_description_ar: string;
  product_description: string;
  product_description_ar: string;
  specification: string[];
  specification_ar: string[];
  data_sheet: string | null;
  test_reports_description: string | null;
  test_reports_description_ar: string | null;
  installation_instruction: string | null;
  installation_instruction_ar: string | null;
  maintenance: string | null;
  maintenance_ar: string | null;
  packing_and_shipping: string | null;
  packing_and_shipping_ar: string | null;
  media_path: string | null;
  media_alt: string | null;
  media_alt_ar: string | null;
  price: string | number;
  related_accessories: string | null;
  sort_order: number;
  is_active: boolean;
  category?: { id: number; title: string; title_ar?: string } | null;
  tag?: TagOption | null;
  colors?: ColorOption[];
  sizes?: Pick<SizeOption, "id" | "title" | "title_ar">[];
  hash_tags?: Pick<ProductTagOption, "id" | "title" | "title_ar">[];
  relatedProducts?: ProductOption[];
  productFaq?: ProductFaqRecord[];
  productMedia?: ProductMediaRecord[];
  createdAt?: string;
  updatedAt?: string;
}

export type ProductOption = Pick<
  ProductRecord,
  "id" | "title" | "title_ar" | "slug" | "media_path" | "price"
>;

export interface ProductFilters {
  product_category_id?: number;
  tag_id?: number;
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
    tag_id: filters?.tag_id,
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
