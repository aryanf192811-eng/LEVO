import { Parser } from 'json2csv';

// ── Generic CSV generator ─────────────────────────────────────────────────────
export function generateCSV(
  data: any[],
  fields: { label: string; value: string }[],
): string {
  const parser = new Parser({ fields: fields as any });
  return parser.parse(data);
}

// ── Vehicles ──────────────────────────────────────────────────────────────────
export function exportVehiclesCSV(vehicles: any[]): string {
  return generateCSV(vehicles, [
    { label: 'Registration', value: 'regNumber' },
    { label: 'Name',         value: 'name' },
    { label: 'Type',         value: 'type' },
    { label: 'Capacity (kg)', value: 'maxCapacityKg' },
    { label: 'Odometer (km)', value: 'currentOdometer' },
    { label: 'Acquisition Cost', value: 'acquisitionCost' },
    { label: 'Status',       value: 'status' },
    { label: 'Region',       value: 'region' },
  ]);
}

// ── Trips ─────────────────────────────────────────────────────────────────────
export function exportTripsCSV(trips: any[]): string {
  // Flatten nested objects for CSV
  const flat = trips.map((t) => ({
    ...t,
    vehicleName: t.vehicle?.name ?? '',
    driverName:  t.driver?.name  ?? '',
  }));

  return generateCSV(flat, [
    { label: 'ID',               value: 'id' },
    { label: 'Source',           value: 'source' },
    { label: 'Destination',      value: 'destination' },
    { label: 'Vehicle',          value: 'vehicleName' },
    { label: 'Driver',           value: 'driverName' },
    { label: 'Cargo (kg)',        value: 'cargoWeightKg' },
    { label: 'Planned Dist (km)', value: 'plannedDistanceKm' },
    { label: 'Actual Dist (km)',  value: 'actualDistanceKm' },
    { label: 'Revenue',          value: 'revenue' },
    { label: 'Status',           value: 'status' },
    { label: 'Created At',       value: 'createdAt' },
  ]);
}

// ── Expenses ──────────────────────────────────────────────────────────────────
export function exportExpensesCSV(expenses: any[]): string {
  const flat = expenses.map((e) => ({
    ...e,
    vehicleName: e.vehicle?.name ?? '',
  }));

  return generateCSV(flat, [
    { label: 'Date',        value: 'date' },
    { label: 'Vehicle',     value: 'vehicleName' },
    { label: 'Type',        value: 'type' },
    { label: 'Amount',      value: 'amount' },
    { label: 'Description', value: 'description' },
  ]);
}
