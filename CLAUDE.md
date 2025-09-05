# Healthcare Dashboard - CLAUDE.md

This documentation serves as a comprehensive reference for understanding the healthcare dashboard project architecture and development workflow.

## Project Overview

The Healthcare Dashboard is a modern provider management system built for healthcare organizations. It provides an intuitive interface for managing healthcare providers, tracking patient appointments, and monitoring key performance metrics.

**Key Features:**
- 🏥 **Provider Management** - Comprehensive provider tracking and status management
- 📅 **Appointment Scheduling** - Real-time appointment monitoring and management  
- 📊 **Analytics Dashboard** - Key metrics and performance indicators
- 🎨 **Modern UI** - Clean, responsive design with shadcn/ui components
- 🌙 **Dark Mode Support** - Built-in light/dark theme switching
- 📱 **Mobile Responsive** - Optimized for all device sizes

## Tech Stack

- **Framework:** Next.js 15.5.2 with App Router and Turbopack
- **Language:** TypeScript with strict mode
- **Styling:** Tailwind CSS v4 with CSS variables
- **UI Components:** shadcn/ui (New York style)
- **Icons:** Lucide React
- **Fonts:** Geist Sans & Geist Mono
- **State Management:** Custom React hooks with local state
- **Animation:** tw-animate-css for enhanced animations

## Folder Structure

```
healthcare-dashboard/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles with Tailwind v4
│   ├── layout.tsx         # Root layout with fonts and metadata
│   └── page.tsx           # Dashboard homepage
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   │   ├── button.tsx    # Button variations
│   │   ├── card.tsx      # Card components
│   │   ├── badge.tsx     # Status badges
│   │   ├── avatar.tsx    # User avatars
│   │   ├── sidebar.tsx   # Sidebar navigation
│   │   └── [other-ui]    # Additional UI primitives
│   └── dashboard-layout.tsx # Main dashboard layout wrapper
├── hooks/                 # Custom React hooks
│   ├── use-mobile.ts     # Mobile breakpoint detection
│   └── use-providers.ts  # Provider data management
├── lib/                  # Utilities and helpers
│   └── utils.ts          # Common utility functions (cn, formatDate, formatPhoneNumber)
├── types/                # TypeScript interfaces
│   └── index.ts          # Core type definitions
├── public/               # Static assets
├── components.json       # shadcn/ui configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## Key Components

### DashboardLayout (`components/dashboard-layout.tsx`)
Main layout component providing:
- **Sidebar Navigation:** Fixed navigation with icons and badges
- **Header:** Top bar with system status and user info
- **Content Area:** Main content wrapper with proper spacing
- **Responsive Design:** Mobile-first with collapsible sidebar

Navigation items include:
- Dashboard (Home)
- Providers (with badge count)
- Appointments (with notification count)
- Analytics
- Settings

### UI Components (`components/ui/`)
Based on shadcn/ui with customizations:
- **Card Components:** Used for dashboard widgets and content sections
- **Badge Components:** Status indicators with semantic variants
- **Avatar Components:** User profile images with fallbacks
- **Sidebar Components:** Navigation structure with proper accessibility
- **Button Components:** Multiple variants and sizes
- **Input Components:** Form controls with consistent styling

## Data Models

### Core Interfaces (`types/index.ts`)

```typescript
// Provider entity - core healthcare provider data
interface Provider {
  id: string
  name: string
  specialty: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'pending'
  joinDate: string
  patientsCount: number
}

// Patient entity - patient information
interface Patient {
  id: string
  name: string
  dateOfBirth: string
  providerId: string
  lastVisit: string
  status: 'active' | 'inactive'
}

// Dashboard metrics for overview display
interface DashboardStats {
  totalProviders: number
  activeProviders: number
  totalPatients: number
  appointmentsToday: number
}

// Navigation configuration
interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
}
```

## State Management

### Custom Hooks Pattern
The application uses custom React hooks for state management rather than external state management libraries:

#### `useProviders` Hook (`hooks/use-providers.ts`)
Manages provider data with full CRUD operations:

```typescript
const {
  providers,      // Provider[] - current provider list
  loading,        // boolean - loading state
  error,          // string | null - error state
  addProvider,    // (provider: Omit<Provider, 'id'>) => void
  updateProvider, // (id: string, updates: Partial<Provider>) => void
  deleteProvider  // (id: string) => void
} = useProviders()
```

**Features:**
- Mock data simulation with 1-second delay
- Optimistic updates for better UX
- Error handling for failed operations
- Type-safe CRUD operations

#### `useMobile` Hook (`hooks/use-mobile.ts`)
Provides responsive breakpoint detection for mobile-first design.

## Styling Conventions

### Tailwind CSS v4 Configuration
- **CSS Variables:** Custom properties for theming support
- **Color System:** Semantic color tokens with light/dark variants
- **Typography:** Geist font family integration
- **Spacing:** Consistent spacing scale
- **Border Radius:** Customizable radius system (`--radius: 0.625rem`)

### Component Styling Patterns
- **Conditional Classes:** Use `cn()` utility for merging Tailwind classes
- **Responsive Design:** Mobile-first approach with `md:` and `lg:` breakpoints
- **Color Semantics:** 
  - `text-muted-foreground` for secondary text
  - `bg-background` and `text-foreground` for base colors
  - Status colors: `text-green-600` for success states
- **Layout Patterns:** `space-y-*` for vertical spacing, `grid gap-4` for layouts

### shadcn/ui Integration
- **New York Style:** Clean, modern aesthetic
- **CSS Variables:** Full theming support
- **Component Variants:** Use `variant` props for different styles
- **Accessibility:** Built-in ARIA attributes and keyboard navigation

## Development Workflow

### Adding New Features
1. **Plan the Feature:** Identify data models and UI requirements
2. **Create Types:** Add TypeScript interfaces in `types/index.ts`
3. **Build Components:** Start with UI components in `components/ui/`
4. **Add Custom Hooks:** Create state management hooks in `hooks/`
5. **Create Pages:** Add pages in `app/` directory
6. **Test Integration:** Verify responsive design and accessibility

### Adding New Components
1. **Check Existing:** Review similar components for patterns
2. **Use shadcn/ui:** Leverage existing UI primitives
3. **Follow Conventions:** Match naming and structure patterns
4. **Add TypeScript:** Include proper type definitions
5. **Implement Responsiveness:** Ensure mobile-first design

### State Management Pattern
1. **Local State First:** Use `useState` for component-specific data
2. **Custom Hooks:** Extract reusable state logic
3. **Mock Data:** Use realistic mock data during development
4. **Error Handling:** Include loading and error states
5. **Type Safety:** Maintain strict TypeScript compliance

## Code Standards

### Naming Conventions
- **Components:** PascalCase (e.g., `DashboardLayout`, `ProviderCard`)
- **Hooks:** camelCase with `use` prefix (e.g., `useProviders`, `useMobile`)
- **Files:** kebab-case for components, camelCase for utilities
- **Variables:** camelCase for local variables, UPPER_CASE for constants

### File Organization
- **Single Responsibility:** One main component per file
- **Export Pattern:** Default export for main component, named exports for utilities
- **Import Order:** External libraries, internal components, types, utilities
- **Path Aliases:** Use `@/` prefix for absolute imports

### TypeScript Standards
- **Strict Mode:** All TypeScript strict options enabled
- **Interface Definitions:** Prefer interfaces over types for object shapes
- **Optional Properties:** Use `?` for optional fields
- **Generic Types:** Use generics for reusable components
- **Type Guards:** Implement proper type checking

## Key Dependencies

### Core Dependencies
- **next**: ^15.5.2 - React framework with App Router
- **react**: ^19.1.0 - Core React library
- **typescript**: ^5 - Type safety and developer experience

### UI & Styling
- **tailwindcss**: ^4 - Utility-first CSS framework
- **@radix-ui/react-***: Headless UI primitives for accessibility
- **lucide-react**: ^0.542.0 - Beautiful SVG icons
- **class-variance-authority**: ^0.7.1 - Component variant management
- **clsx**: ^2.1.1 - Conditional className utility
- **tailwind-merge**: ^3.3.1 - Tailwind class merging

### Development Tools
- **eslint**: ^9 - Code linting and formatting
- **@tailwindcss/postcss**: ^4 - PostCSS integration
- **tw-animate-css**: ^1.3.8 - Enhanced animations

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build with Turbopack  
npm run build

# Production server
npm start

# Code linting
npm run lint
```

## Best Practices

### Performance
- **Turbopack:** Leverages Next.js's fast bundler for development
- **App Router:** Uses React Server Components for optimal performance
- **Image Optimization:** Next.js automatic image optimization
- **Font Optimization:** Automatic font loading and optimization

### Accessibility
- **Semantic HTML:** Use proper heading hierarchy and landmarks
- **ARIA Labels:** Include descriptive labels for interactive elements
- **Keyboard Navigation:** Ensure all functionality is keyboard accessible
- **Color Contrast:** Maintain proper contrast ratios
- **Focus Management:** Proper focus indicators and management

### Code Quality
- **TypeScript Strict:** No implicit any, strict null checks
- **ESLint Rules:** Consistent code formatting and best practices
- **Component Composition:** Prefer composition over inheritance
- **Pure Functions:** Write side-effect-free utility functions
- **Error Boundaries:** Implement proper error handling strategies

## Auto-Documentation System

This project includes an automated documentation maintenance system that keeps CLAUDE.md up-to-date with architectural changes.

### Pre-commit Hook

A git pre-commit hook (`.git/hooks/pre-commit`) automatically:

1. **Analyzes Staged Changes** - Examines git diff of staged files
2. **Detects Architectural Changes** - Uses pattern matching and Claude Code CLI analysis to identify:
   - New dependencies or package.json changes
   - New components, hooks, or utilities  
   - Changes to project structure or folder organization
   - New TypeScript interfaces or type definitions
   - Configuration changes (Tailwind, Next.js, TypeScript, etc.)
   - New imports from external libraries
   - Changes to global styles or layout components

3. **Smart Filtering** - Skips updates for non-architectural changes like:
   - Bug fixes or logic improvements
   - Styling tweaks or CSS adjustments
   - Code refactoring without structural changes
   - Minor text or content updates
   - Variable renaming or code cleanup

4. **Automatic Updates** - When architectural changes are detected:
   - Uses Claude Code CLI to update relevant CLAUDE.md sections
   - Automatically stages the updated documentation
   - Allows the commit to proceed

### Manual Documentation Update

For manual updates or when the pre-commit hook isn't available:

```bash
# Using npm script
npm run update-docs

# Or directly
./scripts/update-docs.sh
```

The manual update script:
- Analyzes the current project state
- Updates CLAUDE.md based on actual project files
- Provides colored output for status updates
- Requires Claude Code CLI to be installed

### Requirements

- **Claude Code CLI** must be installed and accessible in PATH
- Hook gracefully degrades if CLI is not available
- Both automatic and manual systems include error handling

### How It Works

1. **Change Detection**: Pattern matching identifies potential architectural changes
2. **Claude Analysis**: Uses AI to determine if changes warrant documentation updates
3. **Selective Updates**: Only updates relevant sections of CLAUDE.md
4. **Automatic Staging**: Updated documentation is automatically added to the commit

This system ensures documentation stays current without manual maintenance overhead while being smart enough to avoid unnecessary updates for minor code changes.

---

This documentation is automatically maintained by the pre-commit hook system. When adding new features or making architectural changes, the relevant sections will be updated automatically during the commit process.