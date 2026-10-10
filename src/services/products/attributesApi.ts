import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { PRODUCTS_API_URL, createCrudApi } from "./productsApiClient";

// Products > Attributes — backed by `/api/backend/products/attributes` (JSON
// bodies). Attributes define the options a product carries: text, an icon
// image, a color code, or both icon + color (see `type`).
export { ApiError } from "./productsApiClient";

export type AttributeType = "text" | "icon" | "color";

export interface AttributeValueLite {
  id: number;
  value: string | null;
  value_ar: string | null;
  slug: string | null;
  media_path: string | null;
  color_code: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface AttributeRecord {
  id: number;
  title: string;
  title_ar: string;
  slug: string | null;
  type: AttributeType;
  sort_order: number;
  is_active: boolean;
  attributeValues?: AttributeValueLite[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AttributePayload {
  title: string;
  title_ar: string;
  slug: string;
  type: AttributeType;
  sort_order: number;
  is_active: boolean;
}

export type AttributeOption = Pick<
  AttributeRecord,
  "id" | "title" | "title_ar" | "type" | "slug"
>;

const api = createCrudApi<AttributeRecord, AttributeOption>(
  `${PRODUCTS_API_URL}/attributes`,
);

export const fetchAttributeList = (page: number, limit: number, search?: string) =>
  api.list(page, limit, search);
export const fetchAttributeById = (id: number) => api.getById(id);
export const fetchActiveAttributes = () => api.active();
export const createAttribute = (payload: AttributePayload) => api.create(payload);
export const updateAttribute = (id: number, payload: AttributePayload) =>
  api.update(id, payload);
export const deleteAttribute = (id: number) => api.remove(id);

export const toggleAttributeStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("attributes", item.id!, isActive);

export const updateAttributeSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("attributes", item.id!, sortOrder);