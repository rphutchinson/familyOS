'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateFamilyAction, getInviteCodeAction, regenerateInviteCodeAction } from '@/actions/family';
import { Family, FamilyMemberData } from '@/types/database';
import { Users, Copy, RefreshCw, Check } from 'lucide-react';

interface FamilySettingsClientProps {
  family: Family;
  isOwner: boolean;
  members: FamilyMemberData[];
}

export function FamilySettingsClient({ family, isOwner, members }: FamilySettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [familyName, setFamilyName] = useState(family.name);
  const [inviteCode, setInviteCode] = useState(family.inviteCode);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateName = async () => {
    if (!familyName.trim()) {
      setError('Family name cannot be empty');
      return;
    }

    setError('');
    setSuccess('');
    startTransition(async () => {
      const result = await updateFamilyAction({ name: familyName });

      if (result.success) {
        setSuccess('Family name updated successfully');
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleRegenerateCode = async () => {
    setError('');
    setSuccess('');
    startTransition(async () => {
      const result = await regenerateInviteCodeAction();

      if (result.success) {
        setInviteCode(result.data);
        setSuccess('Invite code regenerated successfully');
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleCopyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy invite code');
    }
  };

  const membersWithAccounts = members.filter(m => m.userId);
  const membersWithoutAccounts = members.filter(m => !m.userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Family Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your family group and invite new members.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-md">{success}</div>
      )}

      {/* Family Name */}
      <Card>
        <CardHeader>
          <CardTitle>Family Name</CardTitle>
          <CardDescription>
            The name of your family group.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="familyName">Name</Label>
            <div className="flex gap-2">
              <Input
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                disabled={!isOwner || isPending}
              />
              {isOwner && (
                <Button
                  onClick={handleUpdateName}
                  disabled={isPending || familyName === family.name}
                >
                  Save
                </Button>
              )}
            </div>
          </div>
          {!isOwner && (
            <p className="text-sm text-muted-foreground">
              Only the family owner can change the family name.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Invite Code */}
      <Card>
        <CardHeader>
          <CardTitle>Invite Code</CardTitle>
          <CardDescription>
            Share this code with family members to invite them to join.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={inviteCode}
              readOnly
              className="font-mono text-lg"
            />
            <Button
              onClick={handleCopyInviteCode}
              variant="outline"
              size="icon"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            {isOwner && (
              <Button
                onClick={handleRegenerateCode}
                variant="outline"
                size="icon"
                disabled={isPending}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Anyone with this code can join your family.
            {isOwner && ' Click the refresh button to generate a new code.'}
          </p>
        </CardContent>
      </Card>

      {/* Family Members */}
      <Card>
        <CardHeader>
          <CardTitle>Family Members</CardTitle>
          <CardDescription>
            People in your family group.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Members with accounts */}
            {membersWithAccounts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  With Accounts ({membersWithAccounts.length})
                </h3>
                <div className="space-y-2">
                  {membersWithAccounts.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full"
                          style={{ backgroundColor: member.color }}
                        />
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.relationship}
                          </div>
                        </div>
                      </div>
                      {member.isDefault && (
                        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          You
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members without accounts */}
            {membersWithoutAccounts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Without Accounts ({membersWithoutAccounts.length})
                </h3>
                <div className="space-y-2">
                  {membersWithoutAccounts.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-md opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full"
                          style={{ backgroundColor: member.color }}
                        />
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.relationship}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-4">
              Go to the <a href="/family" className="text-blue-600 hover:underline">Family page</a> to add or manage family members.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
