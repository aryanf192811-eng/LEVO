import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { vehicleKeys } from './useVehicles'

export const maintenanceKeys = {
  all:          ['maintenance'] as const,
  list:         (f: object) => ['maintenance', 'list', f] as const,
  detail:       (id: number) => ['maintenance', id] as const,
}

export function useMaintenance(filters = {}) {
  return useQuery({
    queryKey: maintenanceKeys.list(filters),
    queryFn:  () => api.get<any[]>('/maintenance', filters),
  })
}

export function useMaintenanceDetail(id: number) {
  return useQuery({
    queryKey: maintenanceKeys.detail(id),
    queryFn:  () => api.get<any>(`/maintenance/${id}`),
    enabled:  !!id,
  })
}

export function useCreateMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post<any>('/maintenance', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: maintenanceKeys.all })
      qc.invalidateQueries({ queryKey: vehicleKeys.all })
    },
  })
}

export function useCloseMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.patch(`/maintenance/${id}/close`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: maintenanceKeys.all })
      qc.invalidateQueries({ queryKey: vehicleKeys.all })
      qc.invalidateQueries({ queryKey: ['dashboard'] }) // utilization kpi
    },
  })
}
