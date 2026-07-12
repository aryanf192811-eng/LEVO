import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'

export const financialKeys = {
  fuel: (f: object) => ['financial', 'fuel', f] as const,
  expenses: (f: object) => ['financial', 'expenses', f] as const,
  costs: (id: number) => ['financial', 'costs', id] as const,
}

export function useCreateFuelLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/financial/fuel', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financial'] }),
  })
}

export function useFuelLogs(filters = {}) {
  return useQuery({
    queryKey: financialKeys.fuel(filters),
    queryFn:  () => api.get<any[]>('/financial/fuel', filters),
  })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/financial/expenses', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financial'] }),
  })
}

export function useExpenses(filters = {}) {
  return useQuery({
    queryKey: financialKeys.expenses(filters),
    queryFn:  () => api.get<any[]>('/financial/expenses', filters),
  })
}

export function useOperationalCost(vehicleId: number) {
  return useQuery({
    queryKey: financialKeys.costs(vehicleId),
    queryFn:  () => api.get<any>(`/financial/costs/${vehicleId}`),
    enabled:  !!vehicleId,
  })
}
