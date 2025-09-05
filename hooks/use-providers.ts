import { useState, useEffect } from 'react';
import { Provider } from '@/types';

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mockProviders: Provider[] = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        specialty: 'Cardiology',
        email: 'sarah.johnson@healthcare.com',
        phone: '555-0123',
        status: 'active',
        joinDate: '2023-01-15',
        patientsCount: 145
      },
      {
        id: '2', 
        name: 'Dr. Michael Chen',
        specialty: 'Pediatrics',
        email: 'michael.chen@healthcare.com',
        phone: '555-0124',
        status: 'active',
        joinDate: '2023-03-20',
        patientsCount: 98
      },
      {
        id: '3',
        name: 'Dr. Emily Davis',
        specialty: 'Neurology',
        email: 'emily.davis@healthcare.com', 
        phone: '555-0125',
        status: 'pending',
        joinDate: '2024-01-10',
        patientsCount: 0
      }
    ];

    setTimeout(() => {
      setProviders(mockProviders);
      setLoading(false);
    }, 1000);
  }, []);

  const addProvider = (provider: Omit<Provider, 'id'>) => {
    const newProvider: Provider = {
      ...provider,
      id: Math.random().toString(36).substr(2, 9)
    };
    setProviders(prev => [...prev, newProvider]);
  };

  const updateProvider = (id: string, updates: Partial<Provider>) => {
    setProviders(prev => 
      prev.map(provider => 
        provider.id === id ? { ...provider, ...updates } : provider
      )
    );
  };

  const deleteProvider = (id: string) => {
    setProviders(prev => prev.filter(provider => provider.id !== id));
  };

  return {
    providers,
    loading,
    error,
    addProvider,
    updateProvider,
    deleteProvider
  };
}