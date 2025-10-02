// Database operations for family_members collection

import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import {
  FamilyMemberDocument,
  FamilyMemberData,
  CreateFamilyMemberInput,
} from '@/types/database';

/**
 * Get the family_members collection
 */
async function getFamilyMembersCollection() {
  const database = await getDatabase();
  return database.collection<FamilyMemberDocument>('family_members');
}

/**
 * Convert FamilyMemberDocument to client-safe FamilyMemberData
 */
export function familyMemberDocumentToData(doc: FamilyMemberDocument): FamilyMemberData {
  return {
    id: doc._id.toString(),
    familyId: doc.familyId.toString(),
    userId: doc.userId,
    name: doc.name,
    relationship: doc.relationship,
    color: doc.color,
    isDefault: doc.isDefault,
    preferences: doc.preferences,
    metadata: doc.metadata,
    modulePermissions: doc.modulePermissions,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    createdBy: doc.createdBy,
  };
}

/**
 * Create a new family member
 */
export async function createFamilyMember(
  familyId: string,
  input: CreateFamilyMemberInput,
  createdBy: string
): Promise<FamilyMemberData> {
  const collection = await getFamilyMembersCollection();

  const now = new Date();

  const memberDoc: Omit<FamilyMemberDocument, '_id'> = {
    familyId: new ObjectId(familyId),
    userId: input.userId,
    name: input.name,
    relationship: input.relationship,
    color: input.color,
    isDefault: input.isDefault ?? false,
    preferences: input.preferences,
    metadata: input.metadata,
    modulePermissions: input.modulePermissions,
    createdAt: now,
    updatedAt: now,
    createdBy,
  };

  const result = await collection.insertOne(memberDoc as FamilyMemberDocument);

  const createdMember = await collection.findOne({ _id: result.insertedId });
  if (!createdMember) {
    throw new Error('Failed to create family member');
  }

  return familyMemberDocumentToData(createdMember);
}

/**
 * Get all family members for a family
 */
export async function getFamilyMembers(familyId: string): Promise<FamilyMemberData[]> {
  const collection = await getFamilyMembersCollection();

  const members = await collection
    .find({ familyId: new ObjectId(familyId) })
    .sort({ createdAt: 1 })
    .toArray();

  return members.map(familyMemberDocumentToData);
}

/**
 * Get family member by ID
 */
export async function getFamilyMemberById(memberId: string): Promise<FamilyMemberData | null> {
  const collection = await getFamilyMembersCollection();
  const member = await collection.findOne({ _id: new ObjectId(memberId) });

  if (!member) return null;
  return familyMemberDocumentToData(member);
}

/**
 * Get family member by user ID
 */
export async function getFamilyMemberByUserId(
  familyId: string,
  userId: string
): Promise<FamilyMemberData | null> {
  const collection = await getFamilyMembersCollection();
  const member = await collection.findOne({
    familyId: new ObjectId(familyId),
    userId,
  });

  if (!member) return null;
  return familyMemberDocumentToData(member);
}

/**
 * Update family member
 */
export async function updateFamilyMember(
  memberId: string,
  updates: Partial<Omit<FamilyMemberDocument, '_id' | 'familyId' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  const collection = await getFamilyMembersCollection();

  await collection.updateOne(
    { _id: new ObjectId(memberId) },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    }
  );
}

/**
 * Delete family member
 */
export async function deleteFamilyMember(memberId: string): Promise<void> {
  const collection = await getFamilyMembersCollection();
  await collection.deleteOne({ _id: new ObjectId(memberId) });
}

/**
 * Set default family member (unsets others)
 */
export async function setDefaultFamilyMember(
  familyId: string,
  memberId: string,
  userId: string
): Promise<void> {
  const collection = await getFamilyMembersCollection();

  // Unset all defaults for this user in this family
  await collection.updateMany(
    {
      familyId: new ObjectId(familyId),
      userId,
    },
    {
      $set: {
        isDefault: false,
        updatedAt: new Date(),
      },
    }
  );

  // Set the specified member as default
  await collection.updateOne(
    { _id: new ObjectId(memberId) },
    {
      $set: {
        isDefault: true,
        updatedAt: new Date(),
      },
    }
  );
}

/**
 * Get default family member for a user
 */
export async function getDefaultFamilyMember(
  familyId: string,
  userId: string
): Promise<FamilyMemberData | null> {
  const collection = await getFamilyMembersCollection();

  // Try to find the default member
  let member = await collection.findOne({
    familyId: new ObjectId(familyId),
    userId,
    isDefault: true,
  });

  // If no default, return the first member linked to this user
  if (!member) {
    member = await collection.findOne({
      familyId: new ObjectId(familyId),
      userId,
    });
  }

  if (!member) return null;
  return familyMemberDocumentToData(member);
}

/**
 * Delete all family members for a family
 */
export async function deleteFamilyMembers(familyId: string): Promise<void> {
  const collection = await getFamilyMembersCollection();
  await collection.deleteMany({ familyId: new ObjectId(familyId) });
}

/**
 * Get available color for new family member
 */
export async function getAvailableColor(familyId: string): Promise<string> {
  const colors = [
    '#3b82f6',
    '#ef4444',
    '#22c55e',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
    '#f97316',
    '#6366f1',
  ];

  const collection = await getFamilyMembersCollection();
  const members = await collection
    .find({ familyId: new ObjectId(familyId) })
    .toArray();

  const usedColors = members.map((m) => m.color);
  const availableColors = colors.filter((color) => !usedColors.includes(color));

  return availableColors[0] || colors[0];
}
