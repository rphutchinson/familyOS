#!/usr/bin/env tsx
/**
 * Check user schema
 */

import { config } from 'dotenv';
import { resolve } from 'path';

async function main() {
  config({ path: resolve(process.cwd(), '.env.local') });

  const { getDatabase } = await import('../src/lib/mongodb.js');
  const db = await getDatabase();

  const users = await db.collection('user').find({}).toArray();
  console.log('User documents:');
  console.log(JSON.stringify(users, null, 2));

  process.exit(0);
}

main();
