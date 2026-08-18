import { commonValidations } from "@/utils/formUtils";
import { z } from "zod";

export const loginSchema = z.object({
  username: commonValidations.requiredString("Username/Email"),
  password: commonValidations.requiredString("Password"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
