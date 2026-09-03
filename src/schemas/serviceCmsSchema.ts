import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const serviceCmsSchema = z.object({
  title: commonValidations.requiredText("Title"),
  description: commonValidations.requiredText("Description"),
  service_title: commonValidations.requiredText("Service title"),
  process_steps_title: commonValidations.requiredText("Process steps title"),
});

export type ServiceCmsFormData = z.infer<typeof serviceCmsSchema>;
