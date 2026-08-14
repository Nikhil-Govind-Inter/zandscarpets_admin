import { apiFetch } from "@/lib/apiClient";

// Shared partial-update helper for list pages. None of this backend's
// resources expose dedicated toggle-status/reorder routes — status and
// sort-order changes go through the same PUT /:id update endpoint as any
// other field edit, sent as a minimal FormData body. Centralized here so
// every feature's status switch and drag-reorder goes through one
// implementation instead of each page reinventing it.
export const updateResourceFields = async (
  baseUrl: string,
  id: number | string,
  fields: Record<string, string | number | boolean>
): Promise<Response> => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value.toString());
  });

  const response = await apiFetch(`${baseUrl}/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to update");
  }

  return response;
};

// Convenience wrapper for the common "flip a boolean status field" case.
export const updateResourceStatus = (
  baseUrl: string,
  id: number | string,
  value: boolean,
  field: string = "is_active"
): Promise<Response> => updateResourceFields(baseUrl, id, { [field]: value });

// Convenience wrapper for the common "persist a new sort_order" case.
export const updateResourceSortOrder = (
  baseUrl: string,
  id: number | string,
  sortOrder: number,
  field: string = "sort_order"
): Promise<Response> => updateResourceFields(baseUrl, id, { [field]: sortOrder });
