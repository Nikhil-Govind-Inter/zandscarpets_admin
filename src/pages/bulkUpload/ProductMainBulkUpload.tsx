import { BulkUploadWizard } from "@/components/bulkUpload/BulkUploadWizard";

export default function ProductMainBulkUpload() {
  return (
    <BulkUploadWizard
      entity="product-main"
      title="Bulk Upload: Product Main"
      description="Create products fast — one row creates its category path, attributes and attribute values along the way if they don't already exist, then the product and its SEO meta data."
      notes={[
        "A faster alternative to the Categories / Attributes / Attribute Values / Products sheets for ad-hoc product entry — not a replacement for them.",
        "category_path is a > separated chain, e.g. \"Flooring > Vinyl Flooring\". Any level that doesn't exist yet is created automatically.",
        "Set has_attributes to TRUE to give this product attributes; leave it FALSE (or blank) to skip attributes entirely. TRUE with an empty attribute_value_refs is an error; FALSE with a filled-in attribute_value_refs just ignores it with a warning.",
        "attribute_value_refs (only used when has_attributes is TRUE) declares which attributes/values this product offers — e.g. Size=120cm,140cm;Color=Oak. You can list more than one value per attribute, comma-separated. By itself this does NOT create a variant — it only resolves/creates the attributes and values and attaches them to the product. An unknown attribute is created as a text attribute.",
        "Set generate_variants to TRUE to also generate every combination of attribute_value_refs' values as real variants (e.g. 2 colors x 3 sizes = 6 variants) — requires has_attributes to be TRUE. Capped at 200 combinations per row. Generated variants have no SKU, media, or custom label yet — adjust those afterward via Manage Variants. If generate_variants is left FALSE and an attribute lists more than one value, those values are still created, just no variants are generated from them.",
        "A new attribute only becomes type \"color\" if at least one of its values carries a hex code (e.g. Color=Oak|#8B5A2B) — otherwise it's created as type \"text\". A brand-new attribute introduced here is never type \"icon\".",
        "A missing value under an existing color or icon attribute is created from the text alone (used as its name/color name) even without a hex code or photo — upload the actual hex code, photo, or icon image and alt text afterward via the Attribute Values screen.",
        "Upload product images via the Media step first, then paste the returned stored path into main_image / list_image. main_image is required; list_image falls back to main_image if left blank.",
        "meta_title, meta_description and meta_keywords are required (same as the SEO Meta screen).",
        "There are no Arabic (_ar) columns anywhere in this sheet — title_ar/short_description_ar/product_description_ar/meta_*_ar are all set to match their English counterpart automatically. Fill in the Arabic text afterward via the respective edit screens if you need it to differ.",
        "A row with a title matching an existing product in the resolved category updates it (including its meta data); otherwise a new product and meta record are created. attribute_value_refs and generate_variants are both ignored when updating (same as the Products sheet) — use the Product Variants sheet or Manage Variants for an existing product.",
        "No price column here.",
      ]}
    />
  );
}
