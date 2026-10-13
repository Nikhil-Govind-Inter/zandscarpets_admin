import { BulkUploadWizard } from "@/components/bulkUpload/BulkUploadWizard";

export default function ProductsBulkUpload() {
  return (
    <BulkUploadWizard
      entity="products"
      title="Bulk Upload: Products"
      description="Create products in bulk, with category, attributes, and images."
      notes={[
        "Upload product images via the Media step first, then paste the returned stored path into main_image / list_image.",
        "main_image is required. list_image falls back to main_image if left blank.",
        "attribute_titles fixes which attributes this product uses — list the Variants sheet will expect values for.",
        "There is no label/tag/badge column — attach those afterward via the normal Labels screen.",
      ]}
    />
  );
}
