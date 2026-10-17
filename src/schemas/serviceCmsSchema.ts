import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const serviceCmsSchema = z.object({
  title: commonValidations.richText("Title"),
  title_ar: commonValidations.richText("Title (Arabic)"),
  description: commonValidations.richText("Description"),
  description_ar: commonValidations.richText("Description (Arabic)"),
  service_title: commonValidations.richText("Service title"),
  service_title_ar: commonValidations.richText("Service title (Arabic)"),
  process_steps_title: commonValidations.requiredText("Process steps title"),
  process_steps_title_ar: commonValidations.requiredText("Process steps title (Arabic)"),
  process_steps_bg_title: z.string().optional(),
  process_steps_bg_title_ar: z.string().optional(),
});

export type ServiceCmsFormData = z.infer<typeof serviceCmsSchema>;
