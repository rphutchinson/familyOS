# MongoDB Family Management Migration Guide

This guide explains the new MongoDB-based family management system and how to complete the migration.

## ✅ What's Been Implemented

### Core Database Layer
- **MongoDB Collections**: `families`, `family_members`, `healthcare_providers`
- **Database Utilities**: Complete CRUD operations for all collections
- **Indexes**: Optimized indexes for performance and data integrity
- **Types**: Full TypeScript type definitions for all MongoDB documents

### Authentication & Authorization
- **Better Auth Integration**: Extended user schema with `familyId`
- **Auth Helpers**: `requireAuthWithFamily()` for protected routes
- **Family Isolation**: All queries automatically filtered by family

### Server Actions (Type-Safe Data Layer)
- **Family Actions**: Create, update, join, invite code management
- **Family Member Actions**: CRUD operations, default member management
- **Provider Actions**: Healthcare provider management with family isolation
- **Migration Actions**: Automatic data migration from localStorage

### User Experience
- **Onboarding Flow**: New users can create or join families
- **Migration UI**: Automatic detection and migration of localStorage data
- **Family Settings**: Manage family name, invite codes, members
- **Family Page**: View and manage family members (updated to use MongoDB)

## 🔄 Remaining Work

### Components to Refactor

1. **Add Family Member Form** (`src/app/(protected)/family/components/add-family-member-form.tsx`)
   - Update to use `createFamilyMemberAction` instead of Zustand
   - Add router.refresh() after successful creation

2. **Edit Family Member Form** (`src/app/(protected)/family/components/edit-family-member-form.tsx`)
   - Update to use `updateFamilyMemberAction` instead of Zustand
   - Add router.refresh() after successful update

3. **Healthcare Module** (`src/app/(protected)/healthcare/`)
   - Update all components to use Server Actions from `src/actions/providers.ts`
   - Replace Zustand `useFamilyStore` with Server Actions
   - Update provider forms to use new actions

4. **Family Context** (`src/app/family/family-context.tsx`)
   - This may need to be refactored or removed as Server Components handle data fetching

### Optional Enhancements

1. **Install sonner for toasts**: `npm install sonner`
2. **Add loading states**: Use React 18 `useOptimistic` for better UX
3. **Error boundaries**: Add error handling for Server Components
4. **Soft deletes**: Implement recovery for deleted items

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install tsx --save-dev
```

### 2. Initialize Database Indexes

```bash
npx tsx scripts/init-db.ts
```

This creates all necessary indexes for optimal performance.

### 3. Environment Variables

Ensure these are set in your `.env.local`:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=familyos
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
```

### 4. Test the Flow

1. **New User Signup**:
   - Go to `/auth/signup`
   - Create account
   - You'll be redirected to `/onboarding`
   - Choose "Create New Family" or "Join Existing Family"
   - Complete setup

2. **Existing User Migration**:
   - Log in with existing account
   - If localStorage data exists, you'll see migration prompt
   - Click "Migrate Data" to move data to MongoDB
   - All family members and providers will be migrated

3. **Family Management**:
   - Go to `/family` to see your family members
   - Go to `/family/settings` to manage family settings and invite code
   - Add new family members (they won't have user accounts initially)
   - Invite others by sharing the invite code

## 📁 File Structure

```
src/
├── actions/                    # Server Actions (NEW)
│   ├── family.ts              # Family CRUD & invite system
│   ├── family-members.ts      # Family member CRUD
│   ├── providers.ts           # Healthcare provider CRUD
│   └── migration.ts           # LocalStorage → MongoDB migration
│
├── lib/
│   ├── db/                    # Database utilities (NEW)
│   │   ├── families.ts        # Family database operations
│   │   ├── family-members.ts  # Family member operations
│   │   ├── providers.ts       # Provider operations
│   │   └── init-indexes.ts    # Index initialization
│   │
│   ├── auth.ts                # Better Auth config (UPDATED)
│   ├── auth-utils.ts          # Auth helpers (UPDATED)
│   └── stores/                # Zustand stores (TO BE DEPRECATED)
│
├── types/
│   └── database.ts            # MongoDB document types (NEW)
│
└── app/
    ├── (protected)/
    │   ├── onboarding/        # New user setup (NEW)
    │   ├── family/
    │   │   ├── page.tsx       # Family management (UPDATED)
    │   │   ├── family-page-client.tsx  # Client component (NEW)
    │   │   ├── settings/      # Family settings (NEW)
    │   │   └── components/    # Family components (TO BE UPDATED)
    │   └── healthcare/        # Healthcare module (TO BE UPDATED)
    │
    └── auth/                  # Auth pages
```

## 🔍 Key Concepts

### Family Isolation
Every query is automatically scoped to the user's family using `requireAuthWithFamily()`. This ensures:
- Users only see their family's data
- No accidental data leakage between families
- Simplified security model

### User vs Family Member
- **User**: Has a Better Auth account, can log in
- **Family Member**: May or may not have a user account
  - With `userId`: Linked to a user account
  - Without `userId`: Just a family member record (e.g., children without accounts)

### Invite System
- Each family has a unique 8-character invite code
- Anyone with the code can join the family
- Family owners can regenerate codes
- Codes are uppercase for easy sharing

### Migration Strategy
- **New users**: Automatic family creation on signup
- **Existing users**: Prompted to migrate localStorage data
- **Data preservation**: Original localStorage kept as backup for 30 days

## 🐛 Troubleshooting

### "User already has a family" Error
- The user's account is already linked to a family
- Check the user document in MongoDB `user` collection
- Clear `familyId` field if needed for testing

### "Family not found" Error
- The familyId in user document doesn't exist
- Run the onboarding flow again
- Or manually create a family using `createFamilyAction`

### Indexes Not Created
- Run `npx tsx scripts/init-db.ts`
- Check MongoDB Atlas/local instance permissions
- Verify connection string in `.env.local`

### Component Errors After Migration
- Some components still use `useFamilyStore` from Zustand
- Update imports to use Server Actions from `src/actions/*`
- Use `router.refresh()` instead of relying on Zustand reactivity

## 📝 Next Steps for Complete Migration

1. **Refactor Add/Edit Forms**: Update family member forms to use Server Actions
2. **Update Healthcare Module**: Replace all Zustand usage with Server Actions
3. **Remove Zustand Stores**: Once all components are updated, remove localStorage-based stores
4. **Add Toast Notifications**: Install and configure `sonner` for better UX
5. **Test Multi-User Scenarios**: Test with multiple users in same family
6. **Add Loading States**: Use `useOptimistic` for optimistic updates

## 🎯 Testing Checklist

- [ ] New user can create family
- [ ] New user can join family via invite code
- [ ] Existing user can migrate localStorage data
- [ ] Family members can be added/edited/deleted
- [ ] Healthcare providers work with family members
- [ ] Only family owner can update family settings
- [ ] Invite code can be regenerated
- [ ] Multiple users can belong to same family
- [ ] Users cannot delete family members with accounts
- [ ] Default family member can be set

## 💡 Architecture Benefits

1. **Type Safety**: End-to-end types from database to UI
2. **Server-Side Security**: Data validation and authorization on server
3. **Better Performance**: Automatic request deduplication and caching
4. **Scalability**: MongoDB supports millions of families
5. **Real-time Ready**: Easy to add real-time updates with subscriptions
6. **Multi-User**: Multiple users per family with proper isolation

---

**Need Help?** Check the implementation plan in [MIGRATION.md](MIGRATION.md) or review the Server Actions in `src/actions/*`.
