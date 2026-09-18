import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const homeBannerSchema = z.object({
  industry_id: z.string().min(1, "Industry is required"),
  title: commonValidations.requiredString("Title"),
  title_ar: commonValidations.requiredString("Title (Arabic)"),
  description: commonValidations.requiredString("Description"),
  description_ar: commonValidations.requiredString("Description (Arabic)"),
  media_path: commonValidations.requiredFile("Banner Image"),
  media_alt: commonValidations.requiredString("Alt text"),
  media_alt_ar: commonValidations.requiredString("Alt text (Arabic)"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type HomeBannerFormData = z.infer<typeof homeBannerSchema>;
