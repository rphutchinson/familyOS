import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  FamilyMember,
  FamilyRelationship,
  FAMILY_COLORS,
  HealthcareProvider,
  Provider,
  FamilyGroup,
  FamilyPreferences,
  AppSettings,
  createProviderWithName
} from '@/types';

interface FamilyState {
  // Core data
  familyMembers: FamilyMember[];
  providers: HealthcareProvider[];
  appSettings: AppSettings;

  // Family Member Actions
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFamilyMember: (id: string, updates: Partial<Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteFamilyMember: (id: string) => boolean;
  getFamilyMember: (id: string) => FamilyMember | undefined;
  getDefaultFamilyMember: () => FamilyMember | undefined;
  getAvailableColor: () => string;
  reorderFamilyMembers: (fromIndex: number, toIndex: number) => void;
  setDefaultFamilyMember: (id: string) => void;

  // Enhanced Family Preference Actions
  updateFamilyMemberPreferences: (id: string, preferences: Partial<FamilyPreferences>) => void;
  getFamilyMemberPreferences: (id: string) => FamilyPreferences | undefined;
  updateFamilyMemberMetadata: (id: string, metadata: Record<string, any>) => void;

  // Provider Actions (unchanged for backward compatibility)
  addProvider: (provider: Omit<HealthcareProvider, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProvider: (id: string, updates: Partial<Omit<HealthcareProvider, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteProvider: (id: string) => void;
  getProvider: (id: string) => HealthcareProvider | undefined;
  getProvidersByFamilyMember: (familyMemberId: string) => HealthcareProvider[];
  groupProvidersByFamily: () => FamilyGroup[];
  markProviderUsed: (id: string) => void;

  // Utility functions
  getProvidersForMultipleMembers: () => HealthcareProvider[];
  searchProviders: (query: string) => HealthcareProvider[];

  // App Settings Actions
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  enableModule: (moduleId: string) => void;
  disableModule: (moduleId: string) => void;
}

const DEFAULT_FAMILY_MEMBER: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Me',
  relationship: 'Self',
  color: FAMILY_COLORS[0],
  isDefault: true
};

const DEFAULT_APP_SETTINGS: AppSettings = {
  enabledModules: ['healthcare'], // Start with healthcare module enabled
  defaultModule: 'healthcare',
  theme: 'system',
  compactMode: false,
  firstTimeSetup: false
};

// Migration utility to ensure backward compatibility with existing family member data
const migrateFamilyMember = (member: any): FamilyMember => {
  return {
    ...member,
    // Ensure new fields exist with defaults if not present
    preferences: member.preferences || {},
    metadata: member.metadata || {},
    modulePermissions: member.modulePermissions || {}
  };
};

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      familyMembers: [],
      providers: [],
      appSettings: DEFAULT_APP_SETTINGS,

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
      },

      // Provider Management Methods
      addProvider: (provider) => {
        const now = new Date().toISOString();
        const newProvider: HealthcareProvider = {
          ...provider,
          id: `provider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now
        };

        set((state) => ({
          providers: [...state.providers, newProvider]
        }));
      },

      updateProvider: (id, updates) => {
        set((state) => ({
          providers: state.providers.map((provider) =>
            provider.id === id
              ? { ...provider, ...updates, updatedAt: new Date().toISOString() }
              : provider
          )
        }));
      },

      deleteProvider: (id) => {
        set((state) => ({
          providers: state.providers.filter(provider => provider.id !== id)
        }));
      },

      getProvider: (id) => {
        return get().providers.find(provider => provider.id === id);
      },

      getProvidersByFamilyMember: (familyMemberId) => {
        return get().providers.filter(provider =>
          provider.familyMemberIds.includes(familyMemberId)
        );
      },

      groupProvidersByFamily: () => {
        const { familyMembers, providers } = get();
        return familyMembers.map(familyMember => ({
          familyMember,
          providers: providers.filter(provider =>
            provider.familyMemberIds.includes(familyMember.id)
          ).map(createProviderWithName)
        })).filter(group => group.providers.length > 0);
      },

      markProviderUsed: (id) => {
        set((state) => ({
          providers: state.providers.map((provider) =>
            provider.id === id
              ? { ...provider, lastUsed: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : provider
          )
        }));
      },

      getProvidersForMultipleMembers: () => {
        return get().providers.filter(provider => provider.familyMemberIds.length > 1);
      },

      searchProviders: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().providers.filter(provider =>
          provider.providerName.toLowerCase().includes(lowerQuery) ||
          provider.specialty.toLowerCase().includes(lowerQuery)
        );
      },

      // Enhanced Family Preference Methods
      updateFamilyMemberPreferences: (id, preferences) => {
        set((state) => ({
          familyMembers: state.familyMembers.map((member) =>
            member.id === id
              ? {
                  ...member,
                  preferences: { ...member.preferences, ...preferences },
                  updatedAt: new Date().toISOString()
                }
              : member
          )
        }));
      },

      getFamilyMemberPreferences: (id) => {
        const member = get().familyMembers.find(member => member.id === id);
        return member?.preferences;
      },

      updateFamilyMemberMetadata: (id, metadata) => {
        set((state) => ({
          familyMembers: state.familyMembers.map((member) =>
            member.id === id
              ? {
                  ...member,
                  metadata: { ...member.metadata, ...metadata },
                  updatedAt: new Date().toISOString()
                }
              : member
          )
        }));
      },

      // App Settings Methods
      updateAppSettings: (settings) => {
        set((state) => ({
          appSettings: { ...state.appSettings, ...settings }
        }));
      },

      enableModule: (moduleId) => {
        set((state) => ({
          appSettings: {
            ...state.appSettings,
            enabledModules: state.appSettings.enabledModules.includes(moduleId)
              ? state.appSettings.enabledModules
              : [...state.appSettings.enabledModules, moduleId]
          }
        }));
      },

      disableModule: (moduleId) => {
        set((state) => ({
          appSettings: {
            ...state.appSettings,
            enabledModules: state.appSettings.enabledModules.filter(id => id !== moduleId),
            // If disabling the default module, reset to first available
            defaultModule: state.appSettings.defaultModule === moduleId
              ? state.appSettings.enabledModules.find(id => id !== moduleId) || 'healthcare'
              : state.appSettings.defaultModule
          }
        }));
      }
    }),
    {
      name: 'family-healthcare-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,

      // Provide migration function for version handling
      migrate: (persistedState: any, version: number) => {
        // Handle migration from version 0 (original) to version 1 (with new fields)
        if (version === 0) {
          const state = persistedState as any;

          // Migrate family members to include new fields
          if (state.familyMembers) {
            state.familyMembers = state.familyMembers.map(migrateFamilyMember);
          }

          // Ensure app settings exist
          if (!state.appSettings) {
            state.appSettings = DEFAULT_APP_SETTINGS;
          }

          return state;
        }

        return persistedState;
      },

      // Initialize defaults after rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Initialize with default family member if empty
          if (state.familyMembers.length === 0) {
            state.addFamilyMember(DEFAULT_FAMILY_MEMBER);
          }
        }
      }
    }
  )
);