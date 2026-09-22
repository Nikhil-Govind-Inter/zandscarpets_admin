import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const projectsSchema = z.object({
  category_id: z.string().min(1, "Industry is required"),
  title: commonValidations.requiredString("Title"),
  title_ar: commonValidations.requiredString("Title (Arabic)"),
  location: commonValidations.requiredString("Location"),
  location_ar: commonValidations.requiredString("Location (Arabic)"),
  date_of_completion: commonValidations.optionalDate,
  material_type: commonValidations.requiredString("Material Type"),
  material_type_ar: commonValidations.requiredString("Material Type (Arabic)"),
  thumbnail: commonValidations.requiredFile("Thumbnail"),
  media_path: commonValidations.requiredFile("project image"),
  description: commonValidations.requiredString("Description"),
  description_ar: commonValidations.requiredString("Description (Arabic)"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
  is_show_in_home: commonValidations.booleanStatus,
});

export type ProjectsFormData = z.infer<typeof projectsSchema>;
