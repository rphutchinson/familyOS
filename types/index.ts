// Family-Focused Healthcare Portal Organizer Types

export interface FamilyMember {
  id: string;
  name: string; // "John", "Jane", "Emma", "Dad", etc.
  relationship: string; // "Self", "Spouse", "Child", "Parent"
  color?: string; // Optional color for visual grouping
  isDefault?: boolean; // Mark primary family member (usually "Self")
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