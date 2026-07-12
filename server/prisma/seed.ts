import { PrismaClient, UserRole, VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── Date helpers ─────────────────────────────────────────────────────────
  const in12Days  = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000);
  const in2Years  = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000);
  const oneWeekAgo  = new Date(Date.now() - 7  * 86400000);
  const yesterday   = new Date(Date.now() - 86400000);

  // ── Delete all records in FK-safe order ──────────────────────────────────
  await prisma.notification.deleteMany();
  await prisma.safetyEvent.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.tripEvent.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.oTP.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // ── Password hash ─────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  // ── Users ─────────────────────────────────────────────────────────────────
  const fleetMgr = await prisma.user.create({
    data: { email: 'fleet@transitops.com', passwordHash, name: 'Rajesh Kumar', role: UserRole.FLEET_MANAGER },
  });
  const dispatcher = await prisma.user.create({
    data: { email: 'dispatch@transitops.com', passwordHash, name: 'Ankit Sharma', role: UserRole.DISPATCHER },
  });
  await prisma.user.create({
    data: { email: 'safety@transitops.com', passwordHash, name: 'Meera Patel', role: UserRole.SAFETY_OFFICER },
  });
  await prisma.user.create({
    data: { email: 'finance@transitops.com', passwordHash, name: 'Priya Joshi', role: UserRole.FINANCIAL_ANALYST },
  });

  // ── Vehicles ──────────────────────────────────────────────────────────────
  const van01 = await prisma.vehicle.create({
    data: {
      regNumber: 'MH-04-AB-0001', name: 'Van-01', type: 'Van',
      maxCapacityKg: 1200, currentOdometer: 4800, acquisitionCost: 800000,
      status: VehicleStatus.AVAILABLE, region: 'North',
      serviceIntervalKm: 5000, lastServiceOdometer: 0,
    },
  });
  const van05 = await prisma.vehicle.create({
    data: {
      regNumber: 'MH-04-AB-0005', name: 'Van-05', type: 'Van',
      maxCapacityKg: 500, currentOdometer: 100, acquisitionCost: 500000,
      status: VehicleStatus.AVAILABLE, region: 'West',
      serviceIntervalKm: 10000, lastServiceOdometer: 0,
    },
  });
  const truck02 = await prisma.vehicle.create({
    data: {
      regNumber: 'MH-04-CD-0002', name: 'Truck-02', type: 'Truck',
      maxCapacityKg: 3000, currentOdometer: 12400, acquisitionCost: 1200000,
      status: VehicleStatus.ON_TRIP, region: 'South',
    },
  });
  const bike03 = await prisma.vehicle.create({
    data: {
      regNumber: 'MH-04-EF-0003', name: 'Bike-03', type: 'Bike',
      maxCapacityKg: 150, currentOdometer: 3200, acquisitionCost: 120000,
      status: VehicleStatus.AVAILABLE, region: 'East',
    },
  });
  await prisma.vehicle.create({
    data: {
      regNumber: 'MH-04-GH-0004', name: 'Van-04', type: 'Van',
      maxCapacityKg: 500, currentOdometer: 8900, acquisitionCost: 500000,
      status: VehicleStatus.IN_SHOP, region: 'Central',
    },
  });
  await prisma.vehicle.create({
    data: {
      regNumber: 'MH-04-IJ-0006', name: 'Van-06', type: 'Van',
      maxCapacityKg: 500, currentOdometer: 45000, acquisitionCost: 500000,
      status: VehicleStatus.RETIRED, region: 'North',
    },
  });

  // ── Drivers ───────────────────────────────────────────────────────────────
  const alex = await prisma.driver.create({
    data: {
      name: 'Alex Fernandes', licenseNumber: 'MH-DL-2021-001',
      licenseCategory: 'LMV', licenseExpiry: in2Years,
      contactNumber: '9876543210', safetyScore: 95,
      status: DriverStatus.AVAILABLE,
    },
  });
  const riya = await prisma.driver.create({
    data: {
      name: 'Riya Singh', licenseNumber: 'MH-DL-2020-002',
      licenseCategory: 'HMV', licenseExpiry: in2Years,
      contactNumber: '9876543211', safetyScore: 88,
      status: DriverStatus.ON_TRIP,
    },
  });
  const dev = await prisma.driver.create({
    data: {
      name: 'Dev Malhotra', licenseNumber: 'MH-DL-2022-003',
      licenseCategory: 'LMV', licenseExpiry: in12Days,
      contactNumber: '9876543212', safetyScore: 72,
      status: DriverStatus.AVAILABLE,
    },
  });
  await prisma.driver.create({
    data: {
      name: 'Priya Nair', licenseNumber: 'MH-DL-2019-004',
      licenseCategory: 'MCW', licenseExpiry: in2Years,
      contactNumber: '9876543213', safetyScore: 60,
      status: DriverStatus.SUSPENDED,
    },
  });
  const arjun = await prisma.driver.create({
    data: {
      name: 'Arjun Mehta', licenseNumber: 'MH-DL-2023-005',
      licenseCategory: 'LMV', licenseExpiry: in2Years,
      contactNumber: '9876543214', safetyScore: 100,
      status: DriverStatus.AVAILABLE,
    },
  });

  // ── Trips ─────────────────────────────────────────────────────────────────
  const trip1 = await prisma.trip.create({
    data: {
      vehicleId: bike03.id, driverId: arjun.id, createdById: dispatcher.id,
      source: 'Mumbai', destination: 'Pune',
      cargoWeightKg: 100, plannedDistanceKm: 150,
      actualDistanceKm: 148, startOdometer: 3052, endOdometer: 3200,
      revenue: 8500, status: TripStatus.COMPLETED,
      createdAt: twoWeeksAgo, dispatchedAt: twoWeeksAgo, completedAt: oneWeekAgo,
    },
  });
  const trip2 = await prisma.trip.create({
    data: {
      vehicleId: truck02.id, driverId: riya.id, createdById: dispatcher.id,
      source: 'Mumbai', destination: 'Nagpur',
      cargoWeightKg: 2500, plannedDistanceKm: 850,
      startOdometer: 12400, status: TripStatus.DISPATCHED,
      createdAt: yesterday, dispatchedAt: yesterday,
    },
  });
  await prisma.trip.create({
    data: {
      vehicleId: van05.id, driverId: alex.id, createdById: dispatcher.id,
      source: 'Mumbai', destination: 'Surat',
      cargoWeightKg: 450, plannedDistanceKm: 280,
      status: TripStatus.DRAFT,
    },
  });
  await prisma.trip.create({
    data: {
      vehicleId: van01.id, driverId: dev.id, createdById: dispatcher.id,
      source: 'Pune', destination: 'Nashik',
      cargoWeightKg: 800, plannedDistanceKm: 210,
      status: TripStatus.CANCELLED, createdAt: twoWeeksAgo,
    },
  });

  // ── Trip Events (audit trail for Trip 1) ──────────────────────────────────
  await prisma.tripEvent.create({
    data: {
      tripId: trip1.id, actorId: dispatcher.id,
      fromStatus: TripStatus.DRAFT, toStatus: TripStatus.DISPATCHED,
      createdAt: twoWeeksAgo,
    },
  });
  await prisma.tripEvent.create({
    data: {
      tripId: trip1.id, actorId: fleetMgr.id,
      fromStatus: TripStatus.DISPATCHED, toStatus: TripStatus.COMPLETED,
      notes: 'Delivered on time. No incidents.',
      createdAt: oneWeekAgo,
    },
  });

  // ── Maintenance Log (Van-04) ──────────────────────────────────────────────
  const van04 = await prisma.vehicle.findUnique({ where: { regNumber: 'MH-04-GH-0004' } });
  await prisma.maintenanceLog.create({
    data: {
      vehicleId: van04!.id,
      type: 'Engine Repair',
      description: 'Engine overhaul — scheduled service at 8900km',
      cost: 25000, status: MaintenanceStatus.ACTIVE,
      odometerAtService: 8900, openedAt: yesterday,
    },
  });

  // ── Fuel Logs ─────────────────────────────────────────────────────────────
  await prisma.fuelLog.create({
    data: {
      vehicleId: bike03.id, tripId: trip1.id,
      litres: 12, costPerLitre: 104, totalCost: 1248,
      odometerReading: 3200, date: oneWeekAgo,
    },
  });
  await prisma.fuelLog.create({
    data: {
      vehicleId: truck02.id, tripId: trip2.id,
      litres: 80, costPerLitre: 99, totalCost: 7920,
      odometerReading: 12400, date: yesterday,
    },
  });

  // ── Expenses ──────────────────────────────────────────────────────────────
  await prisma.expense.create({
    data: {
      vehicleId: bike03.id, tripId: trip1.id,
      type: 'Toll', amount: 350,
      description: 'Mumbai-Pune expressway toll', date: oneWeekAgo,
    },
  });
  await prisma.expense.create({
    data: {
      vehicleId: truck02.id,
      type: 'Parking', amount: 200,
      description: 'Overnight parking Nagpur', date: yesterday,
    },
  });

  // ── Safety Events ─────────────────────────────────────────────────────────
  await prisma.safetyEvent.create({
    data: {
      driverId: dev.id, delta: -15,
      reason: 'Speeding violation on NH48', createdAt: oneWeekAgo,
    },
  });
  await prisma.safetyEvent.create({
    data: {
      driverId: dev.id, delta: -13,
      reason: 'Late delivery — exceeded window by 3 hours', createdAt: twoWeeksAgo,
    },
  });
  await prisma.safetyEvent.create({
    data: {
      driverId: arjun.id, delta: 5,
      reason: 'Exemplary on-time delivery with zero incidents', createdAt: oneWeekAgo,
    },
  });

  // ── Notification (license expiry alert) ───────────────────────────────────
  await prisma.notification.create({
    data: {
      type: NotificationType.LICENSE_EXPIRY,
      title: 'License Expiring Soon',
      message: "Dev Malhotra's driving license expires in 12 days. Schedule renewal immediately.",
      metadata: {
        driverId: dev.id,
        driverName: 'Dev Malhotra',
        expiryDate: in12Days.toISOString(),
      },
    },
  });

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log('\n✅ TransitOps seed complete.\n');
  console.table([
    { Role: 'Fleet Manager',     Email: 'fleet@transitops.com',    Password: 'password123' },
    { Role: 'Dispatcher',        Email: 'dispatch@transitops.com', Password: 'password123' },
    { Role: 'Safety Officer',    Email: 'safety@transitops.com',   Password: 'password123' },
    { Role: 'Financial Analyst', Email: 'finance@transitops.com',  Password: 'password123' },
  ]);
  console.log('\nDemo highlights:');
  console.log('  - Van-01 at 4800km odometer (service interval 5000km) — will auto-trigger maintenance on trip completion');
  console.log('  - Dev Malhotra license expires in 12 days');
  console.log('  - Van-04 IN_SHOP, Van-06 RETIRED — both hidden from dispatch');
  console.log('  - Priya Nair SUSPENDED — hidden from dispatch\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
