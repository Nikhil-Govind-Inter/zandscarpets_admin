import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageLoader from "@/components/layout/PageLoader";
import VariantDetailsEditor from "@/components/details/VariantDetailsEditor";
import { useParentVariant } from "./useParentVariant";

// Per-variant content screen: inherited/custom/hidden state per field, with
// customize/hide/show-again/revert/promote actions and per-item exclusion.
export default function VariantDetailsPage() {
  const navigate = useNavigate();
  const { productId, variantId, variantLabel, loading } = useParentVariant();

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(`/products/${productId}/variants`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Details — {variantLabel}</h1>
          <p className="text-muted-foreground">
            Inherited from the product by default — customize, hide, or exclude individual items here
          </p>
        </div>
      </div>

      <VariantDetailsEditor productId={productId} variantId={variantId} />
    </div>
  );
}
