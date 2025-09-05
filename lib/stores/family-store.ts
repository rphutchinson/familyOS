import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FamilyMember, FamilyRelationship, FAMILY_COLORS } from '@/types';

interface FamilyState {
  familyMembers: FamilyMember[];
  
  // Actions
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFamilyMember: (id: string, updates: Partial<Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteFamilyMember: (id: string) => boolean;
  getFamilyMember: (id: string) => FamilyMember | undefined;
  getDefaultFamilyMember: () => FamilyMember | undefined;
  getAvailableColor: () => string;
  
  // Utility functions
  reorderFamilyMembers: (fromIndex: number, toIndex: number) => void;
  setDefaultFamilyMember: (id: string) => void;
}

const DEFAULT_FAMILY_MEMBER: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Me',
  relationship: 'Self',
  color: FAMILY_COLORS[0],
  isDefault: true
};

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      familyMembers: [],

      addFamilyMember: (member) => {
        const now = new Date().toISOString();
        const newMember: FamilyMember = {
          ...member,
          id: `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now
        };

        set((state) => ({
          familyMembers: [...state.familyMembers, newMember]
        }));
      },

      updateFamilyMember: (id, updates) => {
        set((state) => ({
          familyMembers: state.familyMembers.map((member) =>
            member.id === id
              ? { ...member, ...updates, updatedAt: new Date().toISOString() }
              : member
          )
        }));
      },

      deleteFamilyMember: (id) => {
        const { familyMembers } = get();
        const memberToDelete = familyMembers.find(m => m.id === id);
        
        // Prevent deletion of default family member if it's the only one
        if (memberToDelete?.isDefault && familyMembers.length === 1) {
          console.warn('Cannot delete the only family member');
          return false;
        }

        // If deleting default member and others exist, make another member default
        if (memberToDelete?.isDefault && familyMembers.length > 1) {
          const otherMembers = familyMembers.filter(m => m.id !== id);
          set((state) => ({
            familyMembers: otherMembers.map((member, index) => 
              index === 0 ? { ...member, isDefault: true, updatedAt: new Date().toISOString() } : member
            )
          }));
        } else {
          set((state) => ({
            familyMembers: state.familyMembers.filter(member => member.id !== id)
          }));
        }

        return true;
      },

      getFamilyMember: (id) => {
        return get().familyMembers.find(member => member.id === id);
      },

      getDefaultFamilyMember: () => {
        return get().familyMembers.find(member => member.isDefault);
      },

      getAvailableColor: () => {
        const { familyMembers } = get();
        const usedColors = familyMembers.map(m => m.color);
        const availableColor = FAMILY_COLORS.find(color => !usedColors.includes(color));
        return availableColor || FAMILY_COLORS[familyMembers.length % FAMILY_COLORS.length];
      },

      reorderFamilyMembers: (fromIndex, toIndex) => {
        set((state) => {
          const newMembers = [...state.familyMembers];
          const [movedMember] = newMembers.splice(fromIndex, 1);
          newMembers.splice(toIndex, 0, movedMember);
          return { familyMembers: newMembers };
        });
      },

      setDefaultFamilyMember: (id) => {
        set((state) => ({
          familyMembers: state.familyMembers.map((member) => ({
            ...member,
            isDefault: member.id === id,
            updatedAt: new Date().toISOString()
          }))
        }));
      }
    }),
    {
      name: 'family-members-storage',
      storage: createJSONStorage(() => localStorage),
      
      // Initialize with default family member if empty
      onRehydrateStorage: () => (state) => {
        if (state && state.familyMembers.length === 0) {
          state.addFamilyMember(DEFAULT_FAMILY_MEMBER);
        }
      }
    }
  )
);