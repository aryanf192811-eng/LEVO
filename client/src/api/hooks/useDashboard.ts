import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { DashboardKPIs, FuelEfficiencyItem, OperationalCostItem, VehicleROIItem, MonthlyRevenueItem, VehicleStatusBreakdown } from '@/types'

export const dashboardKeys = {
  kpis:     ['dashboard', 'kpis'] as const,
  fuelEff:  ['analytics', 'fuel-efficiency'] as const,
  costs:    ['analytics', 'costs'] as const,
  roi:      ['analytics', 'roi'] as const,
  revenue:  ['analytics', 'monthly-revenue'] as const,
  vStatus:  ['analytics', 'vehicle-status'] as const,
}

export function useKPIs() {
  return useQuery({
    queryKey: dashboardKeys.kpis,
    queryFn:  () => api.get<DashboardKPIs>('/dashboard/kpis'),
    refetchInterval: 8_000,
    refetchIntervalInBackground: false,
  })
}

export function useFuelEfficiency() {
  return useQuery({
    queryKey: dashboardKeys.fuelEff,
    queryFn:  () => api.get<FuelEfficiencyItem[]>('/dashboard/analytics/fuel-efficiency'),
    staleTime: 60_000,
  })
}

export function useOperationalCosts() {
  return useQuery({
    queryKey: dashboardKeys.costs,
    queryFn:  () => api.get<OperationalCostItem[]>('/dashboard/analytics/costs'),
    staleTime: 60_000,
  })
}

export function useVehicleROI() {
  return useQuery({
    queryKey: dashboardKeys.roi,
    queryFn:  () => api.get<VehicleROIItem[]>('/dashboard/analytics/roi'),
    staleTime: 60_000,
  })
}

export function useMonthlyRevenue() {
  return useQuery({
    queryKey: dashboardKeys.revenue,
    queryFn:  () => api.get<MonthlyRevenueItem[]>('/dashboard/analytics/monthly-revenue'),
    staleTime: 60_000,
  })
}

export function useVehicleStatusBreakdown() {
  return useQuery({
    queryKey: dashboardKeys.vStatus,
    queryFn:  () => api.get<VehicleStatusBreakdown>('/dashboard/analytics/vehicle-status'),
    refetchInterval: 8_000,
  })
}
