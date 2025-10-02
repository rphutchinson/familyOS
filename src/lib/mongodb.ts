import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;
const options = {};

// Create the client - connection will be established on first use
const client = new MongoClient(uri, options);

// Get database instance - MongoDB driver handles connection lazily
export const db = client.db(dbName);

// Export client for better-auth transactions
export { client };

// Export a module-scoped MongoClient promise for other uses
export default client.connect();

export async function getDatabase() {
  await client.connect();
  return client.db(dbName);
}
