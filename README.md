# FamilyOS

A privacy-first family organization platform built on a modular architecture. Starting with healthcare portal management as the core module, FamilyOS provides an extensible framework for managing all aspects of family organization with 100% local storage.

## Overview

**FamilyOS** is a comprehensive family organization platform that serves as an intelligent family coordination system. Built on a sophisticated modular foundation, it grows with your family's needs through additional modules while maintaining strict privacy-first principles.

## Features

### Healthcare Module (v1.0.0) ✅
- 🏥 **Provider Portal Management** - Organize and access healthcare provider portals
- 👨‍👩‍👧‍👦 **Family Association** - Associate providers with one or more family members
- 🚀 **Quick Portal Access** - One-click access to patient portals with usage tracking
- 🔍 **Intelligent Detection** - Automatic healthcare portal recognition from URLs
- 📊 **Usage Tracking** - Track portal access patterns locally

### Core Platform Capabilities
- 🔐 **Privacy-First** - 100% local storage, no external services or data transmission
- 🧩 **Modular Architecture** - Dynamic module loading with consistent interfaces
- 👥 **Family-Centric** - Rich family profiles with cross-module preferences
- 🎨 **Modern UI** - Clean, responsive design with shadcn/ui components
- 📱 **Mobile Responsive** - Optimized for all device sizes
- 🎨 **Color-Coded Organization** - Unique colors for visual family member identification
- 🔄 **Automatic Migration** - Seamless data structure updates as platform evolves

### Family Management
- **Rich Profiles**: Healthcare, UI, and notification preferences per family member
- **Cross-Module Metadata**: Extensible data storage for current and future modules
- **Relationship Management**: Comprehensive family relationship support
- **Default Member Protection**: Primary family member cannot be deleted
- **Preference Inheritance**: Module preferences that can be inherited or customized

### Future Modules (Roadmap)
- 📝 **Todo Lists & Task Management**: Family task coordination with assignments
- 🍽️ **Meal Planning & Grocery Lists**: Weekly planning with automated shopping lists
- 📅 **Family Calendar**: Unified calendar with shared and personal events
- 📺 **Streaming Service Management**: Track and organize family entertainment subscriptions
- 💰 **Budget & Expense Tracking**: Family financial coordination

## Platform Architecture

### Modular Foundation
FamilyOS is built on a sophisticated module system that enables:
- **Dynamic Module Loading**: Add or remove family organization features as needed
- **Consistent Interface**: All modules follow standard patterns for seamless integration
- **Cross-Module Data Sharing**: Family data and preferences work across all modules
- **Independent Development**: Modules can be developed and updated independently

### Dashboard Experience
- **Module-Aware Navigation**: Dynamic navigation based on enabled modules
- **Family Filtering**: Consistent family member filtering across all modules
- **Quick Actions**: Standardized quick action patterns
- **Responsive Design**: Mobile-first approach optimized for all screen sizes

### Healthcare Module Experience
- **Provider Cards**: Clean display of provider information with family associations
- **Portal Quick Access**: One-click access to patient portals
- **Family Organization**: Providers grouped by family member or shown in unified view
- **Quick Add System**: Intelligent healthcare portal detection and addition from URLs

## Tech Stack

- **Framework:** Next.js 15.5.2 with App Router and Turbopack
- **Language:** TypeScript with strict mode
- **Styling:** Tailwind CSS v4 with CSS variables
- **UI Components:** shadcn/ui (New York style)
- **State Management:** Zustand with localStorage persistence
- **Icons:** Lucide React
- **Fonts:** Geist Sans & Geist Mono

## Getting Started

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Build

```bash
npm run build
npm start
```

### Linting & Type Checking

```bash
npm run lint
npx tsc --noEmit
```

## Privacy & Security

### Privacy-First Architecture
- **Local-Only Storage**: All family data remains on the user's device in browser localStorage
- **No Account System**: No registration, login, or external authentication required
- **Zero Data Transmission**: No data sent to external servers or third-party services
- **Transparent Storage**: Users can inspect all data in browser developer tools
- **No Analytics**: No external analytics or tracking services

### Data Protection
- **Family Information**: Names, relationships, preferences, and module-specific data
- **Healthcare Data**: Only provider contact information and portal URLs (no actual medical records)
- **No Medical Records**: Does not store actual medical data or private health information
- **Usage Analytics**: Only local usage tracking for portal access patterns

## Platform Vision

### Current State
FamilyOS provides a comprehensive healthcare portal organization system built on a modular foundation that's ready for expansion. The platform demonstrates the core architectural patterns with the healthcare module while maintaining strict privacy standards.

### Growth Potential
- **Module Ecosystem**: Easy addition of new family organization features following established patterns
- **Cross-Module Intelligence**: Data and preferences that work seamlessly across all modules
- **Scalable Architecture**: Foundation that grows with family needs without complexity overhead
- **Future-Proof Design**: Extensible patterns for long-term platform evolution

### Module Development
The platform includes a sophisticated module development framework:
- **Base Module Class**: Abstract base class for consistent module development
- **Standard Interfaces**: Defined patterns for routes, components, and data structures
- **Helper Utilities**: Shared utilities for logging, data access, and common operations
- **Type Safety**: Full TypeScript support throughout module development

## Documentation

- **Technical Documentation**: See [CLAUDE.md](CLAUDE.md) for technical specifications and AI assistant guidelines
- **Component Documentation**: Component-level docs in source code comments
- **Architecture Decisions**: Documented in code and commit history

## Contributing

This is currently a personal project. If you're interested in the architecture or have suggestions, feel free to open an issue for discussion.

## License

[License information to be added]

---


