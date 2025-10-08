import React, { createContext, useContext } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { HealthCriteria } from '@shared/schema';

type HealthContextValue = {
  criteria: HealthCriteria[];
  toggle: (id: string, isEnabled: boolean) => void;
  enabledNames: string[];
};

const HealthCriteriaContext = createContext<HealthContextValue | null>(null);

export function HealthCriteriaProvider({ children }: { children: React.ReactNode }) {
  const { data: criteria = [] } = useQuery<HealthCriteria[]>({ queryKey: ['/api/health-criteria'] });

  const updateCriteriaMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<HealthCriteria> }) => {
      const response = await apiRequest('PATCH', `/api/health-criteria/${id}`, updates);
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/health-criteria'] }),
  });

  const toggle = (id: string, isEnabled: boolean) => {
    updateCriteriaMutation.mutate({ id, updates: { isEnabled } });
  };

  const enabledNames = criteria.filter((c) => c.isEnabled).map((c) => c.name);

  return (
    <HealthCriteriaContext.Provider value={{ criteria, toggle, enabledNames }}>
      {children}
    </HealthCriteriaContext.Provider>
  );
}

export function useHealthCriteria() {
  const ctx = useContext(HealthCriteriaContext);
  if (!ctx) throw new Error('useHealthCriteria must be used within HealthCriteriaProvider');
  return ctx;
}

export default HealthCriteriaContext;
