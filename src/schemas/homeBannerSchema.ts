import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const homeBannerSchema = z
  .object({
  industry_id: z.string().min(1, "Industry is required"),
  title: commonValidations.richText("Title"),
  title_ar: commonValidations.richText("Title (Arabic)"),
  description: commonValidations.richText("Description"),
  description_ar: commonValidations.richText("Description (Arabic)"),
  media_type: z.enum(["image", "video"]),
  media_path: commonValidations.requiredFile("Banner Media"),
  thumbnail: commonValidations.optionalFile,
  media_alt: commonValidations.requiredString("Alt text"),
  media_alt_ar: commonValidations.requiredString("Alt text (Arabic)"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
})
  .refine((d) => d.media_type !== "video" || d.thumbnail instanceof File || (typeof d.thumbnail === "string" && d.thumbnail.trim() !== ""), {
    message: "Thumbnail is required for video banners",
    path: ["thumbnail"],
  });

export type HomeBannerFormData = z.infer<typeof homeBannerSchema>;
