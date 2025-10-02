import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getFamilyById } from "@/lib/db/families";
import { getDatabase } from "@/lib/mongodb";
import { Family } from "@/types/database";
import { ObjectId } from "mongodb";

/**
 * Requires authentication for a server component or route.
 * Automatically redirects to sign-in page if user is not authenticated.
 * @returns The authenticated session
 */
export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/signin");
  }

  return session;
}

/**
 * Gets the current session without requiring authentication.
 * Returns null if user is not authenticated.
 * @returns The session or null
 */
export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

/**
 * Requires authentication and ensures user has a family.
 * Redirects to onboarding if user doesn't have a family.
 * @returns The authenticated session and family data
 */
export async function requireAuthWithFamily(): Promise<{
  session: Awaited<ReturnType<typeof requireAuth>>;
  family: Family;
  familyId: string;
}> {
  const session = await requireAuth();

  // Get user's familyId from database
  // Better Auth uses _id as the primary key (ObjectId)
  const db = await getDatabase();
  const user = await db.collection("user").findOne({ _id: new ObjectId(session.user.id) });

  if (!user?.familyId) {
    redirect("/onboarding");
  }

  const familyId = user.familyId.toString();
  const family = await getFamilyById(familyId);

  if (!family) {
    redirect("/onboarding");
  }

  return { session, family, familyId };
}

/**
 * Update user's familyId
 */
export async function updateUserFamilyId(userId: string, familyId: string): Promise<void> {
  const db = await getDatabase();
  // Store familyId as a string (not ObjectId) for consistency with Better Auth
  // Better Auth uses _id as the primary key (ObjectId)
  await db.collection("user").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { familyId: familyId } }
  );
}

/**
 * Get user's familyId
 */
export async function getUserFamilyId(userId: string): Promise<string | null> {
  const db = await getDatabase();
  // Better Auth uses _id as the primary key (ObjectId)
  const user = await db.collection("user").findOne({ _id: new ObjectId(userId) });

  // Handle both string and ObjectId formats for backward compatibility
  if (!user?.familyId) return null;

  // If it's already a string, return it
  if (typeof user.familyId === 'string') {
    return user.familyId;
  }

  // If it's an ObjectId, convert to string
  return user.familyId.toString();
}