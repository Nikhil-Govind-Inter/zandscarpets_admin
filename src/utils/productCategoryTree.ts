import type { ComboboxOption } from "@/components/ui/combobox";
import type { ProductCategoryOption } from "@/services/products/productCategoryApi";

// Turns the flat active-category list into select options ordered as a tree,
// each labelled with its full path ("Carpets › Wool › Hand-knotted"), so
// sub-categories can be nested under other sub-categories to any depth.
export const buildCategoryPathOptions = (
  rows: ProductCategoryOption[],
): ComboboxOption[] => {
  const byParent = new Map<number | null, ProductCategoryOption[]>();
  const ids = new Set(rows.map((r) => r.id));
  rows.forEach((row) => {
    // A row whose parent isn't in the list (inactive/excluded) is shown as a root.
    const key = row.parent_id && ids.has(row.parent_id) ? row.parent_id : null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(row);
  });

  const options: ComboboxOption[] = [];
  const walk = (parent: number | null, path: string[]) => {
    (byParent.get(parent) || []).forEach((row) => {
      const nextPath = [...path, row.title];
      options.push({ value: row.id.toString(), label: nextPath.join(" › ") });
      walk(row.id, nextPath);
    });
  };
  walk(null, []);
  return options;
};
