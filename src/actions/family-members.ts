'use server';

import { revalidatePath } from 'next/cache';
import { requireAuthWithFamily } from '@/lib/auth-utils';
import {
  createFamilyMember,
  getFamilyMembers,
  getFamilyMemberById,
  getFamilyMemberByUserId,
  updateFamilyMember,
  deleteFamilyMember,
  setDefaultFamilyMember,
  getDefaultFamilyMember,
  getAvailableColor,
} from '@/lib/db/family-members';
import { ActionResult, FamilyMemberData, CreateFamilyMemberInput } from '@/types/database';

/**
 * Get all family members
 */
export async function getFamilyMembersAction(): Promise<ActionResult<FamilyMemberData[]>> {
  try {
    const { familyId } = await requireAuthWithFamily();
    const members = await getFamilyMembers(familyId);
    return { success: true, data: members };
  } catch (error) {
    console.error('Get family members error:', error);
    return { success: false, error: 'Failed to get family members' };
  }
}

/**
 * Get current user's family member record
 */
export async function getMyFamilyMemberAction(): Promise<ActionResult<FamilyMemberData | null>> {
  try {
    const { session, familyId } = await requireAuthWithFamily();
    const member = await getFamilyMemberByUserId(familyId, session.user.id);
    return { success: true, data: member };
  } catch (error) {
    console.error('Get my family member error:', error);
    return { success: false, error: 'Failed to get your family member record' };
  }
}

/**
 * Create a new family member
 */
export async function createFamilyMemberAction(
  input: CreateFamilyMemberInput
): Promise<ActionResult<FamilyMemberData>> {
  try {
    const { session, familyId } = await requireAuthWithFamily();

    // Validation
    if (!input.name || input.name.trim().length === 0) {
      return { success: false, error: 'Name is required' };
    }

    if (!input.relationship) {
      return { success: false, error: 'Relationship is required' };
    }

    // Get available color if not provided
    let color = input.color;
    if (!color) {
      color = await getAvailableColor(familyId);
    }

    const member = await createFamilyMember(
      familyId,
      {
        ...input,
        name: input.name.trim(),
        color,
      },
      session.user.id
    );

    revalidatePath('/family');
    revalidatePath('/healthcare');
    return { success: true, data: member };
  } catch (error) {
    console.error('Create family member error:', error);
    return { success: false, error: 'Failed to create family member' };
  }
}

/**
 * Update a family member
 */
export async function updateFamilyMemberAction(
  memberId: string,
  updates: Partial<CreateFamilyMemberInput>
): Promise<ActionResult<void>> {
  try {
    const { familyId } = await requireAuthWithFamily();

    // Verify the member belongs to this family
    const member = await getFamilyMemberById(memberId);
    if (!member || member.familyId !== familyId) {
      return { success: false, error: 'Family member not found' };
    }

    // Validation
    if (updates.name !== undefined && updates.name.trim().length === 0) {
      return { success: false, error: 'Name cannot be empty' };
    }

    await updateFamilyMember(memberId, updates);

    revalidatePath('/family');
    revalidatePath('/healthcare');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Update family member error:', error);
    return { success: false, error: 'Failed to update family member' };
  }
}

/**
 * Delete a family member
 */
export async function deleteFamilyMemberAction(memberId: string): Promise<ActionResult<void>> {
  try {
    const { session, familyId } = await requireAuthWithFamily();

    // Verify the member belongs to this family
    const member = await getFamilyMemberById(memberId);
    if (!member || member.familyId !== familyId) {
      return { success: false, error: 'Family member not found' };
    }

    // Prevent deleting a member linked to a user
    if (member.userId) {
      return {
        success: false,
        error: 'Cannot delete a family member linked to a user account. Ask them to leave the family instead.',
      };
    }

    await deleteFamilyMember(memberId);

    revalidatePath('/family');
    revalidatePath('/healthcare');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Delete family member error:', error);
    return { success: false, error: 'Failed to delete family member' };
  }
}

/**
 * Set default family member for current user
 */
export async function setDefaultFamilyMemberAction(memberId: string): Promise<ActionResult<void>> {
  try {
    const { session, familyId } = await requireAuthWithFamily();

    // Verify the member belongs to this family and is linked to this user
    const member = await getFamilyMemberById(memberId);
    if (!member || member.familyId !== familyId) {
      return { success: false, error: 'Family member not found' };
    }

    if (member.userId !== session.user.id) {
      return { success: false, error: 'You can only set your own family members as default' };
    }

    await setDefaultFamilyMember(familyId, memberId, session.user.id);

    revalidatePath('/family');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Set default family member error:', error);
    return { success: false, error: 'Failed to set default family member' };
  }
}

/**
 * Get default family member for current user
 */
export async function getDefaultFamilyMemberAction(): Promise<ActionResult<FamilyMemberData | null>> {
  try {
    const { session, familyId } = await requireAuthWithFamily();
    const member = await getDefaultFamilyMember(familyId, session.user.id);
    return { success: true, data: member };
  } catch (error) {
    console.error('Get default family member error:', error);
    return { success: false, error: 'Failed to get default family member' };
  }
}

/**
 * Get available color for new family member
 */
export async function getAvailableColorAction(): Promise<ActionResult<string>> {
  try {
    const { familyId } = await requireAuthWithFamily();
    const color = await getAvailableColor(familyId);
    return { success: true, data: color };
  } catch (error) {
    console.error('Get available color error:', error);
    return { success: false, error: 'Failed to get available color' };
  }
}
