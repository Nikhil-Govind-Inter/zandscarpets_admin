import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const aboutMediaSchema = z.object({
  thumbnail: commonValidations.fileUpload,
  thumbnail_alt: commonValidations.optionalString,
  media_type: z.enum(["image", "video"], {
    required_error: "Media type is required",
  }),
  media_desktop_file: commonValidations.fileUpload,
  media_mobile_file: commonValidations.fileUpload,
  media_alt: commonValidations.optionalString,
  status: commonValidations.booleanStatus,
  sort_order: commonValidations.sortOrder,
});

export type AboutMediaFormData = z.infer<typeof aboutMediaSchema>;