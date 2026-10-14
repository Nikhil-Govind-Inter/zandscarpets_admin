import { BulkUploadWizard } from "@/components/bulkUpload/BulkUploadWizard";

export default function AttributesBulkUpload() {
  return (
    <BulkUploadWizard
      entity="attributes"
      title="Bulk Upload: Attributes"
      description="Create or update attribute dimensions (Size, Color, …) in bulk."
      notes={[
        "A row with a title matching an existing attribute updates it (type, sort_order, is_active); otherwise a new attribute is created.",
        "There is no title_ar column — it's set to match the title automatically. Fill in the Arabic text afterward via the edit screen if you need it to differ.",
        "Changing a row's title creates a new attribute rather than renaming the old one. To rename an existing attribute, use its edit screen instead.",
        "Attribute titles must be unique across the whole catalog, not just within this file.",
      ]}
    />
  );
}
