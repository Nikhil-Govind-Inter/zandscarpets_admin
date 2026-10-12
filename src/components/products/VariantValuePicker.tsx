import { Label } from "@/components/ui/label";
import { MultiSelect, Option as MultiSelectOption } from "@/components/ui/multi-select";
import type { AttributeValueOption } from "@/services/products/attributeValuesApi";

interface VariantValuePickerProps {
  attributes: { id: number; title: string }[];
  valuesByAttribute: Record<number, MultiSelectOption[]>;
  selections: Record<number, (number | string)[]>;
  onChange: (attributeId: number, selected: (number | string)[]) => void;
  disabled?: boolean;
}

// Shared by the product form's inline generate action and the standalone
// Variants list dialog: one MultiSelect per product attribute.
export default function VariantValuePicker({
  attributes,
  valuesByAttribute,
  selections,
  onChange,
  disabled,
}: VariantValuePickerProps) {
  return (
    <>
      {attributes.map((attr) => {
        const options = valuesByAttribute[attr.id] || [];
        return (
          <div key={attr.id} className="space-y-2">
            <Label>{attr.title}</Label>
            {options.length ? (
              <MultiSelect
                options={options}
                selected={selections[attr.id] || []}
                onChange={(selected) => onChange(attr.id, selected)}
                placeholder={`Select ${attr.title.toLowerCase()} values`}
                disabled={disabled}
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                No active values found for {attr.title}. Add values under Attribute Values first.
              </p>
            )}
          </div>
        );
      })}
    </>
  );
}

export const groupValuesByAttribute = (
  values: AttributeValueOption[],
  attributes: { id: number }[],
): Record<number, MultiSelectOption[]> => {
  const grouped: Record<number, MultiSelectOption[]> = {};
  attributes.forEach((attr) => {
    grouped[attr.id] = values
      .filter((v) => v.attribute_id === attr.id)
      .map((v) => ({
        id: v.id,
        name: v.value || v.value_ar || v.slug || `Value ${v.id}`,
      }));
  });
  return grouped;
};
