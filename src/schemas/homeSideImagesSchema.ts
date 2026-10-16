import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const homeSideImagesSchema = z.object({
  before_media_path: commonValidations.requiredFile("Before image"),
  after_media_path: commonValidations.requiredFile("After image"),
  before_media_alt: commonValidations.requiredString("Before image alt text"),
  before_media_alt_ar: commonValidations.requiredString("Before image alt text (Arabic)"),
  after_media_alt: commonValidations.requiredString("After image alt text"),
  after_media_alt_ar: commonValidations.requiredString("After image alt text (Arabic)"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type HomeSideImagesFormData = z.infer<typeof homeSideImagesSchema>;
