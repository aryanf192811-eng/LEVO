// ── Enums ────────────────────────────────
export type UserRole = 'FLEET_MANAGER' | 'DISPATCHER' | 'SAFETY_OFFICER' | 'FINANCIAL_ANALYST'
export type VehicleStatus = 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED'
export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED'
export type TripStatus = 'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED'
export type MaintenanceStatus = 'ACTIVE' | 'CLOSED'
export type NotificationType = 'WEATHER_ALERT' | 'LICENSE_EXPIRY' | 'MAINTENANCE_DUE' | 'TRIP_UPDATE'

// ── Auth ─────────────────────────────────
export interface User {
id: number; email: string; name: string; role: UserRole; createdAt: string
}

// ── Vehicle ──────────────────────────────
export interface Vehicle {
id: number; regNumber: string; name: string; type: string
maxCapacityKg: number; currentOdometer: number; acquisitionCost: number
status: VehicleStatus; region: string
serviceIntervalKm: number | null; lastServiceOdometer: number
createdAt: string
}

export interface VehicleDetail extends Vehicle {
trips: TripListItem[]
maintenanceLogs: MaintenanceLog[]
fuelLogs: FuelLog[]
expenses: Expense[]
// computed fields appended by backend
totalFuelCost: number
totalMaintenanceCost: number
totalRevenue: number
roi: number
fuelEfficiency: number
}

export interface DispatchableVehicle {
id: number; regNumber: string; name: string; type: string
maxCapacityKg: number; currentOdometer: number; region: string
}

// ── Driver ───────────────────────────────
export interface Driver {
id: number; name: string; licenseNumber: string; licenseCategory: string
licenseExpiry: string; contactNumber: string; safetyScore: number
status: DriverStatus; createdAt: string
}

export interface DriverDetail extends Driver {
trips: TripListItem[]
safetyEvents: SafetyEvent[]
}

export interface DispatchableDriver {
id: number; name: string; licenseNumber: string
licenseCategory: string; licenseExpiry: string; safetyScore: number
}

// ── Trip ─────────────────────────────────
export interface TripListItem {
id: number; vehicleId: number; driverId: number; createdById: number
source: string; destination: string; cargoWeightKg: number
plannedDistanceKm: number; actualDistanceKm: number | null
startOdometer: number | null; endOdometer: number | null
revenue: number | null; status: TripStatus; notes: string | null
weatherRiskLevel: string | null; weatherRec: string | null
createdAt: string; dispatchedAt: string | null; completedAt: string | null
vehicle: { id: number; regNumber: string; name: string; type: string }
driver: { id: number; name: string; licenseNumber: string }
}

export interface TripDetail extends TripListItem {
events: TripEvent[]
fuelLogs: FuelLog[]
expenses: Expense[]
createdBy: { name: string; role: UserRole }
}

// ── Trip Event (audit trail) ──────────────
export interface TripEvent {
id: number; tripId: number; actorId: number
fromStatus: TripStatus; toStatus: TripStatus
notes: string | null; createdAt: string
actor: { name: string; role: UserRole }
}

// ── Maintenance ──────────────────────────
export interface MaintenanceLog {
id: number; vehicleId: number; type: string; description: string
cost: number; status: MaintenanceStatus; odometerAtService: number | null
isAutoTriggered: boolean; openedAt: string; closedAt: string | null
vehicle: { id: number; regNumber: string; name: string; status: VehicleStatus }
}

// ── Financial ────────────────────────────
export interface FuelLog {
id: number; vehicleId: number; tripId: number | null
litres: number; costPerLitre: number; totalCost: number
odometerReading: number; date: string; createdAt: string
vehicle: { name: string; regNumber: string }
trip: { id: number; source: string; destination: string } | null
}

export interface Expense {
id: number; vehicleId: number; tripId: number | null
type: string; amount: number; description: string | null
date: string; createdAt: string
vehicle: { name: string; regNumber: string }
trip: { id: number; source: string; destination: string } | null
}

export interface SafetyEvent {
id: number; driverId: number; delta: number; reason: string; createdAt: string
}

// ── Notification ─────────────────────────
export interface Notification {
id: number; userId: number | null; type: NotificationType
title: string; message: string; isRead: boolean
metadata: Record<string, unknown> | null; createdAt: string
}

// ── Dashboard KPIs ───────────────────────
export interface DashboardKPIs {
totalVehicles: number; availableVehicles: number; onTripVehicles: number
inShopVehicles: number; retiredVehicles: number
activeTrips: number; pendingTrips: number
driversOnDuty: number; totalDrivers: number
expiring30Days: number; suspendedDrivers: number
fleetUtilization: number
recentTrips: TripListItem[]
}

// ── Analytics ────────────────────────────
export interface FuelEfficiencyItem {
vehicleId: number; vehicleName: string; regNumber: string
totalDistanceKm: number; totalLitres: number; efficiencyKmPerLitre: number
}

export interface OperationalCostItem {
vehicleId: number; vehicleName: string; regNumber: string
fuelCost: number; maintenanceCost: number; otherExpenses: number; totalCost: number
}

export interface VehicleROIItem {
vehicleId: number; vehicleName: string; regNumber: string
acquisitionCost: number; totalRevenue: number; totalCost: number; roi: number
}

export interface MonthlyRevenueItem {
month: string; revenue: number; tripCount: number
}

export interface VehicleStatusBreakdown {
AVAILABLE: number; ON_TRIP: number; IN_SHOP: number; RETIRED: number
}

// ── Weather ──────────────────────────────
export interface WeatherData {
city: string; description: string; temp: number
windSpeed: number; rainMm: number; humidity: number; icon: string
}

export interface WeatherAssessment {
available: boolean
reason?: string
source?: WeatherData
destination?: WeatherData
risk?: {
risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
estimated_delay_hours: number
recommendation: string
proceed: boolean
}
}

// ── Form Input Types ──────────────────────
export interface CreateVehicleInput {
regNumber: string; name: string; type: string
maxCapacityKg: number; currentOdometer?: number
acquisitionCost: number; region: string
serviceIntervalKm?: number
}

export interface CreateDriverInput {
name: string; licenseNumber: string; licenseCategory: string
licenseExpiry: string; contactNumber: string; safetyScore?: number
}

export interface CreateTripInput {
vehicleId: number; driverId: number; source: string; destination: string
cargoWeightKg: number; plannedDistanceKm: number; notes?: string
weatherRiskLevel?: string; weatherRec?: string
}

export interface CompleteTripInput {
endOdometer: number; revenue: number
}
