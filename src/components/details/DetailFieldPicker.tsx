import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fetchActiveDetailFields, DetailFieldOption, ApiError } from "@/services/details/detailFieldsApi";

interface DetailFieldPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (field: DetailFieldOption) => void;
  excludeFieldIds?: number[];
  // Shown in the dialog description so the admin knows what adding here
  // actually does (product screen = all variants, variant screen = this
  // variant only).
  scopeDescription: string;
}

// Dropdown of active detail fields, excluding ones already mapped in the
// current scope. The caller (ProductDetailsEditor / VariantDetailsEditor)
// decides what "adding" means — product-level vs. variant-only — since
// that's implied by which screen launched the dialog.
export default function DetailFieldPicker({
  open,
  onOpenChange,
  onPick,
  excludeFieldIds = [],
  scopeDescription,
}: DetailFieldPickerProps) {
  const { toast } = useToast();
  const [fields, setFields] = useState<DetailFieldOption[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedId("");
    loadFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadFields = async () => {
    try {
      setLoading(true);
      const { data } = await fetchActiveDetailFields();
      setFields(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to load detail fields",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const availableFields = fields.filter((f) => !excludeFieldIds.includes(f.id));

  const handleAdd = () => {
    const field = availableFields.find((f) => f.id === Number(selectedId));
    if (field) onPick(field);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Detail Field</DialogTitle>
          <DialogDescription>{scopeDescription}</DialogDescription>
        </DialogHeader>

        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger>
            <SelectValue placeholder={loading ? "Loading..." : "Select a field"} />
          </SelectTrigger>
          <SelectContent>
            {availableFields.length === 0 && !loading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No more fields available to add.
              </div>
            ) : (
              availableFields.map((field) => (
                <SelectItem key={field.id} value={String(field.id)}>
                  {field.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedId}>
            Add Field
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
