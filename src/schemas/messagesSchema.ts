import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const messagesSchema = z.object({
  media_path: commonValidations.requiredFile("Profile"),
  media_alt: commonValidations.optionalString,
  media_alt_ar: commonValidations.optionalString,
  quotes: commonValidations.requiredString("Quote"),
  quotes_ar: commonValidations.requiredString("Quote (Arabic)"),
  name: commonValidations.requiredString("Name"),
  name_ar: commonValidations.requiredString("Name (Arabic)"),
  designation: commonValidations.requiredString("Designation"),
  designation_ar: commonValidations.requiredString("Designation (Arabic)"),
  Organization: commonValidations.requiredString("Organization"),
  organization_ar: commonValidations.requiredString("Organization (Arabic)"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type MessagesFormData = z.infer<typeof messagesSchema>;
