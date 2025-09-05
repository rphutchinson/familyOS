import { useState, useEffect } from 'react';
import { FamilyMember } from '@/types';

const STORAGE_KEY = 'family-members';

const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'self',
    name: 'Me',
    relationship: 'Self',
    color: '#3b82f6',
    isDefault: true
  }
];

export function useFamilyMembers() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // Load family members from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFamilyMembers(parsed);
      } catch (error) {
        console.error('Failed to load family members:', error);
        setFamilyMembers(DEFAULT_FAMILY_MEMBERS);
      }
    } else {
      // First time - set up default family member
      setFamilyMembers(DEFAULT_FAMILY_MEMBERS);
    }
  }, []);

  // Save family members to localStorage whenever they change
  useEffect(() => {
    if (familyMembers.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(familyMembers));
    }
  }, [familyMembers]);

  const addFamilyMember = (familyMember: Omit<FamilyMember, 'id'>) => {
    const newFamilyMember: FamilyMember = {
      ...familyMember,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    setFamilyMembers(prev => [...prev, newFamilyMember]);
  };

  const updateFamilyMember = (id: string, updates: Partial<FamilyMember>) => {
    setFamilyMembers(prev => 
      prev.map(member => 
        member.id === id ? { ...member, ...updates } : member
      )
    );
  };

  const deleteFamilyMember = (id: string) => {
    // Prevent deletion of default family member
    const memberToDelete = familyMembers.find(m => m.id === id);
    if (memberToDelete?.isDefault) {
      console.warn('Cannot delete default family member');
      return false;
    }
    
    setFamilyMembers(prev => prev.filter(member => member.id !== id));
    return true;
  };

  const getFamilyMember = (id: string) => {
    return familyMembers.find(member => member.id === id);
  };

  const getDefaultFamilyMember = () => {
    return familyMembers.find(member => member.isDefault) || familyMembers[0];
  };

  return {
    familyMembers,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    getFamilyMember,
    getDefaultFamilyMember
  };
}