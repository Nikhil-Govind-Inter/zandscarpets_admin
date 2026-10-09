import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const serviceCmsSchema = z.object({
  title: commonValidations.requiredText("Title"),
  title_ar: commonValidations.requiredText("Title (Arabic)"),
  description: commonValidations.requiredText("Description"),
  description_ar: commonValidations.requiredText("Description (Arabic)"),
  service_title: commonValidations.requiredText("Service title"),
  service_title_ar: commonValidations.requiredText("Service title (Arabic)"),
  process_steps_title: commonValidations.requiredText("Process steps title"),
  process_steps_title_ar: commonValidations.requiredText("Process steps title (Arabic)"),
});

export type ServiceCmsFormData = z.infer<typeof serviceCmsSchema>;
