import { useEffect, useState } from "react";
import { FileUpload } from "@/components/common/FileUpload";
import { useToast } from "@/hooks/use-toast";
import {
  fetchProductDataSheetByProduct,
  uploadProductDataSheet,
  removeProductDataSheet,
  ApiError,
} from "@/services/products/productDataSheetApi";

interface ProductDataSheetUploaderProps {
  productId: number;
}

// Attaches/replaces/removes a product's single PDF data sheet. Unlike the
// Media fields above it, this isn't part of the product form's react-hook-form
// state — each change calls the dedicated data-sheet endpoint immediately,
// independent of the page's main Save button.
export default function ProductDataSheetUploader({ productId }: ProductDataSheetUploaderProps) {
  const { toast } = useToast();
  const [path, setPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetchProductDataSheetByProduct(productId)
      .then((res) => {
        if (active) setPath(res.data.data_sheet_path);
      })
      .catch(() => {
        /* no data sheet yet, or failed to load — treat as empty */
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId]);

  const handleChange = async (file: File | null) => {
    setSaving(true);
    try {
      if (file) {
        const res = await uploadProductDataSheet(productId, file);
        setPath(res.data.data_sheet_path);
        toast({ title: "Success", description: "Data sheet uploaded successfully" });
      } else {
        await removeProductDataSheet(productId);
        setPath(null);
        toast({ title: "Success", description: "Data sheet removed successfully" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to save data sheet",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <FileUpload
      value={path}
      onChange={handleChange}
      accept="application/pdf"
      maxSize={10 * 1024 * 1024}
      placeholder="Drop a PDF here or click to browse"
      className={saving ? "opacity-60 pointer-events-none" : undefined}
    />
  );
}
