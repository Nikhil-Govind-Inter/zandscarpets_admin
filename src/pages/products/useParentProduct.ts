import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { fetchProductById, ApiError } from "@/services/products/productsApi";

// Resolves the `:productId` route param of the per-product FAQ/media pages and
// loads the product's title for the page header. Bounces back to the product
// list if the id is invalid or the product can't be loaded.
export function useParentProduct() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { productId: productIdParam } = useParams();
  const productId = Number(productIdParam);

  const [productTitle, setProductTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Number.isInteger(productId) || productId <= 0) {
      navigate("/products", { replace: true });
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchProductById(productId)
      .then(({ data }) => {
        if (!cancelled) setProductTitle(data.title);
      })
      .catch((error) => {
        if (cancelled) return;
        toast({
          title: "Error",
          description: error instanceof ApiError ? error.message : "Failed to load product",
          variant: "destructive",
        });
        navigate("/products", { replace: true });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return { productId, productTitle, loading };
}
