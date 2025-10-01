import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppSettings } from '@/types';

interface AppState {
  // App-level settings and configuration
  settings: AppSettings;

  // Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
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
    (set) => ({
      settings: DEFAULT_APP_SETTINGS,

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      resetApp: () => {
        set({
          settings: DEFAULT_APP_SETTINGS
        });
      }
    }),
    {
      name: 'familyos-app-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
);