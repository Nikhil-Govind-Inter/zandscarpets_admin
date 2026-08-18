import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const adsBannerSchema = z.object({
  media_path: commonValidations.requiredFile("Banner Image"),
  media_alt: commonValidations.requiredString("Alt text"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type AdsBannerFormData = z.infer<typeof adsBannerSchema>;
