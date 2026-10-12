// Mirrors the backend's generate logic byte-for-byte
// (zandscarpets_server/modules/admin/http/controllers/products/variantsController.js,
// `generate`) so the frontend preview never disagrees with what the server actually creates.

export const buildCombinationKey = (valueIds: (number | string)[]): string =>
  [...valueIds]
    .map(Number)
    .sort((a, b) => a - b)
    .join("-");

export const buildLabel = (
  values: { value?: string | null; value_ar?: string | null }[],
  field: "value" | "value_ar",
): string =>
  values
    .map((v) => v[field])
    .filter((v) => v && String(v).trim())
    .join(" / ");

export interface AttributeSelection {
  attributeId: number;
  valueIds: (number | string)[];
}

// One entry per attribute, in display/pick order. Combos follow the same order
// (last attribute varies fastest), matching the backend's nested-loop cartesian.
export const cartesianCombinations = (selections: AttributeSelection[]): number[][] =>
  selections
    .map((s) => s.valueIds.map(Number))
    .reduce<number[][]>((acc, list) => acc.flatMap((combo) => list.map((v) => [...combo, v])), [[]]);

export interface ComboPreview {
  key: string;
  valueIds: number[];
  label: string;
  exists: boolean;
}

// Classifies each combo against an optional set of existing combination_key
// values, so the UI can split "will be created" from "already exists".
export const buildComboPreviews = (
  selections: AttributeSelection[],
  attributeValuesById: Record<number, { value?: string | null; value_ar?: string | null }>,
  existingKeys?: Set<string>,
): ComboPreview[] =>
  cartesianCombinations(selections).map((combo) => {
    const key = buildCombinationKey(combo);
    return {
      key,
      valueIds: combo,
      label: buildLabel(combo.map((id) => attributeValuesById[id] || {}), "value"),
      exists: existingKeys?.has(key) ?? false,
    };
  });
