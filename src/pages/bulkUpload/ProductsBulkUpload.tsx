import { BulkUploadWizard } from "@/components/bulkUpload/BulkUploadWizard";

export default function ProductsBulkUpload() {
  return (
    <BulkUploadWizard
      entity="products"
      title="Bulk Upload: Products"
      description="Create or update products in bulk, with category, attributes, and images."
      notes={[
        "Slugs are generated automatically from the title — there is no slug column to fill in.",
        "There are no Arabic (_ar) columns — title_ar/short_description_ar/product_description_ar are all set to match the English text automatically. Fill in the Arabic text afterward via the edit screen if you need it to differ.",
        "A row with a title matching an existing product in the same category updates it; otherwise a new product is created.",
        "Changing a row's title (or category_slug) creates a new product rather than renaming/recategorizing the old one. To rename or move an existing product, use its edit screen instead.",
        "attribute_titles only applies when creating a new product — updating an existing product never changes its attributes (same as the manual edit screen, which leaves them alone unless you explicitly change them there). Use the product's edit screen to add/remove attributes afterward.",
        "Upload product images via the Media step first, then paste the returned stored path into main_image / list_image.",
        "main_image is required. list_image falls back to main_image if left blank.",
        "There is no label/tag/badge column — attach those afterward via the normal Labels screen.",
      ]}
    />
  );
}
