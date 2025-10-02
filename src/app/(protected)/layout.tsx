import { requireAuth } from "@/lib/auth-utils";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will automatically redirect to /auth/signin if not authenticated
  await requireAuth();

  return <>{children}</>;
}