import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FamilyMember, FamilyRelationship } from '@/types';

interface FamilyState {
  familyMembers: FamilyMember[];
  currentUser: FamilyMember | null;
  appSettings: any; // Will be properly typed later

  // Actions
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
  deleteFamilyMember: (id: string) => void;
  setCurrentUser: (member: FamilyMember) => void;
  getFamilyMemberById: (id: string) => FamilyMember | undefined;
  getDefaultFamilyMember: () => FamilyMember | null;
  getAvailableColor: () => string;
  setDefaultFamilyMember: (id: string) => void;
  addProvider: (provider: any) => void;
  updateProvider: (id: string, updates: any) => void;
  deleteProvider: (id: string) => void;
  providers: any[];
  groupProvidersByFamily: () => any;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      familyMembers: [],
      currentUser: null,
      appSettings: {},
      providers: [],

      addFamilyMember: (memberData) => {
        const newMember: FamilyMember = {
          ...memberData,
          id: crypto.randomUUID(),
          isDefault: memberData.isDefault ?? false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          familyMembers: [...state.familyMembers, newMember],
          currentUser: state.currentUser || newMember, // Set as current user if none exists
        }));
      },

      updateFamilyMember: (id, updates) => {
        set((state) => ({
          familyMembers: state.familyMembers.map((member) =>
            member.id === id
              ? { ...member, ...updates, updatedAt: new Date().toISOString() }
              : member
          ),
          currentUser: state.currentUser?.id === id
            ? { ...state.currentUser, ...updates, updatedAt: new Date().toISOString() }
            : state.currentUser,
        }));
      },

      deleteFamilyMember: (id) => {
        set((state) => ({
          familyMembers: state.familyMembers.filter((member) => member.id !== id),
          currentUser: state.currentUser?.id === id ? null : state.currentUser,
        }));
      },

      setCurrentUser: (member) => {
        set({ currentUser: member });
      },

      getFamilyMemberById: (id) => {
        return get().familyMembers.find((member) => member.id === id);
      },

      getDefaultFamilyMember: () => {
        const state = get();
        return state.currentUser || state.familyMembers.find(member => member.isDefault) || state.familyMembers[0] || null;
      },

      getAvailableColor: () => {
        const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];
        const usedColors = get().familyMembers.map(member => member.color);
        const availableColors = colors.filter(color => !usedColors.includes(color));
        return availableColors[0] || colors[0];
      },

      setDefaultFamilyMember: (id) => {
        set((state) => ({
          familyMembers: state.familyMembers.map((member) =>
            member.id === id
              ? { ...member, isDefault: true, updatedAt: new Date().toISOString() }
              : { ...member, isDefault: false, updatedAt: new Date().toISOString() }
          ),
        }));
      },

      addProvider: (provider) => {
        const newProvider = {
          ...provider,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          providers: [...state.providers, newProvider],
        }));
      },

      updateProvider: (id, updates) => {
        set((state) => ({
          providers: state.providers.map((provider: any) =>
            provider.id === id
              ? { ...provider, ...updates, updatedAt: new Date().toISOString() }
              : provider
          ),
        }));
      },

      deleteProvider: (id) => {
        set((state) => ({
          providers: state.providers.filter((provider: any) => provider.id !== id),
        }));
      },

      groupProvidersByFamily: () => {
        const state = get();
        return state.familyMembers.map(member => ({
          familyMember: member,
          providers: state.providers.filter((provider: any) =>
            provider.familyMemberIds?.includes(member.id)
          )
        }));
      },
    }),
    {
      name: 'familyos-family-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            familyMembers: [],
            currentUser: null,
          };
        }
        return persistedState;
      },
    }
  )
);

// Export a hook for family data context
export const useFamilyData = () => {
  const familyMembers = useFamilyStore((state) => state.familyMembers);
  const currentUser = useFamilyStore((state) => state.currentUser);

  return {
    familyMembers,
    currentUser,
  };
};