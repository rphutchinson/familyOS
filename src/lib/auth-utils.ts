import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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