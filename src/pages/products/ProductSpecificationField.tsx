import { useFieldArray, UseFormReturn } from "react-hook-form";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { ProductFormData } from "@/schemas/productSchema";

interface ProductSpecificationFieldProps {
  form: UseFormReturn<ProductFormData>;
}

// Specification rows are edited as EN/AR pairs so `specification` and
// `specification_ar` (sent as two string arrays) always stay the same length,
// which the backend requires.
export default function ProductSpecificationField({ form }: ProductSpecificationFieldProps) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "specification",
  });

  return (
    <div className="space-y-3">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">No specification points yet.</p>
      )}

      {fields.map((row, index) => (
        <div key={row.id} className="flex items-start gap-2">
          <span className="w-6 pt-2 text-sm text-muted-foreground font-mono">{index + 1}.</span>
          <div className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-2">
            <FormField
              control={form.control}
              name={`specification.${index}.en`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="e.g., Pile height: 12 mm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`specification.${index}.ar`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input dir="rtl" placeholder="مثال: ارتفاع الوبر: ١٢ مم" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={index === 0}
              onClick={() => move(index, index - 1)}
              aria-label="Move up"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={index === fields.length - 1}
              onClick={() => move(index, index + 1)}
              aria-label="Move down"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={() => append({ en: "", ar: "" })}>
        <Plus className="h-4 w-4 mr-2" />
        Add Specification
      </Button>
    </div>
  );
}
