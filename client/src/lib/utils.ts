import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import type { VehicleStatus, DriverStatus, TripStatus, UserRole } from '@/types'

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
return twMerge(clsx(inputs))
}

// Status → color maps (used for badges throughout the app)
export const vehicleStatusConfig: Record<VehicleStatus, { label: string; className: string }> = {
AVAILABLE:  { label: 'Available',  className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
ON_TRIP:    { label: 'On Trip',    className: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
IN_SHOP:    { label: 'In Shop',    className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
RETIRED:    { label: 'Retired',    className: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200' },
}

export const driverStatusConfig: Record<DriverStatus, { label: string; className: string }> = {
AVAILABLE:  { label: 'Available',  className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
ON_TRIP:    { label: 'On Trip',    className: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
OFF_DUTY:   { label: 'Off Duty',   className: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200' },
SUSPENDED:  { label: 'Suspended',  className: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
}

export const tripStatusConfig: Record<TripStatus, { label: string; className: string }> = {
DRAFT:      { label: 'Draft',      className: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200' },
DISPATCHED: { label: 'Dispatched', className: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
COMPLETED:  { label: 'Completed',  className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
CANCELLED:  { label: 'Cancelled',  className: 'bg-red-50 text-red-600 ring-1 ring-red-200' },
}

export const roleLabels: Record<UserRole, string> = {
FLEET_MANAGER:     'Fleet Manager',
DISPATCHER:        'Dispatcher',
SAFETY_OFFICER:    'Safety Officer',
FINANCIAL_ANALYST: 'Financial Analyst',
}

// Date formatting
export function fmtDate(dateStr: string | null): string {
if (!dateStr) return '—'
const d = new Date(dateStr)
if (isToday(d)) return `Today ${format(d, 'HH:mm')}`
if (isYesterday(d)) return `Yesterday ${format(d, 'HH:mm')}`
return format(d, 'dd MMM yyyy')
}

export function fmtDateRelative(dateStr: string): string {
return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

// Number formatting
export function fmtCurrency(n: number): string {
return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export function fmtNumber(n: number, decimals = 1): string {
return n.toFixed(decimals)
}

// Days until a date (for license expiry)
export function daysUntil(dateStr: string): number {
return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

// License expiry urgency
export function licenseExpiryClass(dateStr: string): string {
const days = daysUntil(dateStr)
if (days < 0)  return 'text-red-600 font-semibold'
if (days <= 14) return 'text-red-500 font-medium'
if (days <= 30) return 'text-amber-500 font-medium'
return 'text-gray-600'
}

// Error extraction from Axios catch
export function getErrorMessage(err: unknown): string {
if (typeof err === 'object' && err !== null && 'message' in err) {
return (err as { message: string }).message
}
return 'An unexpected error occurred'
}
