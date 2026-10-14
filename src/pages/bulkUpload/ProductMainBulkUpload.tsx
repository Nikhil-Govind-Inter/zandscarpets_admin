import { BulkUploadWizard } from "@/components/bulkUpload/BulkUploadWizard";

export default function ProductMainBulkUpload() {
  return (
    <BulkUploadWizard
      entity="product-main"
      title="Bulk Upload: Product Main"
      description="Create products fast — one row creates its category, attributes and attribute values along the way if they don't already exist, then the product and its SEO meta data."
      notes={[
        "A faster alternative to the Categories / Attributes / Attribute Values / Products sheets for ad-hoc product entry — not a replacement for them.",
        "Category is required. Sub-Category 1 and Sub-Category 2 are optional — leave them blank if this product doesn't need that many levels. Any level that doesn't exist yet is created automatically under the one before it. Sub-Category 2 can only be filled in if Sub-Category 1 is also filled in.",
        "Attributes lists each option this product has (e.g. Size, Color), separated by ; . Leave both this and the next column blank if this product has no options.",
        "Values for Each Attribute lists one value-group per attribute, in the same order as Attributes, separated by ; . If an attribute has more than one value, separate them with , (e.g. 120cm,140cm) — a variant is created automatically for every combination (2 sizes x 2 colors = 4 variants). Example pair: Attributes = Size;Color, Values for Each Attribute = 120cm,140cm;Oak,Black.",
        "Filling in attributes always creates matching variants — even a single attribute with a single value creates one variant. There's no separate on/off switch for this.",
        "A new attribute only becomes type \"color\" if at least one of its values carries a hex code (e.g. Oak|#8B5A2B) — otherwise it's created as type \"text\". A brand-new attribute introduced here is never type \"icon\".",
        "A missing value under an existing color or icon attribute is created from the text alone (used as its name/color name) even without a hex code or photo — upload the actual hex code, photo, or icon image and alt text afterward via the Attribute Values screen.",
        "Up to 200 variant combinations per row — if Values for Each Attribute would generate more than that, split the product's options across a smaller list or into multiple uploads.",
        "Features, Tags and Specifications are each comma-separated names, e.g. Bestseller,New Arrival for Tags. Leave blank for none. A missing one is created automatically. Ignored when updating an existing product — edit those from the product's screen instead.",
        "meta_title, meta_description and meta_keywords are required (same as the SEO Meta screen).",
        "There are no Arabic (_ar) columns anywhere in this sheet — title_ar/short_description_ar/product_description_ar/meta_*_ar are all set to match their English counterpart automatically. Fill in the Arabic text afterward via the respective edit screens if you need it to differ.",
        "No image, sort order, or active-status columns here — products are created with no image (active by default). Add the product's image afterward via its edit screen.",
        "A row with a title matching an existing product in the resolved category updates it (including its meta data); otherwise a new product and meta record are created. Attributes/Values/Features/Tags/Specifications are all ignored when updating (same as the Products sheet) — use the Product Variants sheet or Manage Variants for an existing product.",
        "No price column here.",
      ]}
    />
  );
}
