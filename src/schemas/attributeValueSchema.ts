import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

// `type` and `color_mode` aren't user inputs — they mirror the selected
// attribute's type and the color bar/photo choice so the schema can require the
// fields that type needs (the server does the same in missingForType).
const hasMedia = (value: unknown) =>
  value instanceof File ||
  (typeof value === "string" && value.trim().length > 0);

export const attributeValueSchema = z
  .object({
    attribute_id: z.string().min(1, "Attribute is required"),
    type: z.enum(["text", "icon", "color"]).optional(),
    color_mode: z.enum(["color", "image"]).optional(),
    value: commonValidations.optionalString.or(z.literal("")),
    value_ar: commonValidations.optionalString.or(z.literal("")),
    media_path: z.custom<File | string>().optional().nullable(),
    media_alt: commonValidations.optionalString.or(z.literal("")),
    media_alt_ar: commonValidations.optionalString.or(z.literal("")),
    color_code: z
      .string()
      .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
        message: "Color code must be a hex value (e.g. #FF0000)",
      })
      .or(z.literal(""))
      .optional(),
    sort_order: commonValidations.sortOrder,
    is_active: commonValidations.booleanStatus,
  })
  .superRefine((data, ctx) => {
    // No attribute chosen yet — attribute_id's own error covers this case.
    if (!data.type) return;

    const require = (
      path: "value" | "value_ar" | "media_path" | "media_alt" | "media_alt_ar" | "color_code",
      message: string,
      missing: boolean,
    ) => {
      if (missing) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
    };

    if (data.type === "text") {
      require("value", "Value is required", !data.value?.trim());
      require("value_ar", "Value (Arabic) is required", !data.value_ar?.trim());
    } else if (data.type === "icon") {
      require("media_path", "Icon image is required", !hasMedia(data.media_path));
      require("media_alt", "Image alt is required", !data.media_alt?.trim());
      require("media_alt_ar", "Image alt (Arabic) is required", !data.media_alt_ar?.trim());
    } else if (data.type === "color") {
      require("value", "Name is required", !data.value?.trim());
      require("value_ar", "Name (Arabic) is required", !data.value_ar?.trim());
      if (data.color_mode === "image") {
        require("media_path", "Color photo is required", !hasMedia(data.media_path));
        require("media_alt", "Image alt is required", !data.media_alt?.trim());
        require("media_alt_ar", "Image alt (Arabic) is required", !data.media_alt_ar?.trim());
      } else {
        require("color_code", "Pick a color", !data.color_code?.trim());
      }
    }
  });

export type AttributeValueFormData = z.infer<typeof attributeValueSchema>;
