import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

// Mirrors server/modules/admin/http/request/products/productsRequest.js.
// Relation id arrays (colors, sizes, hash tags, related products) are managed
// outside react-hook-form (MultiSelect state in the form), like category highlights.
const requiredFile = (label: string) =>
  z
    .custom<File | string | null>()
    .refine(
      (v) => v instanceof File || (typeof v === "string" && v.trim().length > 0),
      `${label} is required`,
    );

// Rich-text editors emit "<p></p>" (or similar) when cleared.
const requiredRichText = (label: string) =>
  z
    .string()
    .refine(
      (v) => v.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0,
      `${label} is required`,
    );

export const productSchema = z
  .object({
    product_category_id: z.string().min(1, "Category is required"),
    tag_id: z.string().optional(),
    title: commonValidations.requiredString("Title"),
    title_ar: commonValidations.requiredString("Title (Arabic)"),
    slug: commonValidations.requiredString("Slug"),
    price: z
      .string()
      .min(1, "Price is required")
      .regex(/^\d+(\.\d{1,2})?$/, "Price must be a number with up to 2 decimals"),
    short_description: commonValidations.requiredString("Short description"),
    short_description_ar: commonValidations.requiredString("Short description (Arabic)"),
    product_description: requiredRichText("Product description"),
    product_description_ar: requiredRichText("Product description (Arabic)"),
    specification: z.array(z.object({ en: z.string(), ar: z.string() })),
    test_reports_description: requiredRichText("Test reports description"),
    test_reports_description_ar: requiredRichText("Test reports description (Arabic)"),
    installation_instruction: requiredRichText("Installation instruction"),
    installation_instruction_ar: requiredRichText("Installation instruction (Arabic)"),
    maintenance: requiredRichText("Maintenance"),
    maintenance_ar: requiredRichText("Maintenance (Arabic)"),
    packing_and_shipping: requiredRichText("Packing and shipping"),
    packing_and_shipping_ar: requiredRichText("Packing and shipping (Arabic)"),
    related_accessories: requiredRichText("Related accessories"),
    media_path: requiredFile("Image"),
    media_alt: commonValidations.requiredString("Image alt"),
    media_alt_ar: commonValidations.requiredString("Image alt (Arabic)"),
    data_sheet: requiredFile("Data sheet"),
    sort_order: commonValidations.sortOrder,
    is_active: commonValidations.booleanStatus,
  })
  .superRefine((data, ctx) => {
    // Specification rows are paired EN/AR, so both arrays stay the same length;
    // a row must be filled in both languages or removed.
    data.specification.forEach((row, index) => {
      if (!row.en.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["specification", index, "en"],
          message: "Required",
        });
      }
      if (!row.ar.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["specification", index, "ar"],
          message: "Required",
        });
      }
    });
  });

export type ProductFormData = z.infer<typeof productSchema>;
