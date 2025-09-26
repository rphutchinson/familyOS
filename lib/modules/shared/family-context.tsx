'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { ModuleDataContext } from '@/types';
import { useFamilyStore } from '@/lib/stores/family-store';

/**
 * React context for sharing family and app data across modules
 * Provides a consistent interface for modules to access family information
 */
const FamilyDataContext = createContext<ModuleDataContext | null>(null);

interface FamilyDataProviderProps {
  children: ReactNode;
}

/**
 * Provider component that supplies family data to all child modules
 */
export function FamilyDataProvider({ children }: FamilyDataProviderProps) {
  const { familyMembers, appSettings, getDefaultFamilyMember } = useFamilyStore();

  const contextValue: ModuleDataContext = {
    familyMembers,
    currentUser: getDefaultFamilyMember(),
    appSettings,
  };

  return (
    <FamilyDataContext.Provider value={contextValue}>
      {children}
    </FamilyDataContext.Provider>
  );
}

/**
 * Hook to access family data within modules
 * Must be used within a FamilyDataProvider
 */
export function useFamilyData(): ModuleDataContext {
  const context = useContext(FamilyDataContext);

  if (!context) {
    throw new Error('useFamilyData must be used within a FamilyDataProvider');
  }

  return context;
}

/**
 * Hook to get the current user (default family member)
 */
export function useCurrentUser() {
  const { currentUser } = useFamilyData();
  return currentUser;
}

/**
 * Hook to get all family members
 */
export function useFamilyMembers() {
  const { familyMembers } = useFamilyData();
  return familyMembers;
}

/**
 * Hook to get app settings
 */
export function useAppSettings() {
  const { appSettings } = useFamilyData();
  return appSettings;
}