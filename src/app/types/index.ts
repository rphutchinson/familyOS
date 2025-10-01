// FamilyOS - Family Organization Platform Types

export const FAMILY_RELATIONSHIPS = [
  "Self",
  "Spouse",
  "Partner",
  "Child", 
  "Parent",
  "Sibling",
  "Grandparent",
  "Grandchild",
  "Other"
] as const;

export type FamilyRelationship = typeof FAMILY_RELATIONSHIPS[number];

export const FAMILY_COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#22c55e", // Green
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#f97316", // Orange
  "#6366f1", // Indigo
] as const;

// Core family preference types for cross-module functionality
export interface NotificationPreferences {
  enabled: boolean;
  email?: string;
  reminderTypes: string[];
  quietHours?: {
    start: string; // "22:00"
    end: string;   // "08:00"
  };
}

export interface UIPreferences {
  theme?: 'light' | 'dark' | 'system';
  compactView?: boolean;
  defaultModule?: string; // Default module to show on app load
  dashboardLayout?: 'grid' | 'list';
}

export interface HealthcarePreferences {
  defaultInsurance?: string;
  emergencyContact?: string;
  allergies?: string[];
  medications?: string[];
  preferredLanguage?: string;
}

export interface FamilyPreferences {
  healthcare?: HealthcarePreferences;
  notifications?: NotificationPreferences;
  ui?: UIPreferences;
  // Future modules: todos?, calendar?, meals?, streaming?, etc.
}

export interface FamilyMemberMetadata {
  // Extensible metadata for future modules
  [key: string]: any;
}

export interface ModulePermissions {
  // Future: Fine-grained permissions for family organization features
  healthcare?: {
    canView: boolean;
    canEdit: boolean;
    canManageProviders: boolean;
  };
  // Future: todos?, calendar?, meals?, etc.
}

export interface FamilyMember {
  id: string;
  name: string; // "John", "Jane", "Emma", "Dad", etc.
  relationship: FamilyRelationship;
  color: string; // Required color for visual grouping
  isDefault: boolean; // Mark primary family member (usually "Self")
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string

  // New FamilyOS enhanced fields
  preferences?: FamilyPreferences; // Cross-module preferences
  metadata?: FamilyMemberMetadata; // Extensible data storage
  modulePermissions?: ModulePermissions; // Future access control
}


export const HEALTHCARE_SPECIALTIES = [
  "Primary Care",
  "Family Medicine", 
  "Internal Medicine",
  "Pediatrics",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Neurology",
  "Oncology",
  "Orthopedics",
  "Psychiatry",
  "Radiology",
  "Surgery",
  "Urology",
  "Gynecology",
  "Ophthalmology",
  "ENT (Ear, Nose, Throat)",
  "Dentistry",
  "Vision/Optometry",
  "Mental Health",
  "Physical Therapy",
  "Urgent Care",
  "Emergency Medicine",
  "Other"
] as const;

export type HealthcareSpecialty = typeof HEALTHCARE_SPECIALTIES[number];

export interface HealthcareProvider {
  id: string;
  providerName: string; // "Dr. Sarah Johnson", "City Dental Group"
  portalUrl: string; // Direct link to patient portal login
  specialty: HealthcareSpecialty; // Standardized specialty types
  familyMemberIds: string[]; // Array of family member IDs this provider serves
  loginUsername?: string; // Optional - portal username hint (never password)
  notes?: string; // Optional notes about provider or portal
  lastUsed?: string; // ISO date string of last portal access
  autoDetected: boolean; // Whether this was auto-detected via quick-add
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  quickAddData?: QuickAddData; // Metadata from quick-add detection
}

// Keep old Provider interface for backward compatibility during transition
export interface Provider extends HealthcareProvider {
  name: string; // Alias for providerName for backward compatibility
}

// Create a computed provider that includes the name field
export const createProviderWithName = (healthcareProvider: HealthcareProvider): Provider => ({
  ...healthcareProvider,
  name: healthcareProvider.providerName
});

export interface QuickAddData {
  siteName?: string; // Extracted site name
  favicon?: string; // Provider favicon URL
  autoDetected: boolean; // Whether this was auto-detected vs manual
}

// For organizing providers by family member in UI
export interface FamilyGroup {
  familyMember: FamilyMember;
  providers: Provider[];
}

// For quick-add portal detection
export interface PortalDetectionResult {
  siteName: string;
  confidence: number; // 0-1 confidence score
  favicon?: string;
}

// FamilyOS Module System Types
export interface ModuleRoute {
  path: string;
  name: string;
  component: React.ComponentType | null;
}

export interface ModuleComponent {
  name: string;
  component: React.ComponentType | null;
  props?: Record<string, any>;
}

export interface FamilyModule {
  id: string;
  name: string;
  icon: any; // LucideIcon type - will be imported where used
  description: string;
  version: string;
  enabled: boolean;
  category: 'health' | 'productivity' | 'entertainment' | 'finance' | 'other';

  // Module lifecycle
  initialize?: () => Promise<void> | void;
  cleanup?: () => Promise<void> | void;

  // Module content
  getRoutes?: () => ModuleRoute[];
  getComponents?: () => ModuleComponent[];

  // Module permissions and requirements
  requiredPermissions?: string[];
  familyMemberAccess?: 'all' | 'self' | 'adults' | 'custom';
}

// App-level state management types
export interface AppSettings {
  enabledModules: string[];
  defaultModule: string;
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  firstTimeSetup: boolean;
}

// For future module data synchronization
export interface ModuleDataContext {
  familyMembers: FamilyMember[];
  currentUser?: FamilyMember;
  appSettings: AppSettings;
}