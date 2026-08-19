import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const homeBannerSchema = z.object({
  industry_id: z.string().min(1, "Industry is required"),
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredString("Description"),
  media_path: commonValidations.requiredFile("Banner Image"),
  media_alt: commonValidations.requiredString("Alt text"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type HomeBannerFormData = z.infer<typeof homeBannerSchema>;
