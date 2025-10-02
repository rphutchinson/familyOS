// Initialize MongoDB indexes for FamilyOS collections

import { getDatabase } from '@/lib/mongodb';

/**
 * Create all required indexes for FamilyOS collections
 */
export async function initializeIndexes() {
  const db = await getDatabase();

  try {
    // Families collection indexes
    await db.collection('families').createIndexes([
      {
        key: { inviteCode: 1 },
        unique: true,
        name: 'inviteCode_unique',
      },
      {
        key: { ownerId: 1 },
        name: 'ownerId_index',
      },
    ]);

    console.log('✓ Families indexes created');

    // Family members collection indexes
    await db.collection('family_members').createIndexes([
      {
        key: { familyId: 1 },
        name: 'familyId_index',
      },
      {
        key: { userId: 1 },
        sparse: true, // Only index documents where userId exists
        name: 'userId_sparse_index',
      },
      {
        key: { familyId: 1, userId: 1 },
        unique: true,
        sparse: true, // Only enforce uniqueness where userId exists
        name: 'familyId_userId_unique',
      },
      {
        key: { createdAt: 1 },
        name: 'createdAt_index',
      },
    ]);

    console.log('✓ Family members indexes created');

    // Healthcare providers collection indexes
    await db.collection('healthcare_providers').createIndexes([
      {
        key: { familyId: 1 },
        name: 'familyId_index',
      },
      {
        key: { familyMemberIds: 1 },
        name: 'familyMemberIds_multikey_index',
      },
      {
        key: { lastUsed: -1 },
        name: 'lastUsed_desc_index',
      },
    ]);

    console.log('✓ Healthcare providers indexes created');

    // User collection index (for Better Auth users table)
    // Better Auth manages its own indexes, but we add familyId
    await db.collection('user').createIndex(
      { familyId: 1 },
      {
        sparse: true,
        name: 'familyId_sparse_index',
      }
    );

    console.log('✓ User familyId index created');

    console.log('✅ All indexes initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing indexes:', error);
    throw error;
  }
}

/**
 * Drop all FamilyOS indexes (for development/testing)
 */
export async function dropIndexes() {
  const db = await getDatabase();

  try {
    await db.collection('families').dropIndexes();
    await db.collection('family_members').dropIndexes();
    await db.collection('healthcare_providers').dropIndexes();

    console.log('✅ All indexes dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping indexes:', error);
    throw error;
  }
}
