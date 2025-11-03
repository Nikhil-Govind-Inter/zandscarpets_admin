import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

// Base schemas for common form patterns
export const baseContentSchema = z.object({
  title: commonValidations.requiredString("Title"),
  slug: commonValidations.optionalString,
  description: commonValidations.optionalString,
  content: commonValidations.optionalString,
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export const baseCMSSchema = z.object({
  title: commonValidations.requiredString("Title"),
  subtitle: commonValidations.optionalString,
  description: commonValidations.optionalString,
  content: commonValidations.richText("Content"),
  featured_image: commonValidations.fileUpload,
  status: commonValidations.booleanStatus,
});

export const baseListItemSchema = z.object({
  name: commonValidations.requiredString("Name"),
  slug: commonValidations.optionalString,
  description: commonValidations.optionalString,
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export const baseMediaSchema = z.object({
  title: commonValidations.requiredString("Title"),
  media_type: commonValidations.mediaType,
  media_path: commonValidations.fileUpload,
  alt_text: commonValidations.optionalString,
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export const baseBlogSchema = z.object({
  post_title: commonValidations.requiredString("Title"),
  slug: commonValidations.requiredString("Slug"),
  featured_image: commonValidations.fileUpload,
  excerpt: commonValidations.optionalString,
  author_name: commonValidations.optionalString,
  content: commonValidations.richText("Content"),
  published_date: commonValidations.dateString,
  seo_title: commonValidations.optionalString,
  seo_description: commonValidations.optionalString,
  focus_keyword: commonValidations.optionalString,
  estimated_reading_time: z
    .string()
    .min(1)
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num > 0;
    }, "Estimated reading time must be a positive integer"),
  status: commonValidations.publishStatus,
  sort_order: commonValidations.sortOrder,
  categories: commonValidations.categoryArray,
  tags: commonValidations.tagArray,
});

export const baseLocationSchema = z.object({
  name: commonValidations.requiredString("Location Name"),
  slug: commonValidations.optionalString,
  address: commonValidations.optionalString,
  city: commonValidations.optionalString,
  state: commonValidations.optionalString,
  postal_code: commonValidations.optionalString,
  country: commonValidations.optionalString,
  phone: commonValidations.optionalString,
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  status: commonValidations.booleanStatus,
});

export const baseJobSchema = z.object({
  title: commonValidations.requiredString("Job Title"),
  slug: commonValidations.optionalString,
  description: commonValidations.richText("Job Description"),
  requirements: commonValidations.optionalString,
  location: commonValidations.optionalString,
  job_type: commonValidations.optionalString,
  salary_range: commonValidations.optionalString,
  application_deadline: commonValidations.optionalDate,
  status: commonValidations.statusEnum,
  sort_order: commonValidations.sortOrder,
});

export const baseTestimonialSchema = z.object({
  name: commonValidations.requiredString("Name"),
  role: commonValidations.optionalString,
  company: commonValidations.optionalString,
  content: commonValidations.requiredString("Testimonial Content"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  avatar: commonValidations.fileUpload,
  status: commonValidations.booleanStatus,
  sort_order: commonValidations.sortOrder,
});

export const baseFAQSchema = z.object({
  question: commonValidations.requiredString("Question"),
  answer: commonValidations.richText("Answer"),
  category_id: z.number().min(1, "Category is required"),
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export const baseSliderSchema = z.object({
  title: commonValidations.requiredString("Title"),
  subtitle: commonValidations.optionalString,
  description: commonValidations.optionalString,
  image: commonValidations.fileUpload,
  mobile_image: commonValidations.fileUpload,
  button_text: commonValidations.optionalString,
  button_link: commonValidations.optionalUrl,
  sort_order: commonValidations.sortOrder,
  status: commonValidations.booleanStatus,
});

export const baseProviderSchema = z.object({
  name: commonValidations.requiredString("Provider Name"),
  slug: commonValidations.optionalString,
  description: commonValidations.optionalString,
  logo: commonValidations.fileUpload,
  website: commonValidations.optionalUrl,
  phone: commonValidations.optionalString,
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: commonValidations.optionalString,
  specializations: commonValidations.tagArray,
  status: commonValidations.booleanStatus,
  sort_order: commonValidations.sortOrder,
});

// Meta field schema for forms that support custom meta fields
export const metaFieldSchema = z.object({
  key: commonValidations.requiredString("Key"),
  value: commonValidations.requiredString("Value"),
});

// Extended schemas with meta fields
export const extendedBlogSchema = baseBlogSchema.extend({
  meta_fields: z.array(metaFieldSchema).optional(),
});

// Common form data types
export type BaseContentFormData = z.infer<typeof baseContentSchema>;
export type BaseCMSFormData = z.infer<typeof baseCMSSchema>;
export type BaseListItemFormData = z.infer<typeof baseListItemSchema>;
export type BaseMediaFormData = z.infer<typeof baseMediaSchema>;
export type BaseBlogFormData = z.infer<typeof baseBlogSchema>;
export type BaseLocationFormData = z.infer<typeof baseLocationSchema>;
export type BaseJobFormData = z.infer<typeof baseJobSchema>;
export type BaseTestimonialFormData = z.infer<typeof baseTestimonialSchema>;
export type BaseFAQFormData = z.infer<typeof baseFAQSchema>;
export type BaseSliderFormData = z.infer<typeof baseSliderSchema>;
export type BaseProviderFormData = z.infer<typeof baseProviderSchema>;
export type MetaFieldFormData = z.infer<typeof metaFieldSchema>;