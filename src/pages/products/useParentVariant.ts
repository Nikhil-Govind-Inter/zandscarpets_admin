import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { fetchProductVariantById, ApiError } from "@/services/products/productVariantsApi";

// Resolves the `:variantId` route param of the per-variant details page and
// loads its label (+ parent product id) for the page header. Bounces back
// to the product's variant list if the id is invalid or can't be loaded.
export function useParentVariant() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { productId: productIdParam, variantId: variantIdParam } = useParams();
  const productId = Number(productIdParam);
  const variantId = Number(variantIdParam);

  const [variantLabel, setVariantLabel] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Number.isInteger(variantId) || variantId <= 0) {
      navigate(`/products/${productId}/variants`, { replace: true });
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchProductVariantById(variantId)
      .then(({ data }) => {
        if (!cancelled) setVariantLabel(data.label);
      })
      .catch((error) => {
        if (cancelled) return;
        toast({
          title: "Error",
          description: error instanceof ApiError ? error.message : "Failed to load variant",
          variant: "destructive",
        });
        navigate(`/products/${productId}/variants`, { replace: true });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantId]);

  return { productId, variantId, variantLabel, loading };
}
