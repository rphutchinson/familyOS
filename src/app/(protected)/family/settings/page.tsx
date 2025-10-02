import { requireAuthWithFamily } from '@/lib/auth-utils';
import { isUserFamilyOwner } from '@/lib/db/families';
import { getFamilyMembers } from '@/lib/db/family-members';
import { FamilySettingsClient } from './family-settings-client';

export default async function FamilySettingsPage() {
  const { session, family, familyId } = await requireAuthWithFamily();

  const isOwner = await isUserFamilyOwner(familyId, session.user.id);
  const members = await getFamilyMembers(familyId);

  return (
    <div className="container max-w-4xl py-8">
      <FamilySettingsClient
        family={family}
        isOwner={isOwner}
        members={members}
      />
    </div>
  );
}
