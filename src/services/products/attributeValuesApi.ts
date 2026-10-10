import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { PRODUCTS_API_URL, createCrudApi } from "./productsApiClient";

// Products > Attribute Values — backed by
// `/api/backend/products/attribute-values`. FormData bodies (media_path is an
// optional icon upload). Values belong to one attribute; which fields are used
// depends on the parent attribute's `type`.
export { ApiError } from "./productsApiClient";
import type { AttributeOption } from "./attributesApi";

export interface AttributeValueRecord {
  id: number;
  attribute_id: number;
  value: string | null;
  value_ar: string | null;
  slug: string | null;
  media_path: string | null;
  media_alt: string | null;
  media_alt_ar: string | null;
  color_code: string | null;
  is_active: boolean;
  sort_order: number;
  attribute?: Pick<AttributeOption, "id" | "title" | "title_ar" | "type" | "slug">;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttributeValuePayload {
  attribute_id: number;
  value?: string;
  value_ar?: string;
  slug?: string;
  media_path?: string;
  media_alt?: string;
  media_alt_ar?: string;
  color_code?: string;
  sort_order: number;
  is_active: boolean;
}

export type AttributeValueOption = Pick<
  AttributeValueRecord,
  "id" | "attribute_id" | "value" | "value_ar" | "slug" | "media_path" | "color_code"
>;

export interface AttributeValueFilters {
  attribute_id?: number;
}

const api = createCrudApi<AttributeValueRecord, AttributeValueOption>(
  `${PRODUCTS_API_URL}/attribute-values`,
);

export const fetchAttributeValueList = (
  page: number,
  limit: number,
  search?: string,
  filters?: AttributeValueFilters,
) => api.list(page, limit, search, filters as Record<string, unknown> | undefined);
export const fetchAttributeValueById = (id: number) => api.getById(id);
export const fetchActiveAttributeValues = () => api.active();
export const createAttributeValue = (formData: FormData) => api.create(formData);
export const updateAttributeValue = (id: number, formData: FormData) =>
  api.update(id, formData);
export const deleteAttributeValue = (id: number) => api.remove(id);

export const toggleAttributeValueStatus = (
  item: { id?: number | string },
  isActive: boolean,
) => updateCmsStatus("attribute-values", item.id!, isActive);

export const updateAttributeValueSortOrder = (
  item: { id?: number | string },
  sortOrder: number,
) => updateCmsSortOrder("attribute-values", item.id!, sortOrder);