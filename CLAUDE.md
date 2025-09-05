# Family Healthcare Portal Organizer - CLAUDE.md

This documentation serves as a comprehensive reference for the family-focused healthcare portal organizer project.

## Project Overview

The Family Healthcare Portal Organizer is a personal productivity tool designed to organize healthcare provider portals for you and your family members. It serves as an intelligent bookmark manager that groups providers by family member and provides quick access to patient portals.

**Key Features:**
- 👪 **Family Member Management** - Add/edit/delete family members (John, Jane, Kids, etc.)
- 🏥 **Provider Organization** - Each provider can be associated with one or more family members
- 🔗 **Grouped Portal Access** - Dashboard shows providers organized by family member
- ⚡ **Quick Add** - Intelligent portal detection for easy addition of new providers
- 💾 **Local Storage Only** - All data stored locally, no accounts or cloud sync needed
- 🎨 **Clean Family Dashboard** - Color-coded family groups with provider counts
- 📱 **One-Click Portal Access** - Direct links to patient portals with usage tracking

## Tech Stack

- **Framework:** Next.js 15.5.2 with App Router and Turbopack
- **Language:** TypeScript with strict mode
- **Styling:** Tailwind CSS v4 with CSS variables
- **UI Components:** shadcn/ui (New York style) - minimal set
- **Icons:** Lucide React
- **Fonts:** Geist Sans & Geist Mono
- **Storage:** Browser localStorage (no backend needed)
- **State Management:** Simple React hooks with localStorage persistence

## Folder Structure

```
healthcare-portal-organizer/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles with Tailwind v4
│   ├── layout.tsx         # Root layout with fonts and metadata
│   └── page.tsx           # Main portal organizer page
├── components/            # React components
│   └── ui/               # shadcn/ui base components (minimal set)
│       ├── button.tsx    # Button variations
│       ├── card.tsx      # Card components for provider display
│       ├── badge.tsx     # Family member badges
│       ├── avatar.tsx    # User avatars (optional)
│       └── input.tsx     # Form inputs for adding providers
├── hooks/                 # Custom React hooks
│   ├── use-mobile.ts     # Mobile breakpoint detection
│   └── use-providers.ts  # Provider CRUD with localStorage
├── lib/                  # Utilities and helpers
│   └── utils.ts          # Common utility functions (cn, etc.)
├── types/                # TypeScript interfaces
│   └── index.ts          # Provider and FamilyMember interfaces
└── [config files]       # Next.js, TypeScript, Tailwind configs
```

## Data Models

### Core Interfaces (`types/index.ts`)

```typescript
// Family member with personalization options
interface FamilyMember {
  id: string                   // Unique identifier
  name: string                 // Display name ("John", "Jane", "Emma", "Dad")
  relationship: string         // "Self", "Spouse", "Child", "Parent"
  color?: string              // Optional color for visual grouping
  isDefault?: boolean         // Mark primary family member (usually "Self")
}

// Enhanced provider model with family associations
interface Provider {
  id: string                    // Unique identifier
  name: string                  // Provider name ("Dr. Johnson", "City Dental Group")
  specialty: string             // Medical specialty ("Primary Care", "Dentistry")
  portalUrl: string            // Direct link to patient portal login
  portalPlatform: string       // Portal platform ("MyChart", "Epic", "Cerner")
  familyMemberIds: string[]    // Array of family member IDs this provider serves
  notes?: string               // Optional notes about provider
  username?: string            // Optional portal username hint (no passwords!)
  lastAccessed?: string        // ISO date string of last portal access
  quickAddData?: QuickAddData  // Data from quick-add detection
}

// Quick-add detection metadata
interface QuickAddData {
  detectedPlatform?: string    // Auto-detected portal platform
  siteName?: string           // Extracted site name
  favicon?: string            // Provider favicon URL
  autoDetected: boolean       // Whether this was auto-detected vs manual
}

// UI organization helpers
interface FamilyGroup {
  familyMember: FamilyMember   // Family member info
  providers: Provider[]        // Providers associated with this family member
}
```

## State Management

### localStorage Pattern
The application uses a simple localStorage pattern for data persistence:

#### Family Member Management (`hooks/use-family-members.ts`)
```typescript
const {
  familyMembers,        // FamilyMember[] - current family member list
  addFamilyMember,      // (member: Omit<FamilyMember, 'id'>) => void
  updateFamilyMember,   // (id: string, updates: Partial<FamilyMember>) => void
  deleteFamilyMember,   // (id: string) => boolean
  getFamilyMember,      // (id: string) => FamilyMember | undefined
  getDefaultFamilyMember // () => FamilyMember
} = useFamilyMembers()
```

#### Provider Management (`hooks/use-providers.ts`)
```typescript
const {
  providers,                  // Provider[] - current provider list
  addProvider,               // (provider: Omit<Provider, 'id'>) => void
  updateProvider,            // (id: string, updates: Partial<Provider>) => void
  deleteProvider,            // (id: string) => void
  getProvidersByFamilyMember, // (familyMemberId: string) => Provider[]
  groupProvidersByFamily,    // (familyMembers: FamilyMember[]) => FamilyGroup[]
  markProviderAccessed,      // (id: string) => void - tracks portal usage
  quickAddProvider           // (url: string, detectedData?: any) => void
} = useProviders()
```

**Enhanced Features:**
- Family member associations with many-to-many relationships
- Portal usage tracking (last accessed timestamps)
- Quick-add support for browser integration
- Grouped organization for family-based UI display

## UI Components

### Provider Cards
The main interface consists of provider cards that display:
- **Provider Name** - Doctor or facility name
- **Specialty** - Medical specialty or service type
- **Portal Platform** - Which portal system they use
- **Family Member Badge** - Who this provider is for
- **Quick Access Button** - Opens portal in new tab
- **Optional Notes** - Any additional information

### Minimal Component Set
Only essential shadcn/ui components are included:
- `Card` - For provider display
- `Button` - For actions and portal access
- `Badge` - For family member indicators
- `Input` - For add/edit forms (future)
- `Avatar` - For user representation (optional)

## Key Features

### Family Member Management
- **Personalized Family Members:** Add custom names like "John", "Sarah", "Emma" instead of generic "Spouse", "Child"
- **Color-Coded Organization:** Each family member gets a unique color for visual grouping
- **Flexible Relationships:** Support for Self, Spouse, Child, Parent, and custom relationships
- **Default Member Protection:** Prevent accidental deletion of primary family member

### Provider-Family Associations
- **Many-to-Many Relationships:** Providers can serve multiple family members (e.g., family dentist)
- **Grouped Dashboard View:** Providers organized by family member with counts
- **Shared Provider Detection:** Visual indicators when providers serve multiple family members

### Quick Add System
- **Intelligent Portal Detection:** Automatic detection of healthcare portals from URLs
- **Browser Integration Options:** 
  - Bookmarklet approach for current page detection
  - Browser extension manifest included for future development
  - URL analysis for manual entry
- **Platform Recognition:** Automatic identification of MyChart, Epic, Cerner, and other common platforms
- **Confidence Scoring:** Algorithm assigns confidence scores to portal detection

### Enhanced Portal Access
- **Usage Tracking:** Track when portals were last accessed
- **Username Hints:** Optional storage of usernames (never passwords)
- **Auto-Detection Badges:** Visual indicators for quick-added vs manually entered providers
- **Platform-Specific Icons:** Different visual treatment based on portal platform

## Quick Add Implementation

### Portal Detection Algorithm (`lib/portal-detection.ts`)
The quick-add system uses pattern matching to detect healthcare portals:

```typescript
// Platform detection patterns
const PORTAL_PATTERNS = {
  'MyChart': [/mychart/i, /epic/i, /chart\..*\.com/i],
  'Epic': [/epic/i, /myepic/i, /epicmychart/i],
  'Cerner': [/cerner/i, /powerchart/i, /healthelife/i],
  'athenahealth': [/athenahealth/i, /athenacollector/i],
  // ... more platforms
};

// Healthcare keyword detection
const HEALTHCARE_KEYWORDS = [
  'health', 'medical', 'clinic', 'hospital', 'patient',
  'care', 'wellness', 'doctor', 'physician', 'therapy'
];
```

### Integration Approaches

#### 1. Bookmarklet Approach (Current)
- **Simple Implementation:** JavaScript bookmarklet detects current page
- **Cross-Browser:** Works in all modern browsers
- **User-Friendly:** Drag-and-drop installation
- **Privacy-Focused:** No permissions required

```javascript
javascript:(function(){
  const url = window.location.href;
  const title = document.title;
  const isHealthcare = /health|medical|patient|portal/i.test(url + ' ' + title);
  if (isHealthcare) {
    window.open('http://localhost:3001?quickadd=' + encodeURIComponent(url));
  }
})();
```

#### 2. Browser Extension (Future)
- **Enhanced Detection:** Access to page content and metadata
- **Background Processing:** Continuous portal detection
- **Permissions Required:** activeTab permission needed
- **Store Distribution:** Requires Chrome Web Store / Firefox Add-ons approval

#### 3. URL Analysis Tool
- **Manual Entry:** User pastes URL for analysis
- **Batch Processing:** Analyze multiple URLs at once
- **No Browser Integration:** Works entirely within the app

### Detection Confidence Scoring
The system assigns confidence scores (0-1) based on:
- **Pattern Matches:** Higher score for known portal patterns
- **Healthcare Keywords:** Incremental score for medical terms
- **Domain Analysis:** Subdomain and path analysis
- **Meta Tags:** OpenGraph and application name detection

## Development Workflow

### Adding Family Members
1. **Default Setup:** App starts with "Me" as default family member
2. **Custom Names:** Users add personalized names instead of relationships
3. **Color Assignment:** Each member gets unique color for visual distinction
4. **Protection Logic:** Default member cannot be deleted

### Adding Providers
1. **Manual Entry:** Traditional form with name, specialty, URL, platform
2. **Quick Add:** Portal detection from current browser tab
3. **Family Assignment:** Multi-select which family members this provider serves
4. **Auto-Detection:** Platform and metadata automatically filled when possible

### Family-Based Organization
1. **Grouped Display:** Providers organized under family member headings
2. **Color Coding:** Family member colors used throughout interface
3. **Provider Counts:** Show number of providers per family member
4. **Shared Indicators:** Visual cues when providers serve multiple members

## Styling Conventions

### Simple Design System
- **Card-Based Layout:** Each provider gets a clean card
- **Consistent Spacing:** Standard padding and margins
- **Readable Typography:** Clear hierarchy with provider names prominent
- **Color Coding:** Subtle colors for family member categories
- **Mobile-First:** Responsive grid layout

### shadcn/ui Integration
- **Minimal Set:** Only necessary components included
- **Clean Aesthetic:** Focus on usability over complex design
- **Consistent Variants:** Use standard button and badge variants

## Use Cases

### Primary Use Cases
1. **Portal Bookmark Manager:** Replace scattered bookmarks with organized cards
2. **Family Healthcare Organization:** Separate providers by family member
3. **Quick Access:** One-click access to patient portals
4. **Provider Information:** Keep specialty and platform info organized

### Not Designed For
- **Medical Records Management:** This is NOT for storing medical data
- **Appointment Scheduling:** Links to portals, doesn't manage appointments
- **Multi-User Systems:** Personal tool, not for sharing
- **Complex Workflows:** Simple organization only

## Security & Privacy

### Data Handling
- **Local Storage Only:** No data leaves the device
- **No Authentication:** No accounts or login required
- **No Medical Data:** Only portal access information stored
- **Browser-Based:** Data tied to specific browser/device

### Best Practices
- **URL Validation:** Basic validation of portal URLs
- **No Sensitive Data:** Avoid storing usernames/passwords
- **Local Only:** Emphasize data stays on device

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Production server
npm start

# Code linting
npm run lint
```

## Future Enhancements

### Potential Features
- **Add Provider Form:** Modal or page for adding new providers
- **Edit/Delete:** Provider management functionality
- **Search/Filter:** Find providers by name or specialty
- **Export/Import:** JSON backup/restore functionality
- **Usage Tracking:** Track which portals are accessed most
- **Portal Categories:** Group by type (medical, dental, vision, etc.)

### Not Planned
- **User Accounts:** Keep it simple and local
- **Cloud Sync:** Privacy-focused, local-only approach
- **Complex State:** Avoid over-engineering
- **Medical Data Integration:** Stay focused on portal organization

---

This is a personal productivity tool focused on simplifying healthcare portal access. It's intentionally simple, private, and focused on the specific use case of organizing portal bookmarks for individuals and families.