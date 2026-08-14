import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const investInGoecExploreSchema = z.object({
  name: commonValidations.requiredString("Name"),
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredText("Description"),
  media_file: commonValidations.fileUpload,
  media_alt: commonValidations.optionalString,
  points: commonValidations.requiredText("Points"),
  status: commonValidations.booleanStatus,
  sort_order: commonValidations.sortOrder,
});

export type InvestInGoecExploreFormData = z.infer<typeof investInGoecExploreSchema>;