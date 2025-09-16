import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const careersSchema = z.object({
  // Dropdown fields
  locationId: commonValidations.requiredString("Location"), 
  jobTypeId: commonValidations.requiredString("Job Type"),
  professionalsId: commonValidations.requiredString("Professional"),
  
  // Basic fields
  title: commonValidations.requiredString("Title"),
  highlightTitle: z.string().optional(),
  keywords: z.string().optional(),
  
  // Required experience
  requiredExperienceTitle: z.string().optional(),
  
  // Job description fields  
  description: commonValidations.richText("Description").max(255, "Description must be 255 characters or less"),
  subDescription: z.string().max(255, "Sub description must be 255 characters or less").optional(),
  
  // About section fields
  aboutTitle: z.string().optional(),
  aboutHighlightTitle: z.string().optional(), 
  aboutDescription: commonValidations.optionalRichText,
  
  // About the role section fields
  aboutTheRoleTitle: z.string().optional(),
  aboutTheRoleHighlightTitle: z.string().optional(),
  aboutTheRoleDescription: commonValidations.optionalRichText,
  
  // Nice to have section fields
  niceToHaveTitle: z.string().optional(),
  niceToHaveHighlightTitle: z.string().optional(),
  niceToHaveDescription: commonValidations.optionalRichText,
  
  // Apply button fields
  applyButtonText: z.string().optional(),
  applyButtonLink: z.string().optional(),
  
  // Meta information fields
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  
  // Settings
  status: commonValidations.statusEnum.default("active"),
  sortOrder: z.number().min(0, "Sort order must be 0 or greater").default(1),
});

export type CareersFormData = z.infer<typeof careersSchema>;