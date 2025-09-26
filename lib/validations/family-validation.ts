import { z } from "zod";
import { FAMILY_RELATIONSHIPS, FAMILY_COLORS } from "@/types";

export const familyMemberSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  
  relationship: z.enum(FAMILY_RELATIONSHIPS).refine((val) => val, {
    message: "Please select a relationship"
  }),
  
  color: z
    .string()
    .min(1, "Please select a color")
    .refine((color) => FAMILY_COLORS.includes(color as any), "Please select a valid color"),
  
  isDefault: z.boolean().default(false),
});

export const editFamilyMemberSchema = familyMemberSchema.partial().extend({
  id: z.string().min(1, "ID is required"),
});

export type FamilyMemberFormData = z.infer<typeof familyMemberSchema>;
export type EditFamilyMemberFormData = z.infer<typeof editFamilyMemberSchema>;