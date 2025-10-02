// Database operations for healthcare_providers collection

import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import {
  HealthcareProviderDocument,
  HealthcareProviderData,
  CreateProviderInput,
} from '@/types/database';

/**
 * Get the healthcare_providers collection
 */
async function getProvidersCollection() {
  const database = await getDatabase();
  return database.collection<HealthcareProviderDocument>('healthcare_providers');
}

/**
 * Convert HealthcareProviderDocument to client-safe HealthcareProviderData
 */
export function providerDocumentToData(doc: HealthcareProviderDocument): HealthcareProviderData {
  return {
    id: doc._id.toString(),
    familyId: doc.familyId.toString(),
    providerName: doc.providerName,
    portalUrl: doc.portalUrl,
    specialty: doc.specialty,
    familyMemberIds: doc.familyMemberIds.map((id) => id.toString()),
    loginUsername: doc.loginUsername,
    notes: doc.notes,
    lastUsed: doc.lastUsed?.toISOString(),
    autoDetected: doc.autoDetected,
    quickAddData: doc.quickAddData,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    createdBy: doc.createdBy,
  };
}

/**
 * Create a new healthcare provider
 */
export async function createProvider(
  familyId: string,
  input: CreateProviderInput,
  createdBy: string
): Promise<HealthcareProviderData> {
  const collection = await getProvidersCollection();

  const now = new Date();

  const providerDoc: Omit<HealthcareProviderDocument, '_id'> = {
    familyId: new ObjectId(familyId),
    providerName: input.providerName,
    portalUrl: input.portalUrl,
    specialty: input.specialty,
    familyMemberIds: input.familyMemberIds.map((id) => new ObjectId(id)),
    loginUsername: input.loginUsername,
    notes: input.notes,
    autoDetected: input.autoDetected,
    quickAddData: input.quickAddData,
    createdAt: now,
    updatedAt: now,
    createdBy,
  };

  const result = await collection.insertOne(providerDoc as HealthcareProviderDocument);

  const createdProvider = await collection.findOne({ _id: result.insertedId });
  if (!createdProvider) {
    throw new Error('Failed to create provider');
  }

  return providerDocumentToData(createdProvider);
}

/**
 * Get all providers for a family
 */
export async function getProviders(familyId: string): Promise<HealthcareProviderData[]> {
  const collection = await getProvidersCollection();

  const providers = await collection
    .find({ familyId: new ObjectId(familyId) })
    .sort({ providerName: 1 })
    .toArray();

  return providers.map(providerDocumentToData);
}

/**
 * Get provider by ID
 */
export async function getProviderById(providerId: string): Promise<HealthcareProviderData | null> {
  const collection = await getProvidersCollection();
  const provider = await collection.findOne({ _id: new ObjectId(providerId) });

  if (!provider) return null;
  return providerDocumentToData(provider);
}

/**
 * Get providers for a specific family member
 */
export async function getProvidersByFamilyMember(
  familyId: string,
  familyMemberId: string
): Promise<HealthcareProviderData[]> {
  const collection = await getProvidersCollection();

  const providers = await collection
    .find({
      familyId: new ObjectId(familyId),
      familyMemberIds: new ObjectId(familyMemberId),
    })
    .sort({ providerName: 1 })
    .toArray();

  return providers.map(providerDocumentToData);
}

/**
 * Update provider
 */
export async function updateProvider(
  providerId: string,
  updates: Partial<Omit<HealthcareProviderDocument, '_id' | 'familyId' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  const collection = await getProvidersCollection();

  // Convert familyMemberIds strings to ObjectIds if present
  const processedUpdates = { ...updates };
  if (updates.familyMemberIds) {
    processedUpdates.familyMemberIds = updates.familyMemberIds.map(
      (id) => new ObjectId(id as unknown as string)
    );
  }

  await collection.updateOne(
    { _id: new ObjectId(providerId) },
    {
      $set: {
        ...processedUpdates,
        updatedAt: new Date(),
      },
    }
  );
}

/**
 * Delete provider
 */
export async function deleteProvider(providerId: string): Promise<void> {
  const collection = await getProvidersCollection();
  await collection.deleteOne({ _id: new ObjectId(providerId) });
}

/**
 * Mark provider as used (updates lastUsed timestamp)
 */
export async function markProviderUsed(providerId: string): Promise<void> {
  const collection = await getProvidersCollection();

  await collection.updateOne(
    { _id: new ObjectId(providerId) },
    {
      $set: {
        lastUsed: new Date(),
        updatedAt: new Date(),
      },
    }
  );
}

/**
 * Delete all providers for a family
 */
export async function deleteProviders(familyId: string): Promise<void> {
  const collection = await getProvidersCollection();
  await collection.deleteMany({ familyId: new ObjectId(familyId) });
}

/**
 * Get recently used providers for a family
 */
export async function getRecentProviders(
  familyId: string,
  limit: number = 5
): Promise<HealthcareProviderData[]> {
  const collection = await getProvidersCollection();

  const providers = await collection
    .find({
      familyId: new ObjectId(familyId),
      lastUsed: { $exists: true },
    })
    .sort({ lastUsed: -1 })
    .limit(limit)
    .toArray();

  return providers.map(providerDocumentToData);
}
