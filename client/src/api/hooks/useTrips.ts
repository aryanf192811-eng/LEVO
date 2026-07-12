import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { vehicleKeys } from './useVehicles'
import { driverKeys } from './useDrivers'

export const tripKeys = {
  all:          ['trips'] as const,
  list:         (f: object) => ['trips', 'list', f] as const,
  detail:       (id: number) => ['trips', id] as const,
}

export function useTrips(filters = {}) {
  return useQuery({
    queryKey: tripKeys.list(filters),
    queryFn:  () => api.get<any[]>('/trips', filters),
    refetchInterval: 10_000,
  })
}

export function useTripDetail(id: number) {
  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn:  () => api.get<any>(`/trips/${id}`),
    enabled:  !!id,
  })
}

export function useCreateTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post<any>('/trips', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripKeys.all })
    },
  })
}

export function useDispatchTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tripId: number) => api.patch(`/trips/${tripId}/dispatch`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripKeys.all })
      qc.invalidateQueries({ queryKey: vehicleKeys.all })
      qc.invalidateQueries({ queryKey: driverKeys.all })
      qc.invalidateQueries({ queryKey: ['dashboard'] }) // update kpis
    },
  })
}

export function useCompleteTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tripId, data }: { tripId: number; data: any }) => 
      api.patch<{ trip: any; maintenanceTriggered: boolean }>(`/trips/${tripId}/complete`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripKeys.all })
      qc.invalidateQueries({ queryKey: vehicleKeys.all })
      qc.invalidateQueries({ queryKey: driverKeys.all })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useCancelTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tripId: number) => api.patch(`/trips/${tripId}/cancel`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripKeys.all })
      qc.invalidateQueries({ queryKey: vehicleKeys.all })
      qc.invalidateQueries({ queryKey: driverKeys.all })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useWeatherAssessment(source: string, destination: string, enabled: boolean) {
  return useQuery({
    queryKey: ['weather', source, destination],
    queryFn:  () => api.get<any>('/weather/assess', { source, destination }),
    enabled:  enabled && source.length > 2 && destination.length > 2,
    staleTime: 5 * 60_000,
    retry: 0,
  })
}
