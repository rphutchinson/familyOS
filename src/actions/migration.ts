'use server';

import { requireAuth, updateUserFamilyId, getUserFamilyId } from '@/lib/auth-utils';
import { createFamily } from '@/lib/db/families';
import { createFamilyMember } from '@/lib/db/family-members';
import { createProvider } from '@/lib/db/providers';
import { ActionResult } from '@/types/database';
import { FamilyMember, HealthcareProvider } from '@/types';

/**
 * Local storage data structure (what we're migrating from)
 */
interface LocalStorageFamilyData {
  familyMembers: FamilyMember[];
  providers: HealthcareProvider[];
}

/**
 * Check if user needs migration (has no familyId in database)
 */
export async function checkMigrationNeededAction(): Promise<ActionResult<boolean>> {
  try {
    const session = await requireAuth();
    const familyId = await getUserFamilyId(session.user.id);
    return { success: true, data: !familyId };
  } catch (error) {
    console.error('Check migration needed error:', error);
    return { success: false, error: 'Failed to check migration status' };
  }
}

/**
 * Migrate family data from localStorage to MongoDB
 */
export async function migrateFamilyDataAction(
  localStorageData: LocalStorageFamilyData
): Promise<ActionResult<{ familyId: string; memberCount: number; providerCount: number }>> {
  try {
    const session = await requireAuth();

    // Check if user already has a family
    const existingFamilyId = await getUserFamilyId(session.user.id);
    if (existingFamilyId) {
      return { success: false, error: 'User already has a family. Migration not needed.' };
    }

    // Create family
    const familyName = session.user.name ? `${session.user.name}'s Family` : 'My Family';
    const family = await createFamily({
      name: familyName,
      ownerId: session.user.id,
    });

    // Update user's familyId
    await updateUserFamilyId(session.user.id, family.id);

    // Migrate family members
    const memberIdMap = new Map<string, string>(); // old ID -> new ID
    let migratedMemberCount = 0;

    for (const oldMember of localStorageData.familyMembers || []) {
      try {
        const newMember = await createFamilyMember(
          family.id,
          {
            name: oldMember.name,
            relationship: oldMember.relationship,
            color: oldMember.color,
            isDefault: oldMember.isDefault,
            preferences: oldMember.preferences,
            metadata: oldMember.metadata,
            modulePermissions: oldMember.modulePermissions,
            // Link the "Self" member to the user
            userId: oldMember.relationship === 'Self' ? session.user.id : undefined,
          },
          session.user.id
        );

        memberIdMap.set(oldMember.id, newMember.id);
        migratedMemberCount++;
      } catch (error) {
        console.error(`Failed to migrate family member ${oldMember.name}:`, error);
      }
    }

    // Migrate providers
    let migratedProviderCount = 0;

    for (const oldProvider of localStorageData.providers || []) {
      try {
        // Map old family member IDs to new ones
        const newFamilyMemberIds = oldProvider.familyMemberIds
          ?.map((oldId) => memberIdMap.get(oldId))
          .filter((id): id is string => !!id) || [];

        // Skip if no valid family members
        if (newFamilyMemberIds.length === 0) {
          console.warn(`Skipping provider ${oldProvider.providerName} - no valid family members`);
          continue;
        }

        await createProvider(
          family.id,
          {
            providerName: oldProvider.providerName,
            portalUrl: oldProvider.portalUrl,
            specialty: oldProvider.specialty,
            familyMemberIds: newFamilyMemberIds,
            loginUsername: oldProvider.loginUsername,
            notes: oldProvider.notes,
            autoDetected: oldProvider.autoDetected,
            quickAddData: oldProvider.quickAddData,
          },
          session.user.id
        );

        migratedProviderCount++;
      } catch (error) {
        console.error(`Failed to migrate provider ${oldProvider.providerName}:`, error);
      }
    }

    return {
      success: true,
      data: {
        familyId: family.id,
        memberCount: migratedMemberCount,
        providerCount: migratedProviderCount,
      },
    };
  } catch (error) {
    console.error('Migrate family data error:', error);
    return { success: false, error: 'Failed to migrate family data' };
  }
}

/**
 * Create a minimal family for users without localStorage data
 */
export async function createMinimalFamilyAction(): Promise<ActionResult<string>> {
  try {
    const session = await requireAuth();

    // Check if user already has a family
    const existingFamilyId = await getUserFamilyId(session.user.id);
    if (existingFamilyId) {
      return { success: false, error: 'User already has a family' };
    }

    // Create family
    const familyName = session.user.name ? `${session.user.name}'s Family` : 'My Family';
    const family = await createFamily({
      name: familyName,
      ownerId: session.user.id,
    });

    // Update user's familyId
    await updateUserFamilyId(session.user.id, family.id);

    // Create initial "Self" family member
    await createFamilyMember(
      family.id,
      {
        name: session.user.name || 'Me',
        relationship: 'Self',
        color: '#3b82f6',
        isDefault: true,
        userId: session.user.id,
      },
      session.user.id
    );

    return { success: true, data: family.id };
  } catch (error) {
    console.error('Create minimal family error:', error);
    return { success: false, error: 'Failed to create family' };
  }
}
