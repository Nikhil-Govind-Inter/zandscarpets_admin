import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const socialMediaSchema = z.object({
  media_path: commonValidations.fileUpload,
  media_alt: commonValidations.requiredString("Alt text"),
  link: commonValidations.requiredString("Link"),
  // Backend validates sort_order as isInt({ min: 1 }) — 0 is rejected, so
  // this can't reuse commonValidations.sortOrder (which allows 0).
  sort_order: z
    .string()
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 1;
    }, "Sort order must be 1 or greater"),
  is_active: commonValidations.booleanStatus,
});

export type SocialMediaFormData = z.infer<typeof socialMediaSchema>;
