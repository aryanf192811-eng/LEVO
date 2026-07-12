import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Vehicle, VehicleDetail, DispatchableVehicle, CreateVehicleInput } from '@/types'

export const vehicleKeys = {
  all:          ['vehicles'] as const,
  list:         (f: object) => ['vehicles', 'list', f] as const,
  detail:       (id: number) => ['vehicles', id] as const,
  dispatchable: ['vehicles', 'dispatchable'] as const,
}

interface VehicleFilters {
  status?: string; type?: string; region?: string; search?: string
}

export function useVehicles(filters: VehicleFilters = {}) {
  return useQuery({
    queryKey: vehicleKeys.list(filters),
    queryFn:  () => api.get<Vehicle[]>('/vehicles', filters),
  })
}

export function useVehicleDetail(id: number) {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn:  () => api.get<VehicleDetail>(`/vehicles/${id}`),
    enabled:  !!id,
  })
}

export function useDispatchableVehicles() {
  return useQuery({
    queryKey: vehicleKeys.dispatchable,
    queryFn:  () => api.get<DispatchableVehicle[]>('/vehicles/dispatchable'),
    staleTime: 10_000,
  })
}

export function useCreateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVehicleInput) => api.post<Vehicle>('/vehicles', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: vehicleKeys.all }),
  })
}

export function useUpdateVehicle(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CreateVehicleInput>) => api.put<Vehicle>(`/vehicles/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: vehicleKeys.all })
      qc.invalidateQueries({ queryKey: vehicleKeys.detail(id) })
    },
  })
}

export function useDeleteVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/vehicles/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: vehicleKeys.all }),
  })
}
