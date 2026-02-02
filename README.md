# FamilyOS

A privacy-first family organization platform built with Next.js, MongoDB, and Better Auth. Starting with healthcare portal management as the core module, FamilyOS provides an extensible framework for managing all aspects of family organization.

## Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or remote)

### Installation & Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd familyOS
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your values:
   ```bash
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   MONGODB_DB_NAME=familyos

   # Authentication
   BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
   ```

3. **Start MongoDB (optional - using Docker):**
   ```bash
   docker-compose up -d
   ```

   This starts:
   - MongoDB on `localhost:27017`
   - Mongo Express (web UI) on `localhost:8081`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Other Commands

```bash
npm run build        # Production build
npm start           # Production server
npm run lint        # ESLint
npx tsc --noEmit    # Type checking
```

## Features

### Healthcare Module (v1.0.0)
- Provider portal management and organization
- Family member association with providers
- One-click portal access with usage tracking
- Automatic healthcare portal detection from URLs

### Core Platform
- Multi-user authentication with Better Auth
- Family-based data isolation
- Modular route-based architecture
- Server-first data pattern with MongoDB
- Modern UI with shadcn/ui components

### Planned Modules
- Todo Lists & Task Management
- Meal Planning & Grocery Lists
- Family Calendar
- Streaming Service Management
- Budget & Expense Tracking

## Architecture

FamilyOS follows a privacy-first, server-side architecture:

- **Authentication**: Better Auth with MongoDB persistence
- **Data Storage**: MongoDB with family-based isolation
- **Data Pattern**: Server Actions + Server Components (Next.js 15 App Router)
- **Authorization**: All queries scoped to authenticated user's family
- **Privacy**: No external analytics or tracking services

For detailed technical documentation, see:
- **[CLAUDE.md](CLAUDE.md)** - Development patterns and AI assistant guidelines
- **[Constitution](.specify/memory/constitution.md)** - Core principles and governance

## Tech Stack

- Next.js 15.5.2 with App Router and Turbopack
- TypeScript (strict mode)
- MongoDB with Better Auth
- Tailwind CSS v4
- shadcn/ui (New York style)
- Zustand (legacy, being phased out)

## Project Structure

```
src/
├── app/
│   ├── (protected)/     # Protected routes (requires auth)
│   │   ├── healthcare/  # Healthcare module
│   │   ├── family/      # Family management
│   │   └── onboarding/  # First-time setup
│   ├── auth/           # Sign in/up pages
│   └── api/            # Better Auth API routes
├── actions/            # Server Actions (data mutations)
├── lib/
│   ├── db/            # Database utilities
│   └── auth.ts        # Better Auth configuration
├── components/
│   └── ui/            # shadcn/ui components
└── types/
    └── database.ts    # Database schemas
```

## Contributing

This is currently a personal project. For development guidelines and patterns, see [CLAUDE.md](CLAUDE.md).

## License

[License information to be added]
