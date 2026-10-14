import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const privacyPolicySchema = z.object({
  title: commonValidations.requiredText("Title"),
  title_ar: commonValidations.requiredText("Title (Arabic)"),
  content: commonValidations.richText("Content"),
  content_ar: commonValidations.richText("Content (Arabic)"),
});

export type PrivacyPolicyFormData = z.infer<typeof privacyPolicySchema>;
