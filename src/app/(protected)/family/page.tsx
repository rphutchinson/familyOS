import { requireAuthWithFamily } from '@/lib/auth-utils';
import { getFamilyMembers } from '@/lib/db/family-members';
import { FamilyPageClient } from './family-page-client';

export default async function FamilyManagementPage() {
  const { session, family, familyId } = await requireAuthWithFamily();
  const members = await getFamilyMembers(familyId);

  return (
    <FamilyPageClient
      familyMembers={members}
      familyName={family.name}
    />
  );
}