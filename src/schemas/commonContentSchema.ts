import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const commonContentSchema = z
  .object({
  why_choose_title: commonValidations.requiredText("Why choose title"),
  why_choose_title_ar: commonValidations.requiredText("Why choose title (Arabic)"),
  side_section_title: commonValidations.requiredText("Side section title"),
  side_section_title_ar: commonValidations.requiredText("Side section title (Arabic)"),
  side_section_description: commonValidations.requiredText("Side section description"),
  side_section_description_ar: commonValidations.requiredText("Side section description (Arabic)"),
  button_text: commonValidations.requiredText("Button text"),
  button_text_ar: commonValidations.requiredText("Button text (Arabic)"),
  button_link: commonValidations.requiredText("Button link"),
  how_section_title: commonValidations.requiredText("How section title"),
  how_section_title_ar: commonValidations.requiredText("How section title (Arabic)"),
  how_section_bg_title: z.string().optional(),
  how_section_bg_title_ar: z.string().optional(),
  how_section_media_type: z.enum(["image", "video"]),
  how_section_media_path: commonValidations.requiredFile("How section media"),
  how_section_thumbnail: commonValidations.optionalFile,
})
  .refine(
    (d) =>
      d.how_section_media_type !== "video" ||
      d.how_section_thumbnail instanceof File ||
      (typeof d.how_section_thumbnail === "string" && d.how_section_thumbnail.trim() !== ""),
    { message: "Thumbnail is required for video media", path: ["how_section_thumbnail"] },
  );

export type CommonContentFormData = z.infer<typeof commonContentSchema>;
