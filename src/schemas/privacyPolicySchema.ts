import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const privacyPolicySchema = z.object({
  title: commonValidations.requiredText("Title"),
  title_ar: commonValidations.requiredText("Title (Arabic)"),
  content: commonValidations.requiredText("Content"),
  content_ar: commonValidations.requiredText("Content (Arabic)"),
});

export type PrivacyPolicyFormData = z.infer<typeof privacyPolicySchema>;
