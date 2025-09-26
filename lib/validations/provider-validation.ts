import { z } from "zod";
import { HEALTHCARE_SPECIALTIES } from "@/types";

export const providerSchema = z.object({
  providerName: z
    .string()
    .min(1, "Provider name is required")
    .min(2, "Provider name must be at least 2 characters")
    .max(100, "Provider name must be less than 100 characters"),
  
  portalUrl: z
    .string()
    .min(1, "Portal URL is required")
    .url("Please enter a valid URL")
    .refine((url) => {
      try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      } catch {
        return false;
      }
    }, "URL must be a valid HTTP or HTTPS URL"),
  
  
  specialty: z.enum(HEALTHCARE_SPECIALTIES).refine((val) => val, {
    message: "Please select a specialty"
  }),
  
  familyMemberIds: z
    .array(z.string())
    .min(1, "Please select at least one family member")
    .max(20, "Too many family members selected"),
  
  loginUsername: z
    .string()
    .max(100, "Username must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  
  autoDetected: z.boolean().default(false),
});

export const editProviderSchema = providerSchema.partial().extend({
  id: z.string().min(1, "ID is required"),
});

// For quick-add scenarios
export const quickAddProviderSchema = providerSchema.partial().extend({
  providerName: z.string().min(1, "Provider name is required"),
  portalUrl: z.string().url("Please enter a valid URL"),
  familyMemberIds: z.array(z.string()).min(1, "Please select at least one family member"),
});

// Form data excludes autoDetected since it's not user input
export const providerFormSchema = providerSchema.omit({ autoDetected: true });

export type ProviderFormData = z.infer<typeof providerFormSchema>;
export type EditProviderFormData = z.infer<typeof editProviderSchema>;
export type QuickAddProviderFormData = z.infer<typeof quickAddProviderSchema>;