import { Badge } from "@/components/ui/badge";
import type { AttributeValueOption } from "@/services/products/attributeValuesApi";
import { AttributeSelection, buildComboPreviews } from "@/utils/variantCombinations";

interface VariantGeneratePreviewProps {
  selections: AttributeSelection[];
  attributeValuesById: Record<number, AttributeValueOption>;
  isComplete: boolean;
  // When provided, splits the preview into "will create" vs "already exists"
  // instead of one flat list.
  existingKeys?: Set<string>;
}

// Shows, before Generate/Save is even clicked, exactly which variant
// combinations the current selection would produce — computed the same way
// the backend's generate endpoint computes them, so the labels/counts here
// match what actually lands on the Variants page afterward.
export default function VariantGeneratePreview({
  selections,
  attributeValuesById,
  isComplete,
  existingKeys,
}: VariantGeneratePreviewProps) {
  if (!isComplete) {
    return (
      <p className="text-xs text-muted-foreground">
        Choose at least one value for every selected attribute to preview the variants that will
        be created.
      </p>
    );
  }

  const previews = buildComboPreviews(selections, attributeValuesById, existingKeys);

  if (!existingKeys) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">
          {previews.length} variant{previews.length === 1 ? "" : "s"} will be created when you
          save
        </p>
        <div className="flex flex-wrap gap-1.5">
          {previews.map((p) => (
            <Badge key={p.key} variant="secondary">
              {p.label || "(unnamed)"}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  const newCombos = previews.filter((p) => !p.exists);
  const existingCombos = previews.filter((p) => p.exists);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <p className="text-sm font-medium">
          {newCombos.length} new variant{newCombos.length === 1 ? "" : "s"} will be created
        </p>
        {newCombos.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {newCombos.map((p) => (
              <Badge key={p.key} variant="secondary">
                {p.label || "(unnamed)"}
              </Badge>
            ))}
          </div>
        )}
      </div>
      {existingCombos.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {existingCombos.length} combination{existingCombos.length === 1 ? "" : "s"} already
            exist and will be skipped
          </p>
          <div className="flex flex-wrap gap-1.5">
            {existingCombos.map((p) => (
              <Badge key={p.key} variant="outline" className="text-muted-foreground">
                {p.label || "(unnamed)"}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
