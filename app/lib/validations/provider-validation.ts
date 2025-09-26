import { z } from 'zod';

export const providerFormSchema = z.object({
  providerName: z.string().min(1, 'Provider name is required').max(200, 'Name must be less than 200 characters'),
  portalUrl: z.string().url('Please enter a valid URL'),
  familyMemberIds: z.array(z.string()).min(1, 'At least one family member must be selected'),
  specialty: z.string().min(1, 'Specialty is required'),
  loginUsername: z.string().optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export type ProviderFormData = z.infer<typeof providerFormSchema>;

// Also export as providerSchema for backward compatibility
export const providerSchema = providerFormSchema;