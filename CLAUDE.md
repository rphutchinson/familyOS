# FamilyOS - Family Organization Platform - CLAUDE.md

This documentation describes the current state of FamilyOS, a modular family organization platform.

## Current Application Overview

**FamilyOS** is a comprehensive family organization platform built on a modular architecture foundation. Starting with healthcare portal management as the core module, it provides an extensible framework for managing all aspects of family organization while maintaining privacy-first principles.

The platform serves as an intelligent family coordination system that can grow with your family's needs through additional modules.

## Platform Architecture

### Modular Foundation
FamilyOS is built on a sophisticated module system that allows for:
- **Dynamic Module Loading**: Add or remove family organization features as needed
- **Consistent Interface**: All modules follow standard patterns for seamless integration
- **Cross-Module Data Sharing**: Family data and preferences work across all modules
- **Independent Development**: Modules can be developed and updated independently

### Current Modules

#### Healthcare Module (v1.0.0) ✅
- **Provider Portal Management**: Organize and access healthcare provider portals
- **Family Association**: Associate providers with one or more family members
- **Quick Portal Access**: One-click access to patient portals with usage tracking
- **Intelligent Detection**: Automatic healthcare portal recognition from URLs

#### Future Modules (Roadmap)
- **Todo Lists & Task Management**: Family task coordination with assignments
- **Meal Planning & Grocery Lists**: Weekly planning with automated shopping lists
- **Family Calendar**: Unified calendar with shared and personal events
- **Streaming Service Management**: Track and organize family entertainment subscriptions
- **Budget & Expense Tracking**: Family financial coordination

## Enhanced Family System

### Advanced Family Profiles
- **Rich Preferences**: Healthcare, UI, and notification preferences per family member
- **Cross-Module Metadata**: Extensible data storage for future module needs
- **Permission System**: Future fine-grained access control across modules
- **Relationship Management**: Comprehensive family relationship support

### Family Data Features
- **Color-Coded Organization**: Unique colors for visual family member identification
- **Default Member Protection**: Primary family member cannot be deleted
- **Preference Inheritance**: Module preferences that can be inherited or customized
- **Migration Support**: Automatic data migration as the platform evolves

## Technical Architecture

### Core Technology Stack
- **Framework:** Next.js 15.5.2 with App Router and Turbopack
- **Language:** TypeScript with strict mode for complete type safety
- **Styling:** Tailwind CSS v4 with CSS variables
- **UI Components:** shadcn/ui (New York style) with custom module patterns
- **Icons:** Lucide React
- **Fonts:** Geist Sans & Geist Mono

### State Management System
- **Modular State Architecture**: Separate stores for core family data and individual modules
- **Zustand with Persistence**: localStorage persistence with automatic migration
- **Module Registry**: Central system for module discovery and lifecycle management
- **React Context Integration**: Seamless data sharing between modules

### Data Storage & Privacy
- **100% Local Storage**: All data stored locally in browser localStorage
- **No External Dependencies**: Zero external services or data transmission
- **Automatic Migration**: Data structure migrations handled transparently
- **Version Control**: State versioning for future compatibility

## Module System Details

### Module Registry
- **Centralized Management**: Single registry for all family organization modules
- **Lifecycle Control**: Module initialization, cleanup, and state management
- **Dynamic Loading**: Modules can be enabled/disabled at runtime
- **Route & Component Discovery**: Automatic integration of module interfaces

### Cross-Module Integration
- **Family Data Context**: Shared family information available to all modules
- **Consistent Patterns**: Standard interfaces for module development
- **Preference System**: Module-specific preferences integrated with family profiles
- **Navigation Integration**: Unified navigation supporting multiple modules

## Current User Experience

### Dashboard Interface
- **Module-Aware Navigation**: Dynamic navigation based on enabled modules
- **Family Filtering**: Consistent family member filtering across all modules
- **Quick Actions**: Standardized quick action patterns
- **Responsive Design**: Mobile-first approach optimized for all screen sizes

### Healthcare Module Interface
- **Provider Cards**: Clean display of provider information with family associations
- **Portal Quick Access**: One-click access to patient portals
- **Family Organization**: Providers grouped by family member or shown in unified view
- **Quick Add System**: Intelligent healthcare portal detection and addition

### Family Management
- **Enhanced Profiles**: Rich family member profiles with preferences
- **Cross-Module Coordination**: Family data that works across all modules
- **Preference Management**: Module-specific settings per family member
- **Relationship Support**: Comprehensive relationship types and management

## Development & Extension

### Module Development Framework
- **Base Module Class**: Abstract base class for consistent module development
- **Standard Interfaces**: Defined patterns for routes, components, and data
- **Helper Utilities**: Shared utilities for logging, data access, and more
- **Type Safety**: Full TypeScript support for module development

### Component System
- **Shared Components**: Reusable patterns for family member selection, headers, etc.
- **Module-Specific Components**: Healthcare provider cards, forms, and interfaces
- **Design System**: Consistent styling and interaction patterns
- **Future-Ready**: Architecture prepared for additional module types

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

# Type checking
npx tsc --noEmit
```

## Security & Privacy

### Privacy-First Architecture
- **Local-Only Storage**: All family data remains on the user's device
- **No Account System**: No registration, login, or external authentication
- **Zero Data Transmission**: No data sent to external servers
- **Transparent Storage**: Users can inspect all data in browser developer tools

### Data Protection
- **Family Information**: Names, relationships, preferences, and module-specific data
- **Healthcare Data**: Only provider contact information and portal URLs
- **No Medical Records**: Does not store actual medical data or private health information
- **Usage Analytics**: Only local usage tracking for portal access patterns

## Platform Vision

### Current Capabilities
- **Healthcare Portal Organization**: Comprehensive family healthcare coordination
- **Modular Foundation**: Ready for additional family organization modules
- **Privacy-Focused**: Complete local storage with no external dependencies
- **Family-Centric**: Everything organized around family members and their needs

### Growth Potential
- **Module Ecosystem**: Easy addition of new family organization features
- **Cross-Module Intelligence**: Data and preferences that work across all modules
- **Scalable Architecture**: Foundation that grows with family needs
- **Future-Proof Design**: Extensible patterns for long-term platform evolution

## Module Integration Examples

### Healthcare Module Integration
```typescript
// Healthcare module seamlessly integrates with family system
const { familyMembers, currentUser } = useFamilyData();
const healthcarePreferences = currentUser?.preferences?.healthcare;
```

### Future Module Integration
```typescript
// Todo module will integrate using the same patterns
const { familyMembers } = useFamilyData();
const todoPreferences = currentUser?.preferences?.todos;
```

---