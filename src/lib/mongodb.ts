import { MongoClient } from "mongodb";

// Support both full MONGODB_URI or individual components
let uri: string;
if (process.env.MONGODB_URI) {
  uri = process.env.MONGODB_URI;
} else if (
  process.env.MONGODB_USERNAME &&
  process.env.MONGODB_PASSWORD &&
  process.env.MONGODB_DATABASE
) {
  // Build URI from individual components
  const username = process.env.MONGODB_USERNAME;
  const password = process.env.MONGODB_PASSWORD;
  const database = process.env.MONGODB_DATABASE;
  const host = process.env.MONGODB_HOST || 'localhost';
  const port = process.env.MONGODB_PORT || '27017';
  uri = `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`;
} else {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI" or MongoDB connection components');
}

const dbName = process.env.MONGODB_DATABASE;
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
