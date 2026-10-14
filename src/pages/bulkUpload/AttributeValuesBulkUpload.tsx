import { BulkUploadWizard } from "@/components/bulkUpload/BulkUploadWizard";

export default function AttributeValuesBulkUpload() {
  return (
    <BulkUploadWizard
      entity="attribute-values"
      title="Bulk Upload: Attribute Values"
      description="Create or update values for existing attributes (e.g. 120cm, Oak) in bulk."
      notes={[
        "Create the Attributes first — attribute_title must match an existing attribute exactly.",
        "A row with a value matching an existing value under the same attribute updates it; otherwise a new value is created.",
        "Changing a row's value (or its attribute_title) creates a new value rather than renaming the old one. To rename an existing value, use its edit screen instead.",
        "Icon-type values have no value text to match on, so they're always created, never updated — remove and re-add them via the edit screen instead of re-uploading.",
        "Icon images and color photos must already be uploaded via the Media step — paste the stored path into media_path.",
        "What's required depends on the attribute's type: text needs value; icon needs media_path + alt text; color needs a color_code or a photo.",
        "There are no value_ar/media_alt_ar columns — they're set to match value/media_alt automatically. Fill in the Arabic text afterward via the edit screen if you need it to differ.",
      ]}
    />
  );
}
