'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createFamilyAction, joinFamilyAction } from '@/actions/family';
import { checkMigrationNeededAction, migrateFamilyDataAction, createMinimalFamilyAction } from '@/actions/migration';
import { Users, UserPlus } from 'lucide-react';

interface OnboardingClientProps {
  userName: string;
}

export function OnboardingClient({ userName }: OnboardingClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<'choice' | 'create' | 'join' | 'migrate'>('choice');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');

  // Check for migration data on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const familyStorage = localStorage.getItem('familyos-family-storage');
      if (familyStorage) {
        try {
          const data = JSON.parse(familyStorage);
          if (data.state?.familyMembers?.length > 0) {
            setMode('migrate');
          }
        } catch (e) {
          console.error('Failed to parse localStorage:', e);
        }
      }
    }
  });

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      setError('Please enter a family name');
      return;
    }

    setError('');
    startTransition(async () => {
      const result = await createFamilyAction(familyName);

      if (result.success) {
        router.push('/family');
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleJoinFamily = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setError('');
    startTransition(async () => {
      const result = await joinFamilyAction(inviteCode);

      if (result.success) {
        router.push('/family');
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleMigrate = async () => {
    setError('');
    startTransition(async () => {
      try {
        // Get localStorage data
        const familyStorage = localStorage.getItem('familyos-family-storage');
        if (!familyStorage) {
          setError('No data to migrate');
          return;
        }

        const data = JSON.parse(familyStorage);
        const localStorageData = {
          familyMembers: data.state?.familyMembers || [],
          providers: data.state?.providers || [],
        };

        const result = await migrateFamilyDataAction(localStorageData);

        if (result.success) {
          // Clear localStorage after successful migration
          localStorage.removeItem('familyos-family-storage');
          localStorage.removeItem('familyos-healthcare-storage');

          router.push('/family');
          router.refresh();
        } else {
          setError(result.error);
        }
      } catch (error) {
        console.error('Migration error:', error);
        setError('Failed to migrate data');
      }
    });
  };

  const handleSkipMigration = async () => {
    setError('');
    startTransition(async () => {
      const result = await createMinimalFamilyAction();

      if (result.success) {
        // Clear localStorage
        localStorage.removeItem('familyos-family-storage');
        localStorage.removeItem('familyos-healthcare-storage');

        router.push('/family');
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  if (mode === 'migrate') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Migrate Your Data</CardTitle>
          <CardDescription>
            We found existing family data on this device. Would you like to migrate it to your account?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>
          )}

          <Button
            onClick={handleMigrate}
            disabled={isPending}
            className="w-full"
            size="lg"
          >
            {isPending ? 'Migrating...' : 'Migrate Data'}
          </Button>

          <Button
            onClick={handleSkipMigration}
            disabled={isPending}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {isPending ? 'Please wait...' : 'Start Fresh (Discard Old Data)'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (mode === 'choice') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to FamilyOS, {userName}!</CardTitle>
          <CardDescription>
            Let's set up your family. Choose an option below to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => setMode('create')}
            className="w-full h-auto py-6 flex flex-col items-center gap-2"
            size="lg"
          >
            <Users className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold">Create New Family</div>
              <div className="text-xs opacity-90">Start a new family group</div>
            </div>
          </Button>

          <Button
            onClick={() => setMode('join')}
            variant="outline"
            className="w-full h-auto py-6 flex flex-col items-center gap-2"
            size="lg"
          >
            <UserPlus className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold">Join Existing Family</div>
              <div className="text-xs opacity-90">Use an invite code to join</div>
            </div>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (mode === 'create') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Your Family</CardTitle>
          <CardDescription>
            Choose a name for your family group.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="familyName">Family Name</Label>
            <Input
              id="familyName"
              placeholder="The Smith Family"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              disabled={isPending}
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCreateFamily}
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? 'Creating...' : 'Create Family'}
            </Button>
            <Button
              onClick={() => {
                setMode('choice');
                setError('');
                setFamilyName('');
              }}
              disabled={isPending}
              variant="outline"
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mode === 'join') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join a Family</CardTitle>
          <CardDescription>
            Enter the invite code shared by your family.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invite Code</Label>
            <Input
              id="inviteCode"
              placeholder="ABC123XY"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              disabled={isPending}
              autoFocus
              className="uppercase"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleJoinFamily}
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? 'Joining...' : 'Join Family'}
            </Button>
            <Button
              onClick={() => {
                setMode('choice');
                setError('');
                setInviteCode('');
              }}
              disabled={isPending}
              variant="outline"
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
