import React, { createContext, useContext } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Supermarket } from '@shared/schema';

type SupermarketContextValue = {
  selectedSupermarket: Supermarket | undefined;
  supermarkets: Supermarket[];
  selectSupermarket: (id: string) => void;
  isLoading: boolean;
};

const SupermarketContext = createContext<SupermarketContextValue | null>(null);

export function SupermarketProvider({ children }: { children: React.ReactNode }) {
  const { data: supermarkets = [], isLoading: isLoadingList } = useQuery<Supermarket[]>({ 
    queryKey: ['/api/supermarkets'] 
  });

  const { data: selectedSupermarket, isLoading: isLoadingSelected } = useQuery<Supermarket | undefined>({ 
    queryKey: ['/api/supermarkets/selected'] 
  });

  const selectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('POST', `/api/supermarkets/${id}/select`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/supermarkets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/supermarkets/selected'] });
    },
  });

  return (
    <SupermarketContext.Provider 
      value={{ 
        selectedSupermarket, 
        supermarkets, 
        selectSupermarket: (id) => selectMutation.mutate(id),
        isLoading: isLoadingList || isLoadingSelected 
      }}
    >
      {children}
    </SupermarketContext.Provider>
  );
}

export function useSupermarket() {
  const ctx = useContext(SupermarketContext);
  if (!ctx) throw new Error('useSupermarket must be used within SupermarketProvider');
  return ctx;
}
