import { BulkUploadWizard } from "@/components/bulkUpload/BulkUploadWizard";

export default function CategoriesBulkUpload() {
  return (
    <BulkUploadWizard
      entity="categories"
      title="Bulk Upload: Categories"
      description="Create product categories in bulk, including sub-categories at any depth."
      notes={[
        "Slugs are generated automatically from the title — there is no slug column to fill in.",
        "There are no Arabic (_ar) columns — title_ar/description_ar/material_type_ar are all set to match the English text automatically. Fill in the Arabic text afterward via the edit screen if you need it to differ.",
        "A row updates an existing category instead of creating a new one when its title and parent both match exactly — otherwise it's created as new.",
        "Changing a row's title creates a new category rather than renaming the old one. To rename an existing category, use its edit screen instead.",
        "A parent category must appear in a row above its children in the same file.",
        "parent_title must exactly match the title of an existing category or of a row above it in this file. If that title isn't unique, give the parent its own distinct title first.",
      ]}
    />
  );
}
