import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppSettings } from '@/types';
import { moduleRegistry } from '../shared/module-registry';

interface AppState {
  // App-level settings and configuration
  settings: AppSettings;
  isInitialized: boolean;
  currentModule: string;

  // Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  enableModule: (moduleId: string) => void;
  disableModule: (moduleId: string) => void;
  setCurrentModule: (moduleId: string) => void;
  initializeApp: () => Promise<void>;
  resetApp: () => void;
}

const DEFAULT_APP_SETTINGS: AppSettings = {
  enabledModules: ['healthcare'],
  defaultModule: 'healthcare',
  theme: 'system',
  compactMode: false,
  firstTimeSetup: false
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_APP_SETTINGS,
      isInitialized: false,
      currentModule: 'healthcare',

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      enableModule: (moduleId) => {
        set((state) => {
          const enabledModules = state.settings.enabledModules.includes(moduleId)
            ? state.settings.enabledModules
            : [...state.settings.enabledModules, moduleId];

          // Enable in module registry
          moduleRegistry.enableModule(moduleId);

          return {
            settings: {
              ...state.settings,
              enabledModules
            }
          };
        });
      },

      disableModule: (moduleId) => {
        set((state) => {
          const enabledModules = state.settings.enabledModules.filter(id => id !== moduleId);

          // If disabling the default module, set to first available
          const defaultModule = state.settings.defaultModule === moduleId
            ? enabledModules[0] || 'healthcare'
            : state.settings.defaultModule;

          // Disable in module registry
          moduleRegistry.disableModule(moduleId);

          return {
            settings: {
              ...state.settings,
              enabledModules,
              defaultModule
            },
            currentModule: state.currentModule === moduleId ? defaultModule : state.currentModule
          };
        });
      },

      setCurrentModule: (moduleId) => {
        const { settings } = get();
        if (settings.enabledModules.includes(moduleId)) {
          set({ currentModule: moduleId });
        }
      },

      initializeApp: async () => {
        const { settings } = get();

        try {
          // Initialize all enabled modules
          await moduleRegistry.initializeEnabledModules();

          // Set current module to default if not already set
          const currentModule = get().currentModule;
          if (!settings.enabledModules.includes(currentModule)) {
            set({ currentModule: settings.defaultModule });
          }

          set({ isInitialized: true });
          console.log('FamilyOS initialized successfully');
        } catch (error) {
          console.error('Failed to initialize FamilyOS:', error);
        }
      },

      resetApp: () => {
        // Cleanup all modules
        moduleRegistry.getAllModules().forEach(module => {
          moduleRegistry.disableModule(module.id);
        });

        // Reset to defaults
        set({
          settings: DEFAULT_APP_SETTINGS,
          isInitialized: false,
          currentModule: 'healthcare'
        });
      }
    }),
    {
      name: 'familyos-app-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,

      // Provide migration function for version handling
      migrate: (persistedState: any, version: number) => {
        // Handle migration from version 0 (original) to version 1 (new app store)
        if (version === 0) {
          // This is a new store, so return default state
          return {
            settings: DEFAULT_APP_SETTINGS,
            isInitialized: false,
            currentModule: 'healthcare'
          };
        }

        return persistedState;
      },

      // Initialize app after rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure settings exist
          if (!state.settings) {
            state.settings = DEFAULT_APP_SETTINGS;
          }

          // Auto-initialize app (can be made optional later)
          setTimeout(() => {
            state.initializeApp();
          }, 100);
        }
      }
    }
  )
);