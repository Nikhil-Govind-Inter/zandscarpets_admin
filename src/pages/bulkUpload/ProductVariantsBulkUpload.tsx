import { BulkUploadWizard } from "@/components/bulkUpload/BulkUploadWizard";

export default function ProductVariantsBulkUpload() {
  return (
    <BulkUploadWizard
      entity="product-variants"
      title="Bulk Upload: Product Variants"
      description="Generate product variants in bulk from attribute-value combinations."
      notes={[
        "attribute_value_refs uses Attribute=Value pairs separated by ;, e.g. Size=120cm;Color=Oak — order doesn't matter.",
        "Every attribute the product uses must have exactly one value in the ref string.",
        "The product must already exist (create it via the Products step first).",
      ]}
    />
  );
}
