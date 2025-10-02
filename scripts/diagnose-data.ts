#!/usr/bin/env tsx
/**
 * Diagnose database state
 * Run with: npm run db:diagnose
 */

import { config } from 'dotenv';
import { resolve } from 'path';

async function main() {
  config({ path: resolve(process.cwd(), '.env.local') });

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found');
    process.exit(1);
  }

  const { getDatabase } = await import('../src/lib/mongodb.js');
  const db = await getDatabase();

  console.log('🔍 Database Diagnostics\n');
  console.log('='.repeat(60));

  // Check users
  const users = await db.collection('user').find({}).toArray();
  console.log(`\n👤 USERS (${users.length}):`);
  for (const user of users) {
    console.log(`  - ${user.email || user.id}`);
    console.log(`    ID: ${user.id}`);
    console.log(`    familyId: ${user.familyId || 'NOT SET ⚠️'}`);
    console.log(`    familyId type: ${typeof user.familyId}`);
  }

  // Check families
  const families = await db.collection('families').find({}).toArray();
  console.log(`\n👨‍👩‍👧‍👦 FAMILIES (${families.length}):`);
  for (const family of families) {
    console.log(`  - ${family.name}`);
    console.log(`    _id: ${family._id}`);
    console.log(`    ownerId: ${family.ownerId}`);
    console.log(`    inviteCode: ${family.inviteCode}`);
  }

  // Check family members
  const members = await db.collection('family_members').find({}).toArray();
  console.log(`\n🧑 FAMILY MEMBERS (${members.length}):`);
  for (const member of members) {
    console.log(`  - ${member.name} (${member.relationship})`);
    console.log(`    _id: ${member._id}`);
    console.log(`    familyId: ${member.familyId || 'NOT SET ⚠️'}`);
    console.log(`    userId: ${member.userId || 'none'}`);
    console.log(`    isDefault: ${member.isDefault}`);
  }

  // Check providers
  const providers = await db.collection('healthcare_providers').find({}).toArray();
  console.log(`\n🏥 PROVIDERS (${providers.length}):`);
  for (const provider of providers) {
    console.log(`  - ${provider.providerName}`);
    console.log(`    familyId: ${provider.familyId}`);
    console.log(`    familyMemberIds: ${provider.familyMemberIds?.length || 0} members`);
  }

  console.log('\n' + '='.repeat(60));

  // Cross-reference check
  console.log('\n🔗 CROSS-REFERENCE CHECKS:\n');

  for (const user of users) {
    const userFamilyId = user.familyId?.toString();
    if (!userFamilyId) {
      console.log(`❌ User ${user.email} has NO familyId`);
      continue;
    }

    const family = families.find(f => f._id.toString() === userFamilyId);
    if (!family) {
      console.log(`❌ User ${user.email} has familyId ${userFamilyId} but family NOT FOUND`);
      continue;
    }

    const userMembers = members.filter(m => m.userId === user.id);
    if (userMembers.length === 0) {
      console.log(`❌ User ${user.email} has NO family_member records`);
      continue;
    }

    const correctMembers = userMembers.filter(m => m.familyId?.toString() === userFamilyId);
    if (correctMembers.length !== userMembers.length) {
      console.log(`⚠️  User ${user.email} has ${userMembers.length - correctMembers.length} members with wrong familyId`);
      continue;
    }

    console.log(`✅ User ${user.email} -> Family "${family.name}" -> ${userMembers.length} member(s)`);
  }

  console.log('\n' + '='.repeat(60));
  process.exit(0);
}

main();
