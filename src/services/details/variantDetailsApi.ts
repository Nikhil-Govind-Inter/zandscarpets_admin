import { apiFetch, parseEnvelope, ApiError, DETAILS_API_URL } from "./detailsApiClient";
import { DetailItemRecord, DetailMappingRecord } from "./mappingsApi";

// Dynamic Details > variant actions (customize/hide/revert/promote/
// exclude) — backed by `/api/backend/details/variants`.
export { ApiError };

export type ResolvedFieldSource = "own" | "inherited" | "custom" | "hidden" | "none";

export interface ResolvedFieldEntry {
  field: {
    id: number;
    name: string;
    slug: string;
    type: "rich_text" | "image" | "video";
    allows_multiple: boolean;
  };
  mapping: DetailMappingRecord | null;
  source: ResolvedFieldSource;
  state: ResolvedFieldSource;
  // What's actually shown (exclusions already applied).
  items: DetailItemRecord[];
  // Inherited fields only: every product item plus which ones this variant
  // currently excludes, so the admin can show them greyed out with a
  // restore action instead of just disappearing them.
  allItems?: DetailItemRecord[];
  excludedItemIds?: number[];
}

const VARIANTS_URL = `${DETAILS_API_URL}/variants`;

const call = async <T>(url: string, method: string) =>
  parseEnvelope<T>(await apiFetch(url, { method }));

export const fetchResolvedVariantDetails = (variantId: number) =>
  call<ResolvedFieldEntry[]>(`${VARIANTS_URL}/${variantId}`, "GET");

export const customizeField = (variantId: number, fieldId: number) =>
  call<DetailMappingRecord>(`${VARIANTS_URL}/${variantId}/fields/${fieldId}/customize`, "POST");

export const hideFieldForVariant = (variantId: number, fieldId: number) =>
  call<DetailMappingRecord>(`${VARIANTS_URL}/${variantId}/fields/${fieldId}/hide`, "POST");

export const showFieldAgain = (variantId: number, fieldId: number) =>
  call<{ variant_id: number; field_id: number }>(
    `${VARIANTS_URL}/${variantId}/fields/${fieldId}/show-again`,
    "POST",
  );

export const revertFieldToProductDefault = (variantId: number, fieldId: number) =>
  call<{ variant_id: number; field_id: number }>(
    `${VARIANTS_URL}/${variantId}/fields/${fieldId}/revert`,
    "POST",
  );

export const excludeItemForVariant = (variantId: number, itemId: number) =>
  call<{ variant_id: number; item_id: number }>(
    `${VARIANTS_URL}/${variantId}/items/${itemId}/exclude`,
    "POST",
  );

export const includeItemForVariant = (variantId: number, itemId: number) =>
  call<{ variant_id: number; item_id: number }>(
    `${VARIANTS_URL}/${variantId}/items/${itemId}/exclude`,
    "DELETE",
  );
