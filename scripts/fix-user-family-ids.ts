#!/usr/bin/env tsx
/**
 * Fix user familyId references
 * This script updates all user documents to have the correct familyId based on their family_member records
 * Run with: npm run db:fix-users
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { ObjectId } from 'mongodb';

async function main() {
  // Load environment variables from .env.local FIRST
  config({ path: resolve(process.cwd(), '.env.local') });

  console.log('🔧 Fixing user familyId references...\n');

  // Verify environment variables are loaded
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  try {
    // Dynamic import to ensure env vars are loaded first
    const { getDatabase } = await import('../src/lib/mongodb.js');
    const db = await getDatabase();

    // Get all family members that have a userId
    const familyMembers = await db.collection('family_members').find({
      userId: { $exists: true, $ne: null }
    }).toArray();

    console.log(`Found ${familyMembers.length} family members with user accounts\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const member of familyMembers) {
      const userId = member.userId;

      // Check if familyId exists
      if (!member.familyId) {
        console.log(`⚠️  Family member ${member.name} (${userId}) has no familyId`);
        errorCount++;
        continue;
      }

      const familyId = member.familyId.toString();

      // Check if user exists and needs update
      // Better Auth uses _id as the primary key
      const user = await db.collection('user').findOne({ _id: userId });

      if (!user) {
        console.log(`⚠️  User not found: ${userId}`);
        errorCount++;
        continue;
      }

      // Check if familyId needs update
      const currentFamilyId = user.familyId?.toString();

      if (currentFamilyId === familyId) {
        console.log(`✓ User ${user.email || userId} already has correct familyId`);
        skippedCount++;
        continue;
      }

      // Update user's familyId
      // Better Auth uses _id as the primary key
      await db.collection('user').updateOne(
        { _id: userId },
        { $set: { familyId: familyId } }
      );

      console.log(`✓ Updated user ${user.email || userId} with familyId: ${familyId}`);
      updatedCount++;
    }

    console.log('\n' + '='.repeat(50));
    console.log('Summary:');
    console.log(`  ✓ Updated: ${updatedCount}`);
    console.log(`  - Skipped (already correct): ${skippedCount}`);
    if (errorCount > 0) {
      console.log(`  ⚠️  Errors: ${errorCount}`);
    }
    console.log('='.repeat(50));

    console.log('\n✅ User familyId fix complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  }
}

main();
