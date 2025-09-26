import { z } from 'zod';

export const familyMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  relationship: z.enum([
    'Self', 'Spouse', 'Partner', 'Child', 'Parent', 'Sibling',
    'Grandparent', 'Grandchild', 'Other'
  ]),
  color: z.string(),
  isDefault: z.boolean().optional(),
  preferences: z.object({
    healthcare: z.object({
      defaultInsurance: z.string().optional(),
      emergencyContact: z.string().optional(),
      allergies: z.array(z.string()).optional(),
      medications: z.array(z.string()).optional(),
      preferredLanguage: z.string().optional(),
    }).optional(),
    notifications: z.object({
      enabled: z.boolean(),
      email: z.string().optional(),
      reminderTypes: z.array(z.string()),
      quietHours: z.object({
        start: z.string(),
        end: z.string(),
      }).optional(),
    }).optional(),
    ui: z.object({
      theme: z.enum(['light', 'dark', 'system']).optional(),
      compactView: z.boolean().optional(),
      defaultModule: z.string().optional(),
      dashboardLayout: z.enum(['grid', 'list']).optional(),
    }).optional(),
  }).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type FamilyMemberFormData = z.infer<typeof familyMemberSchema>;