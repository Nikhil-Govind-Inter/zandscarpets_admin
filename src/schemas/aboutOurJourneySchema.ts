import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const aboutOurJourneySchema = z.object({
  year: z
    .number()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 10, "Year cannot be too far in the future"),
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredText("Description"),
  media_file: commonValidations.fileUpload,
  media_alt: commonValidations.optionalString,
  status: commonValidations.booleanStatus,
  sort_order: commonValidations.sortOrder,
});

export type AboutOurJourneyFormData = z.infer<typeof aboutOurJourneySchema>;