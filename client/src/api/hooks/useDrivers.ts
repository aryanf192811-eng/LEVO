import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Driver, DriverDetail, DispatchableDriver } from '@/types'

export const driverKeys = {
  all:          ['drivers'] as const,
  list:         (f: object) => ['drivers', 'list', f] as const,
  detail:       (id: number) => ['drivers', id] as const,
  dispatchable: ['drivers', 'dispatchable'] as const,
  expiring:     ['drivers', 'expiring'] as const,
}

interface DriverFilters {
  status?: string; licenseCategory?: string; search?: string; expiringDays?: number
}

export function useDrivers(filters: DriverFilters = {}) {
  return useQuery({
    queryKey: driverKeys.list(filters),
    queryFn:  () => api.get<Driver[]>('/drivers', filters),
  })
}

export function useExpiringDrivers() {
  return useQuery({
    queryKey: driverKeys.expiring,
    queryFn:  () => api.get<Driver[]>('/drivers/expiring'),
  })
}

export function useDispatchableDrivers() {
  return useQuery({
    queryKey: driverKeys.dispatchable,
    queryFn:  () => api.get<DispatchableDriver[]>('/drivers/dispatchable'),
    staleTime: 10_000,
  })
}

export function useDriverDetail(id: number) {
  return useQuery({
    queryKey: driverKeys.detail(id),
    queryFn:  () => api.get<DriverDetail>(`/drivers/${id}`),
    enabled:  !!id,
  })
}

export function useCreateDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post<Driver>('/drivers', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: driverKeys.all }),
  })
}

export function useUpdateDriver(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.put<Driver>(`/drivers/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: driverKeys.all })
      qc.invalidateQueries({ queryKey: driverKeys.detail(id) })
    },
  })
}

export function useAddSafetyEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { driverId: number; delta: number; reason: string }) => 
      api.post('/financial/safety-events', data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: driverKeys.detail(variables.driverId) })
      qc.invalidateQueries({ queryKey: driverKeys.all })
    },
  })
}

export function useSuspendDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { driverId: number; reason: string }) => 
      api.post(`/financial/drivers/${data.driverId}/suspend`, { reason: data.reason }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: driverKeys.detail(v.driverId) })
      qc.invalidateQueries({ queryKey: driverKeys.all })
    },
  })
}

export function useReinstateDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (driverId: number) => 
      api.post(`/financial/drivers/${driverId}/reinstate`),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: driverKeys.detail(id) })
      qc.invalidateQueries({ queryKey: driverKeys.all })
    },
  })
}
