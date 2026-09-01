import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const messagesSchema = z.object({
  media_path: commonValidations.requiredFile("Profile"),
  media_alt: commonValidations.optionalString,
  quotes: commonValidations.requiredString("Quote"),
  name: commonValidations.requiredString("Name"),
  designation: commonValidations.requiredString("Designation"),
  Organization: commonValidations.requiredString("Organization"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type MessagesFormData = z.infer<typeof messagesSchema>;
