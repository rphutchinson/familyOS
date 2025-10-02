#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';
import { ObjectId } from 'mongodb';

config({ path: resolve(process.cwd(), '.env.local') });

async function main() {
  const { getDatabase } = await import('../src/lib/mongodb.js');
  const db = await getDatabase();

  // Update the user rphutchinson@gmail.com with the family ID
  const result = await db.collection('user').updateOne(
    { _id: new ObjectId('68dea66898b9a184d5e9259b') },
    { $set: { familyId: '68dea68198b9a184d5e9259e' } }
  );

  console.log('Updated:', result.modifiedCount);

  // Verify
  const user = await db.collection('user').findOne({ _id: new ObjectId('68dea66898b9a184d5e9259b') });
  console.log('User:', user);

  process.exit(0);
}

main();
