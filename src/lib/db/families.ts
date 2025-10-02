// Database operations for families collection

import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { FamilyDocument, Family, CreateFamilyInput } from '@/types/database';

/**
 * Get the families collection
 */
async function getFamiliesCollection() {
  const database = await getDatabase();
  return database.collection<FamilyDocument>('families');
}

/**
 * Convert FamilyDocument to client-safe Family
 */
export function familyDocumentToFamily(doc: FamilyDocument): Family {
  return {
    id: doc._id.toString(),
    name: doc.name,
    inviteCode: doc.inviteCode,
    ownerId: doc.ownerId,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    settings: doc.settings,
  };
}

/**
 * Generate a unique 8-character invite code
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
  let code = '';
  const crypto = require('crypto');
  const bytes = crypto.randomBytes(8);

  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }

  return code;
}

/**
 * Create a new family
 */
export async function createFamily(input: CreateFamilyInput): Promise<Family> {
  const collection = await getFamiliesCollection();

  const inviteCode = generateInviteCode();
  const now = new Date();

  const familyDoc: Omit<FamilyDocument, '_id'> = {
    name: input.name,
    inviteCode,
    ownerId: input.ownerId,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(familyDoc as FamilyDocument);

  const createdFamily = await collection.findOne({ _id: result.insertedId });
  if (!createdFamily) {
    throw new Error('Failed to create family');
  }

  return familyDocumentToFamily(createdFamily);
}

/**
 * Get family by ID
 */
export async function getFamilyById(familyId: string): Promise<Family | null> {
  const collection = await getFamiliesCollection();
  const family = await collection.findOne({ _id: new ObjectId(familyId) });

  if (!family) return null;
  return familyDocumentToFamily(family);
}

/**
 * Get family by owner ID
 */
export async function getFamilyByOwnerId(ownerId: string): Promise<Family | null> {
  const collection = await getFamiliesCollection();
  const family = await collection.findOne({ ownerId });

  if (!family) return null;
  return familyDocumentToFamily(family);
}

/**
 * Find family by invite code
 */
export async function findFamilyByInviteCode(inviteCode: string): Promise<Family | null> {
  const collection = await getFamiliesCollection();
  const family = await collection.findOne({ inviteCode: inviteCode.toUpperCase() });

  if (!family) return null;
  return familyDocumentToFamily(family);
}

/**
 * Update family
 */
export async function updateFamily(
  familyId: string,
  updates: Partial<Omit<FamilyDocument, '_id' | 'createdAt'>>
): Promise<void> {
  const collection = await getFamiliesCollection();

  await collection.updateOne(
    { _id: new ObjectId(familyId) },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    }
  );
}

/**
 * Regenerate invite code
 */
export async function regenerateInviteCode(familyId: string): Promise<string> {
  const collection = await getFamiliesCollection();
  const newCode = generateInviteCode();

  await collection.updateOne(
    { _id: new ObjectId(familyId) },
    {
      $set: {
        inviteCode: newCode,
        updatedAt: new Date(),
      },
    }
  );

  return newCode;
}

/**
 * Delete family (use with caution)
 */
export async function deleteFamily(familyId: string): Promise<void> {
  const collection = await getFamiliesCollection();
  await collection.deleteOne({ _id: new ObjectId(familyId) });
}

/**
 * Check if user is family owner
 */
export async function isUserFamilyOwner(familyId: string, userId: string): Promise<boolean> {
  const collection = await getFamiliesCollection();
  const family = await collection.findOne({
    _id: new ObjectId(familyId),
    ownerId: userId,
  });

  return !!family;
}
