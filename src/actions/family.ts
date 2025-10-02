'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, requireAuthWithFamily, updateUserFamilyId, getUserFamilyId } from '@/lib/auth-utils';
import {
  createFamily,
  getFamilyById,
  findFamilyByInviteCode,
  updateFamily,
  regenerateInviteCode,
  isUserFamilyOwner,
} from '@/lib/db/families';
import { createFamilyMember, getAvailableColor } from '@/lib/db/family-members';
import { ActionResult, Family } from '@/types/database';

/**
 * Create a new family for the current user
 */
export async function createFamilyAction(name: string): Promise<ActionResult<Family>> {
  try {
    const session = await requireAuth();

    // Check if user already has a family
    const existingFamilyId = await getUserFamilyId(session.user.id);
    if (existingFamilyId) {
      return { success: false, error: 'You already belong to a family' };
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: 'Family name is required' };
    }

    // Create family
    const family = await createFamily({
      name: name.trim(),
      ownerId: session.user.id,
    });

    // Update user's familyId
    await updateUserFamilyId(session.user.id, family.id);

    // Create initial family member for the user (Self)
    const color = await getAvailableColor(family.id);
    await createFamilyMember(
      family.id,
      {
        name: session.user.name || 'Me',
        relationship: 'Self',
        color,
        isDefault: true,
        userId: session.user.id,
      },
      session.user.id
    );

    revalidatePath('/');
    return { success: true, data: family };
  } catch (error) {
    console.error('Create family error:', error);
    return { success: false, error: 'Failed to create family' };
  }
}

/**
 * Get current user's family
 */
export async function getFamilyAction(): Promise<ActionResult<Family>> {
  try {
    const { family } = await requireAuthWithFamily();
    return { success: true, data: family };
  } catch (error) {
    console.error('Get family error:', error);
    return { success: false, error: 'Failed to get family' };
  }
}

/**
 * Update family settings
 */
export async function updateFamilyAction(
  updates: Partial<Pick<Family, 'name' | 'settings'>>
): Promise<ActionResult<void>> {
  try {
    const { session, familyId } = await requireAuthWithFamily();

    // Check if user is family owner
    const isOwner = await isUserFamilyOwner(familyId, session.user.id);
    if (!isOwner) {
      return { success: false, error: 'Only the family owner can update family settings' };
    }

    await updateFamily(familyId, updates);

    revalidatePath('/family/settings');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Update family error:', error);
    return { success: false, error: 'Failed to update family' };
  }
}

/**
 * Get current family's invite code
 */
export async function getInviteCodeAction(): Promise<ActionResult<string>> {
  try {
    const { family } = await requireAuthWithFamily();
    return { success: true, data: family.inviteCode };
  } catch (error) {
    console.error('Get invite code error:', error);
    return { success: false, error: 'Failed to get invite code' };
  }
}

/**
 * Regenerate family invite code
 */
export async function regenerateInviteCodeAction(): Promise<ActionResult<string>> {
  try {
    const { session, familyId } = await requireAuthWithFamily();

    // Check if user is family owner
    const isOwner = await isUserFamilyOwner(familyId, session.user.id);
    if (!isOwner) {
      return { success: false, error: 'Only the family owner can regenerate the invite code' };
    }

    const newCode = await regenerateInviteCode(familyId);

    revalidatePath('/family/settings');
    revalidatePath('/family/invite');
    return { success: true, data: newCode };
  } catch (error) {
    console.error('Regenerate invite code error:', error);
    return { success: false, error: 'Failed to regenerate invite code' };
  }
}

/**
 * Join a family using invite code
 */
export async function joinFamilyAction(inviteCode: string): Promise<ActionResult<Family>> {
  try {
    const session = await requireAuth();

    // Check if user already has a family
    const existingFamilyId = await getUserFamilyId(session.user.id);
    if (existingFamilyId) {
      return { success: false, error: 'You already belong to a family. Leave your current family first.' };
    }

    if (!inviteCode || inviteCode.trim().length === 0) {
      return { success: false, error: 'Invite code is required' };
    }

    // Find family by invite code
    const family = await findFamilyByInviteCode(inviteCode.trim());
    if (!family) {
      return { success: false, error: 'Invalid invite code' };
    }

    // Update user's familyId
    await updateUserFamilyId(session.user.id, family.id);

    // Create family member for the user
    const color = await getAvailableColor(family.id);
    await createFamilyMember(
      family.id,
      {
        name: session.user.name || 'New Member',
        relationship: 'Other',
        color,
        isDefault: true,
        userId: session.user.id,
      },
      session.user.id
    );

    revalidatePath('/');
    return { success: true, data: family };
  } catch (error) {
    console.error('Join family error:', error);
    return { success: false, error: 'Failed to join family' };
  }
}

/**
 * Validate invite code (public - no auth required)
 */
export async function validateInviteCodeAction(inviteCode: string): Promise<ActionResult<boolean>> {
  try {
    if (!inviteCode || inviteCode.trim().length === 0) {
      return { success: false, error: 'Invite code is required' };
    }

    const family = await findFamilyByInviteCode(inviteCode.trim());
    return { success: true, data: !!family };
  } catch (error) {
    console.error('Validate invite code error:', error);
    return { success: false, error: 'Failed to validate invite code' };
  }
}
