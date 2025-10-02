'use server';

import { revalidatePath } from 'next/cache';
import { requireAuthWithFamily } from '@/lib/auth-utils';
import {
  createProvider,
  getProviders,
  getProviderById,
  getProvidersByFamilyMember,
  updateProvider,
  deleteProvider,
  markProviderUsed,
  getRecentProviders,
} from '@/lib/db/providers';
import { getFamilyMembers } from '@/lib/db/family-members';
import { ActionResult, HealthcareProviderData, CreateProviderInput } from '@/types/database';
import { FamilyGroup, createProviderWithName } from '@/types';

/**
 * Get all providers for the family
 */
export async function getProvidersAction(): Promise<ActionResult<HealthcareProviderData[]>> {
  try {
    const { familyId } = await requireAuthWithFamily();
    const providers = await getProviders(familyId);
    return { success: true, data: providers };
  } catch (error) {
    console.error('Get providers error:', error);
    return { success: false, error: 'Failed to get providers' };
  }
}

/**
 * Get providers grouped by family member
 */
export async function groupProvidersByFamilyAction(): Promise<ActionResult<FamilyGroup[]>> {
  try {
    const { familyId } = await requireAuthWithFamily();

    const [members, providers] = await Promise.all([
      getFamilyMembers(familyId),
      getProviders(familyId),
    ]);

    // Convert to FamilyMember type (compatible with existing type)
    const familyGroups: FamilyGroup[] = members.map((member) => ({
      familyMember: {
        id: member.id,
        name: member.name,
        relationship: member.relationship,
        color: member.color,
        isDefault: member.isDefault,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        preferences: member.preferences,
        metadata: member.metadata,
        modulePermissions: member.modulePermissions,
      },
      providers: providers
        .filter((provider) => provider.familyMemberIds.includes(member.id))
        .map((provider) =>
          createProviderWithName({
            id: provider.id,
            providerName: provider.providerName,
            portalUrl: provider.portalUrl,
            specialty: provider.specialty,
            familyMemberIds: provider.familyMemberIds,
            loginUsername: provider.loginUsername,
            notes: provider.notes,
            lastUsed: provider.lastUsed,
            autoDetected: provider.autoDetected,
            quickAddData: provider.quickAddData,
            createdAt: provider.createdAt,
            updatedAt: provider.updatedAt,
            createdBy: provider.createdBy,
          })
        ),
    }));

    return { success: true, data: familyGroups };
  } catch (error) {
    console.error('Group providers by family error:', error);
    return { success: false, error: 'Failed to group providers' };
  }
}

/**
 * Create a new provider
 */
export async function createProviderAction(
  input: CreateProviderInput
): Promise<ActionResult<HealthcareProviderData>> {
  try {
    const { session, familyId } = await requireAuthWithFamily();

    // Validation
    if (!input.providerName || input.providerName.trim().length === 0) {
      return { success: false, error: 'Provider name is required' };
    }

    if (!input.portalUrl || input.portalUrl.trim().length === 0) {
      return { success: false, error: 'Portal URL is required' };
    }

    if (!input.specialty) {
      return { success: false, error: 'Specialty is required' };
    }

    if (!input.familyMemberIds || input.familyMemberIds.length === 0) {
      return { success: false, error: 'At least one family member is required' };
    }

    const provider = await createProvider(familyId, input, session.user.id);

    revalidatePath('/healthcare');
    return { success: true, data: provider };
  } catch (error) {
    console.error('Create provider error:', error);
    return { success: false, error: 'Failed to create provider' };
  }
}

/**
 * Update a provider
 */
export async function updateProviderAction(
  providerId: string,
  updates: Partial<CreateProviderInput>
): Promise<ActionResult<void>> {
  try {
    const { familyId } = await requireAuthWithFamily();

    // Verify the provider belongs to this family
    const provider = await getProviderById(providerId);
    if (!provider || provider.familyId !== familyId) {
      return { success: false, error: 'Provider not found' };
    }

    // Validation
    if (updates.providerName !== undefined && updates.providerName.trim().length === 0) {
      return { success: false, error: 'Provider name cannot be empty' };
    }

    if (updates.portalUrl !== undefined && updates.portalUrl.trim().length === 0) {
      return { success: false, error: 'Portal URL cannot be empty' };
    }

    if (updates.familyMemberIds !== undefined && updates.familyMemberIds.length === 0) {
      return { success: false, error: 'At least one family member is required' };
    }

    await updateProvider(providerId, updates);

    revalidatePath('/healthcare');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Update provider error:', error);
    return { success: false, error: 'Failed to update provider' };
  }
}

/**
 * Delete a provider
 */
export async function deleteProviderAction(providerId: string): Promise<ActionResult<void>> {
  try {
    const { familyId } = await requireAuthWithFamily();

    // Verify the provider belongs to this family
    const provider = await getProviderById(providerId);
    if (!provider || provider.familyId !== familyId) {
      return { success: false, error: 'Provider not found' };
    }

    await deleteProvider(providerId);

    revalidatePath('/healthcare');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Delete provider error:', error);
    return { success: false, error: 'Failed to delete provider' };
  }
}

/**
 * Mark provider as used (updates lastUsed timestamp)
 */
export async function markProviderUsedAction(providerId: string): Promise<ActionResult<void>> {
  try {
    const { familyId } = await requireAuthWithFamily();

    // Verify the provider belongs to this family
    const provider = await getProviderById(providerId);
    if (!provider || provider.familyId !== familyId) {
      return { success: false, error: 'Provider not found' };
    }

    await markProviderUsed(providerId);

    revalidatePath('/healthcare');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Mark provider used error:', error);
    return { success: false, error: 'Failed to mark provider as used' };
  }
}

/**
 * Get recently used providers
 */
export async function getRecentProvidersAction(
  limit: number = 5
): Promise<ActionResult<HealthcareProviderData[]>> {
  try {
    const { familyId } = await requireAuthWithFamily();
    const providers = await getRecentProviders(familyId, limit);
    return { success: true, data: providers };
  } catch (error) {
    console.error('Get recent providers error:', error);
    return { success: false, error: 'Failed to get recent providers' };
  }
}
