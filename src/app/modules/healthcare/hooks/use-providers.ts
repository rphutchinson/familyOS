import { useState, useEffect } from 'react';
import { Provider, FamilyGroup, FamilyMember } from '@/app/types';

const STORAGE_KEY = 'healthcare-providers';

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);

  // Load providers from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProviders(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load providers:', error);
        setProviders([]);
      }
    }
  }, []);

  // Save providers to localStorage whenever providers change
  useEffect(() => {
    if (providers.length >= 0) { // Allow saving empty array
      localStorage.setItem(STORAGE_KEY, JSON.stringify(providers));
    }
  }, [providers]);

  const addProvider = (provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProvider: Provider = {
      ...provider,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: now,
      updatedAt: now,
      // Ensure backward compatibility for Provider interface
      name: provider.providerName || provider.name || 'Unknown Provider'
    };
    setProviders(prev => [...prev, newProvider]);
  };

  const updateProvider = (id: string, updates: Partial<Provider>) => {
    setProviders(prev => 
      prev.map(provider => 
        provider.id === id ? { 
          ...provider, 
          ...updates, 
          updatedAt: new Date().toISOString(),
          // Ensure backward compatibility
          name: updates.providerName || updates.name || provider.name || provider.providerName
        } : provider
      )
    );
  };

  const deleteProvider = (id: string) => {
    setProviders(prev => prev.filter(provider => provider.id !== id));
  };

  const getProvidersByFamilyMember = (familyMemberId: string) => {
    return providers.filter(provider => 
      provider.familyMemberIds.includes(familyMemberId)
    );
  };

  const groupProvidersByFamily = (familyMembers: FamilyMember[]): FamilyGroup[] => {
    return familyMembers.map(familyMember => ({
      familyMember,
      providers: getProvidersByFamilyMember(familyMember.id)
    })).filter(group => group.providers.length > 0); // Only show groups with providers
  };

  const markProviderAccessed = (id: string) => {
    updateProvider(id, { lastUsed: new Date().toISOString() });
  };

  // Quick add functionality for browser integration
  const quickAddProvider = (url: string, detectedData?: any) => {
    const newProvider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'> = {
      name: detectedData?.siteName || 'New Provider',
      providerName: detectedData?.siteName || 'New Provider',
      specialty: 'Other',
      portalUrl: url,
      familyMemberIds: [], // Will need to be assigned
      autoDetected: !!detectedData,
      quickAddData: {
        siteName: detectedData?.siteName,
        favicon: detectedData?.favicon,
        autoDetected: !!detectedData
      }
    };
    addProvider(newProvider);
  };

  return {
    providers,
    addProvider,
    updateProvider,
    deleteProvider,
    getProvidersByFamilyMember,
    groupProvidersByFamily,
    markProviderAccessed,
    quickAddProvider
  };
}