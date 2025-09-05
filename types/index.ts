// Family-Focused Healthcare Portal Organizer Types

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

export interface FamilyMember {
  id: string;
  name: string; // "John", "Jane", "Emma", "Dad", etc.
  relationship: FamilyRelationship;
  color: string; // Required color for visual grouping
  isDefault: boolean; // Mark primary family member (usually "Self")
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export const PORTAL_PLATFORMS = [
  "Epic MyChart",
  "Cerner HealtheLife", 
  "athenahealth",
  "NextMD",
  "AllScripts FollowMyHealth",
  "DrChrono",
  "Practice Fusion",
  "eClinicalWorks",
  "Greenway",
  "Other"
] as const;

export type PortalPlatform = typeof PORTAL_PLATFORMS[number];

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
  portalName: string; // "Johnson Family Practice Portal", "City Dental Patient Access"
  portalUrl: string; // Direct link to patient portal login
  portalPlatform: PortalPlatform; // Standardized platform types
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

export interface QuickAddData {
  detectedPlatform?: string; // Auto-detected portal platform
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
  portalPlatform: string;
  confidence: number; // 0-1 confidence score
  favicon?: string;
}