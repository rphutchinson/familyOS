#!/usr/bin/env tsx
/**
 * Initialize MongoDB database for FamilyOS
 * Run with: npm run db:init
 */

import { config } from 'dotenv';
import { resolve } from 'path';

async function main() {
  // Load environment variables from .env.local FIRST
  config({ path: resolve(process.cwd(), '.env.local') });

  console.log('🚀 Initializing FamilyOS database...\n');

  // Verify environment variables are loaded
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    console.error('   Please create .env.local with your MongoDB connection string');
    process.exit(1);
  }

  console.log('✓ Environment variables loaded');
  console.log(`✓ Database: ${process.env.MONGODB_DB_NAME || 'default'}\n`);

  try {
    // Dynamic import to ensure env vars are loaded first
    const { initializeIndexes } = await import('../src/lib/db/init-indexes.js');
    await initializeIndexes();
    console.log('\n✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  }
}

main();
