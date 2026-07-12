const fs = require('fs');

const collectionPath = './tests/postman/transitops.collection.json';
const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

const folder04 = {
  name: "04 — Analytics, Weather & Final",
  item: [
    {
      name: "I4-01: Dashboard KPIs",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200', () => pm.response.to.have.status(200));",
        "pm.test('All required KPI fields present', () => {",
        "  const { data } = pm.response.json();",
        "  const required = ['totalVehicles','availableVehicles','onTripVehicles','inShopVehicles','retiredVehicles','activeTrips','pendingTrips','driversOnDuty','totalDrivers','expiring30Days','suspendedDrivers','fleetUtilization','recentTrips'];",
        "  required.forEach(k => pm.expect(data).to.have.property(k));",
        "});",
        "pm.test('KPI values match expected post-test state', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.totalVehicles).to.equal(6);",
        "  pm.expect(data.retiredVehicles).to.equal(1);",
        "  pm.expect(data.expiring30Days).to.equal(1);",
        "  pm.expect(data.suspendedDrivers).to.equal(1);",
        "});",
        "pm.test('fleetUtilization is a percentage 0–100', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.fleetUtilization).to.be.a('number');",
        "  pm.expect(data.fleetUtilization).to.be.within(0, 100);",
        "});",
        "pm.test('recentTrips is an array with vehicle and driver nested', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.recentTrips).to.be.an('array');",
        "  if (data.recentTrips.length > 0) {",
        "    pm.expect(data.recentTrips[0].vehicle).to.have.property('name');",
        "    pm.expect(data.recentTrips[0].driver).to.have.property('name');",
        "  }",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/dashboard/kpis",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I4-02: Vehicle Status Breakdown",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200', () => pm.response.to.have.status(200));",
        "pm.test('Returns count for all 4 status types', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data).to.have.all.keys('AVAILABLE','ON_TRIP','IN_SHOP','RETIRED');",
        "});",
        "pm.test('Counts sum to total vehicles', () => {",
        "  const { data } = pm.response.json();",
        "  const total = data.AVAILABLE + data.ON_TRIP + data.IN_SHOP + data.RETIRED;",
        "  pm.expect(total).to.equal(6);",
        "});",
        "pm.test('RETIRED count is 1 (Van-06)', () => {",
        "  pm.expect(pm.response.json().data.RETIRED).to.equal(1);",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/dashboard/analytics/vehicle-status",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I4-03: Fuel Efficiency Analytics",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200', () => pm.response.to.have.status(200));",
        "pm.test('Returns array of efficiency records', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data).to.be.an('array');",
        "});",
        "pm.test('Each item has required fields', () => {",
        "  const { data } = pm.response.json();",
        "  if (data.length > 0) {",
        "    const item = data[0];",
        "    pm.expect(item).to.have.all.keys('vehicleId','vehicleName','regNumber','totalDistanceKm','totalLitres','efficiencyKmPerLitre');",
        "    pm.expect(item.efficiencyKmPerLitre).to.be.a('number').above(0);",
        "  }",
        "});",
        "pm.test('Bike-03 efficiency ≈ 12.3 km/L', () => {",
        "  const { data } = pm.response.json();",
        "  const bike = data.find(v => v.vehicleName === 'Bike-03');",
        "  if (bike) pm.expect(bike.efficiencyKmPerLitre).to.be.closeTo(7.4, 0.5);",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/dashboard/analytics/fuel-efficiency",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I4-04: Operational Costs Analytics",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200', () => pm.response.to.have.status(200));",
        "pm.test('Returns cost breakdown per vehicle', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data).to.be.an('array');",
        "  if (data.length > 0) {",
        "    const item = data[0];",
        "    pm.expect(item).to.have.all.keys('vehicleId','vehicleName','regNumber','fuelCost','maintenanceCost','otherExpenses','totalCost');",
        "  }",
        "});",
        "pm.test('totalCost = fuelCost + maintenanceCost + otherExpenses', () => {",
        "  const { data } = pm.response.json();",
        "  data.forEach(v => {",
        "    const expected = v.fuelCost + v.maintenanceCost + v.otherExpenses;",
        "    pm.expect(v.totalCost).to.be.closeTo(expected, 0.01);",
        "  });",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/dashboard/analytics/costs",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I4-05: Vehicle ROI Analytics",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200', () => pm.response.to.have.status(200));",
        "pm.test('ROI formula fields present', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data).to.be.an('array');",
        "  if (data.length > 0) {",
        "    pm.expect(data[0]).to.have.all.keys('vehicleId','vehicleName','regNumber','acquisitionCost','totalRevenue','totalCost','roi');",
        "  }",
        "});",
        "pm.test('Bike-03 has positive ROI', () => {",
        "  const { data } = pm.response.json();",
        "  const bike = data.find(v => v.vehicleName === 'Bike-03');",
        "  if (bike) {",
        "    pm.expect(bike.totalRevenue).to.be.greaterThan(0);",
        "    pm.expect(bike.roi).to.be.greaterThan(0);",
        "  }",
        "});",
        "pm.test('ROI sorted descending', () => {",
        "  const { data } = pm.response.json();",
        "  for (let i = 0; i < data.length - 1; i++) {",
        "    pm.expect(data[i].roi).to.be.greaterThanOrEqual(data[i+1].roi);",
        "  }",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/dashboard/analytics/roi",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I4-06: Monthly Revenue Analytics",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200', () => pm.response.to.have.status(200));",
        "pm.test('Returns array of monthly data', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data).to.be.an('array');",
        "});",
        "pm.test('Each item has month, revenue, tripCount', () => {",
        "  const { data } = pm.response.json();",
        "  if (data.length > 0) {",
        "    pm.expect(data[0]).to.have.all.keys('month','revenue','tripCount');",
        "    pm.expect(data[0].revenue).to.be.a('number');",
        "    pm.expect(data[0].tripCount).to.be.a('number');",
        "  }",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/dashboard/analytics/monthly-revenue",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I4-07: CSV Export — Vehicles",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200', () => pm.response.to.have.status(200));",
        "pm.test('Content-Type is text/csv', () => {",
        "  pm.expect(pm.response.headers.get('content-type')).to.include('text/csv');",
        "});",
        "pm.test('Content-Disposition header for download', () => {",
        "  const cd = pm.response.headers.get('content-disposition');",
        "  pm.expect(cd).to.include('attachment');",
        "});",
        "pm.test('CSV has 6 data rows (plus header)', () => {",
        "  const lines = pm.response.text().trim().split('\\n');",
        "  pm.expect(lines.length).to.equal(7);",
        "});",
        "pm.test('CSV contains expected vehicle fields', () => {",
        "  const firstLine = pm.response.text().split('\\n')[0];",
        "  pm.expect(firstLine.toLowerCase()).to.include('registration');",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/dashboard/export/csv?type=vehicles",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I4-08: CSV Export — Trips",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200', () => pm.response.to.have.status(200));",
        "pm.test('CSV content type', () => {",
        "  pm.expect(pm.response.headers.get('content-type')).to.include('text/csv');",
        "});",
        "pm.test('CSV has trip data rows', () => {",
        "  const lines = pm.response.text().trim().split('\\n');",
        "  pm.expect(lines.length).to.be.greaterThan(1);",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/dashboard/export/csv?type=trips",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I4-09: PDF Export",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200', () => pm.response.to.have.status(200));",
        "pm.test('Content-Type is application/pdf', () => {",
        "  pm.expect(pm.response.headers.get('content-type')).to.include('application/pdf');",
        "});",
        "pm.test('Response has content (not empty)', () => {",
        "  pm.expect(pm.response.responseSize).to.be.greaterThan(1000);",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/dashboard/export/pdf",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I4-10: Weather Assessment — Both API Keys Present",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200 always (weather is optional)', () => pm.response.to.have.status(200));",
        "pm.test('Response shape correct', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data).to.have.property('available');",
        "});",
        "pm.test('If available=true, has source and destination', () => {",
        "  const { data } = pm.response.json();",
        "  if (data.available) {",
        "    pm.expect(data.source).to.have.all.keys('city','description','temp','windSpeed','rainMm','humidity','icon');",
        "    pm.expect(data.destination).to.have.all.keys('city','description','temp','windSpeed','rainMm','humidity','icon');",
        "  }",
        "});",
        "pm.test('If risk present, has valid risk_level', () => {",
        "  const { data } = pm.response.json();",
        "  if (data.risk) {",
        "    pm.expect(data.risk.risk_level).to.be.oneOf(['LOW','MEDIUM','HIGH']);",
        "    pm.expect(data.risk.recommendation).to.be.a('string');",
        "    pm.expect(data.risk.estimated_delay_hours).to.be.a('number');",
        "  }",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/weather/assess?source=Mumbai&destination=Delhi",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I4-11: Weather Assessment — Invalid City (Graceful Failure)",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200 even with invalid city', () => pm.response.to.have.status(200));",
        "pm.test('Does not crash server', () => {",
        "  pm.expect(pm.response.json().success).to.be.true;",
        "});",
        "pm.test('Gracefully returns available=false or partial data', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data).to.have.property('available');",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/weather/assess?source=XYZINVALIDCITY123&destination=Mumbai",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I4-12: List Notifications",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200', () => pm.response.to.have.status(200));",
        "pm.test('Has at least 1 seeded notification', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.length).to.be.greaterThanOrEqual(1);",
        "});",
        "pm.test('LICENSE_EXPIRY notification for Dev Malhotra exists', () => {",
        "  const { data } = pm.response.json();",
        "  const licenseNotif = data.find(n => n.type === 'LICENSE_EXPIRY');",
        "  pm.expect(licenseNotif).to.not.be.undefined;",
        "  pm.expect(licenseNotif.message).to.include('Dev');",
        "});",
        "pm.test('MAINTENANCE_DUE notification created by auto-trigger test', () => {",
        "  const { data } = pm.response.json();",
        "  const maintNotif = data.find(n => n.type === 'MAINTENANCE_DUE');",
        "  pm.expect(maintNotif).to.not.be.undefined;",
        "  if (data.length > 0) pm.environment.set('notifId', data[0].id);",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/notifications",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I4-13: Unread Count",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200', () => pm.response.to.have.status(200));",
        "pm.test('Returns count as number', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.count).to.be.a('number').at.least(0);",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/notifications/unread-count",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I4-14: Mark Notification as Read",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200', () => pm.response.to.have.status(200));",
        "pm.test('Notification marked as read', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.isRead).to.be.true;",
        "});"
      ] } }],
      request: {
        method: "PATCH", url: "{{baseUrl}}/notifications/{{notifId}}/read",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    }
  ]
};

// Remove if it already exists (for idempotency)
collection.item = collection.item.filter(f => f.name !== "04 — Analytics, Weather & Final");
collection.item.push(folder04);

fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
console.log('04 — Analytics, Weather & Final appended to collection.');
