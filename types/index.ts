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

export interface Provider {
  id: string;
  name: string; // "Dr. Johnson", "City Dental Group"
  specialty: string; // "Primary Care", "Dentistry", "Cardiology"
  portalUrl: string; // Direct link to patient portal login
  portalPlatform: string; // "MyChart", "Epic", "Patient Portal", "Cerner"
  familyMemberIds: string[]; // Array of family member IDs this provider serves
  notes?: string; // Optional notes about provider
  username?: string; // Optional - portal username hint (not password)
  lastAccessed?: string; // ISO date string of last portal access
  quickAddData?: QuickAddData; // Data from quick-add detection
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