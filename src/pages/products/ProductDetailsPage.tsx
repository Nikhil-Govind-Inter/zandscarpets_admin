import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageLoader from "@/components/layout/PageLoader";
import ProductDetailsEditor from "@/components/details/ProductDetailsEditor";
import { useParentProduct } from "./useParentProduct";

// Dynamic content blocks (description, installation guide, gallery, demo
// videos, ...) for one product — set here for all variants by default;
// variants override/hide from their own Details screen.
export default function ProductDetailsPage() {
  const navigate = useNavigate();
  const { productId, productTitle, loading } = useParentProduct();

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Details — {productTitle}</h1>
          <p className="text-muted-foreground">
            Dynamic content blocks shown on all variants, unless a variant overrides or hides them
          </p>
        </div>
      </div>

      <ProductDetailsEditor productId={productId} />
    </div>
  );
}
