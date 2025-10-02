import { redirect } from 'next/navigation';
import { requireAuth, getUserFamilyId } from '@/lib/auth-utils';
import { OnboardingClient } from './onboarding-client';

export default async function OnboardingPage() {
  const session = await requireAuth();

  // Check if user already has a family
  const familyId = await getUserFamilyId(session.user.id);
  if (familyId) {
    redirect('/family');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <OnboardingClient userName={session.user.name || 'there'} />
    </div>
  );
}
