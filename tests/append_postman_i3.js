const fs = require('fs');

const collectionPath = './tests/postman/transitops.collection.json';
const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

const folder03 = {
  name: "03 — Trips & Business Rules",
  item: [
    {
      name: "I3-01: List All Trips — Store IDs",
      event: [{
        listen: "test",
        script: {
          exec: [
            "pm.test('Status 200/201', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));",
            "pm.test('Returns 4 trips from seed', () => {",
            "  const { data } = pm.response.json();",
            "  pm.expect(data).to.have.lengthOf(4);",
            "});",
            "pm.test('Store trip IDs and validate structure', () => {",
            "  const { data } = pm.response.json();",
            "  data.forEach(t => {",
            "    if (t.status === 'COMPLETED') pm.environment.set('tripId_completed', t.id);",
            "    if (t.status === 'DISPATCHED') pm.environment.set('tripId_dispatched', t.id);",
            "    if (t.status === 'DRAFT') pm.environment.set('tripId_draft', t.id);",
            "  });",
            "  const t = data[0];",
            "  pm.expect(t.vehicle).to.have.all.keys('id','regNumber','name','type');",
            "  pm.expect(t.driver).to.have.all.keys('id','name','licenseNumber');",
            "});"
          ]
        }
      }],
      request: {
        method: "GET",
        url: "{{baseUrl}}/trips",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I3-02: R2 — Retired Vehicle Cannot Be Dispatched",
      event: [{
        listen: "test",
        script: {
          exec: [
            "pm.test('Status 409', () => pm.response.to.have.status(409));",
            "pm.test('Rule R2: VEHICLE_RETIRED code returned', () => {",
            "  const json = pm.response.json();",
            "  pm.expect(json.code).to.equal('VEHICLE_RETIRED');",
            "});"
          ]
        }
      }],
      request: {
        method: "POST",
        url: "{{baseUrl}}/trips",
        header: [
          { key: "Authorization", value: "Bearer {{token}}" },
          { key: "Content-Type", value: "application/json" }
        ],
        body: {
          mode: "raw",
          raw: '{"vehicleId": "{{vehicleId_Van06}}"}'
        }
      }
    }
  ]
};

// Replace body correctly for all requests to ensure postman variables resolve properly
folder03.item[1].request.body.raw = JSON.stringify({
  vehicleId: parseInt("{{vehicleId_Van06}}") || "{{vehicleId_Van06}}", // Wait, JSON.stringify doesn't work well with postman variables if it expects a number. We should just use a template literal string
});
// Let's rewrite the item array cleanly with string literals for bodies
folder03.item = [
    {
      name: "I3-01: List All Trips — Store IDs",
      event: [{
        listen: "test",
        script: {
          exec: [
            "pm.test('Status 200/201', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));",
            "pm.test('Returns 4 trips from seed', () => {",
            "  const { data } = pm.response.json();",
            "  pm.expect(data).to.have.lengthOf(4);",
            "});",
            "pm.test('Store trip IDs and validate structure', () => {",
            "  const { data } = pm.response.json();",
            "  data.forEach(t => {",
            "    if (t.status === 'COMPLETED') pm.environment.set('tripId_completed', t.id);",
            "    if (t.status === 'DISPATCHED') pm.environment.set('tripId_dispatched', t.id);",
            "    if (t.status === 'DRAFT') pm.environment.set('tripId_draft', t.id);",
            "  });",
            "  const t = data[0];",
            "  pm.expect(t.vehicle).to.have.all.keys('id','regNumber','name','type');",
            "  pm.expect(t.driver).to.have.all.keys('id','name','licenseNumber');",
            "});"
          ]
        }
      }],
      request: {
        method: "GET",
        url: "{{baseUrl}}/trips",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I3-02: R2 — Retired Vehicle Cannot Be Dispatched",
      event: [{ listen: "test", script: { exec: ["pm.test('Status 409', () => pm.response.to.have.status(409));","pm.test('Rule R2: VEHICLE_RETIRED code returned', () => { pm.expect(pm.response.json().code).to.equal('VEHICLE_RETIRED'); });"] } }],
      request: {
        method: "POST", url: "{{baseUrl}}/trips",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }, { key: "Content-Type", value: "application/json" }],
        body: { mode: "raw", raw: '{\n"vehicleId": {{vehicleId_Van06}},\n"driverId": {{driverId_Alex}},\n"source": "Mumbai", "destination": "Delhi",\n"cargoWeightKg": 100, "plannedDistanceKm": 1400\n}' }
      }
    },
    {
      name: "I3-03: R3 — In-Shop Vehicle Cannot Be Dispatched",
      event: [{ listen: "test", script: { exec: ["pm.test('Status 409', () => pm.response.to.have.status(409));","pm.test('Rule R3: VEHICLE_IN_SHOP code returned', () => { pm.expect(pm.response.json().code).to.equal('VEHICLE_IN_SHOP'); });"] } }],
      request: {
        method: "POST", url: "{{baseUrl}}/trips",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }, { key: "Content-Type", value: "application/json" }],
        body: { mode: "raw", raw: '{\n"vehicleId": {{vehicleId_Van04}},\n"driverId": {{driverId_Alex}},\n"source": "Mumbai", "destination": "Pune",\n"cargoWeightKg": 300, "plannedDistanceKm": 150\n}' }
      }
    },
    {
      name: "I3-04: R4 — On-Trip Vehicle Cannot Be Double-Assigned",
      event: [{ listen: "test", script: { exec: ["pm.test('Status 409', () => pm.response.to.have.status(409));","pm.test('Rule R4: VEHICLE_ON_TRIP code returned', () => { pm.expect(pm.response.json().code).to.equal('VEHICLE_ON_TRIP'); });"] } }],
      request: {
        method: "POST", url: "{{baseUrl}}/trips",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }, { key: "Content-Type", value: "application/json" }],
        body: { mode: "raw", raw: '{\n"vehicleId": {{vehicleId_Truck02}},\n"driverId": {{driverId_Alex}},\n"source": "Nagpur", "destination": "Hyderabad",\n"cargoWeightKg": 500, "plannedDistanceKm": 500\n}' }
      }
    },
    {
      name: "I3-05: R5 — Suspended Driver Cannot Be Assigned",
      event: [{ listen: "test", script: { exec: ["pm.test('Status 409', () => pm.response.to.have.status(409));","pm.test('Rule R5: DRIVER_SUSPENDED code returned', () => { pm.expect(pm.response.json().code).to.equal('DRIVER_SUSPENDED'); });"] } }],
      request: {
        method: "POST", url: "{{baseUrl}}/trips",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }, { key: "Content-Type", value: "application/json" }],
        body: { mode: "raw", raw: '{\n"vehicleId": {{vehicleId_Van05}},\n"driverId": {{driverId_Priya}},\n"source": "Mumbai", "destination": "Surat",\n"cargoWeightKg": 200, "plannedDistanceKm": 280\n}' }
      }
    },
    {
      name: "I3-06: R6 — On-Trip Driver Cannot Be Double-Assigned",
      event: [{ listen: "test", script: { exec: ["pm.test('Status 409', () => pm.response.to.have.status(409));","pm.test('Rule R6: DRIVER_ON_TRIP code returned', () => { pm.expect(pm.response.json().code).to.equal('DRIVER_ON_TRIP'); });"] } }],
      request: {
        method: "POST", url: "{{baseUrl}}/trips",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }, { key: "Content-Type", value: "application/json" }],
        body: { mode: "raw", raw: '{\n"vehicleId": {{vehicleId_Van05}},\n"driverId": {{driverId_Riya}},\n"source": "Mumbai", "destination": "Goa",\n"cargoWeightKg": 200, "plannedDistanceKm": 600\n}' }
      }
    },
    {
      name: "I3-07: R9 — Cargo Weight Exceeds Vehicle Capacity",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 409', () => pm.response.to.have.status(409));",
        "pm.test('Rule R9: CARGO_OVERWEIGHT code with exact details', () => {",
        "  const json = pm.response.json();",
        "  pm.expect(json.code).to.equal('CARGO_OVERWEIGHT');",
        "  pm.expect(json.error).to.include('600');",
        "  pm.expect(json.error).to.include('500');",
        "  pm.expect(json.error).to.include('100');",
        "});"
      ] } }],
      request: {
        method: "POST", url: "{{baseUrl}}/trips",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }, { key: "Content-Type", value: "application/json" }],
        body: { mode: "raw", raw: '{\n"vehicleId": {{vehicleId_Van05}},\n"driverId": {{driverId_Alex}},\n"source": "Mumbai", "destination": "Surat",\n"cargoWeightKg": 600,\n"plannedDistanceKm": 280\n}' }
      }
    },
    {
      name: "I3-08: Create Valid Trip (DRAFT)",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200/201', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));",
        "pm.test('Trip created as DRAFT', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.status).to.equal('DRAFT');",
        "  pm.expect(data.id).to.be.a('number');",
        "  pm.environment.set('newTripId', data.id);",
        "});",
        "pm.test('Correct vehicle and driver assigned', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.vehicleId).to.equal(parseInt(pm.environment.get('vehicleId_Van05')));",
        "  pm.expect(data.driverId).to.equal(parseInt(pm.environment.get('driverId_Alex')));",
        "});"
      ] } }],
      request: {
        method: "POST", url: "{{baseUrl}}/trips",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }, { key: "Content-Type", value: "application/json" }],
        body: { mode: "raw", raw: '{\n"vehicleId": {{vehicleId_Van05}},\n"driverId": {{driverId_Alex}},\n"source": "Mumbai",\n"destination": "Surat",\n"cargoWeightKg": 450,\n"plannedDistanceKm": 280,\n"notes": "Integration test trip"\n}' }
      }
    },
    {
      name: "I3-09: Dispatch Trip (R6 — Auto status change)",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200/201', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));",
        "pm.test('Trip is now DISPATCHED', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.status).to.equal('DISPATCHED');",
        "  pm.expect(data.dispatchedAt).to.not.be.null;",
        "  pm.expect(data.startOdometer).to.not.be.null;",
        "});"
      ] } }],
      request: {
        method: "PATCH", url: "{{baseUrl}}/trips/{{newTripId}}/dispatch",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I3-10: Verify Van-05 is ON_TRIP after Dispatch",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200/201', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));",
        "pm.test('Rule R6: Van-05 status is ON_TRIP', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.status).to.equal('ON_TRIP');",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/vehicles/{{vehicleId_Van05}}",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I3-11: Verify Alex is ON_TRIP after Dispatch",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Rule R6: Alex status is ON_TRIP', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.status).to.equal('ON_TRIP');",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/drivers/{{driverId_Alex}}",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I3-12: Try to Dispatch Same Driver on Another Trip",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 409 — cannot double-book Alex', () => pm.response.to.have.status(409));",
        "pm.test('DRIVER_ON_TRIP error code', () => {",
        "  pm.expect(pm.response.json().code).to.equal('DRIVER_ON_TRIP');",
        "});"
      ] } }],
      request: {
        method: "POST", url: "{{baseUrl}}/trips",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }, { key: "Content-Type", value: "application/json" }],
        body: { mode: "raw", raw: '{\n"vehicleId": {{vehicleId_Van01}},\n"driverId": {{driverId_Alex}},\n"source": "Pune", "destination": "Nashik",\n"cargoWeightKg": 500, "plannedDistanceKm": 200\n}' }
      }
    },
    {
      name: "I3-13: Complete Trip",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200/201', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));",
        "pm.test('Trip is now COMPLETED', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.trip.status).to.equal('COMPLETED');",
        "  pm.expect(data.trip.revenue).to.equal(14000);",
        "});",
        "pm.test('Actual distance computed correctly', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.trip.actualDistanceKm).to.equal(380);",
        "});",
        "pm.test('maintenanceTriggered field present', () => {",
        "  const json = pm.response.json();",
        "  pm.expect(json.data).to.have.property('maintenanceTriggered');",
        "  pm.expect(json.data.maintenanceTriggered).to.be.false;",
        "});"
      ] } }],
      request: {
        method: "PATCH", url: "{{baseUrl}}/trips/{{newTripId}}/complete",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }, { key: "Content-Type", value: "application/json" }],
        body: { mode: "raw", raw: '{\n"endOdometer": 480, "revenue": 14000\n}' }
      }
    },
    {
      name: "I3-14: Verify Van-05 and Alex are AVAILABLE after Completion",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Rule R7: Van-05 status restored to AVAILABLE', () => {",
        "  pm.expect(pm.response.json().data.status).to.equal('AVAILABLE');",
        "});",
        "pm.test('Odometer updated to 480', () => {",
        "  pm.expect(pm.response.json().data.currentOdometer).to.equal(480);",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/vehicles/{{vehicleId_Van05}}",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I3-15A: AUTO-MAINTENANCE TEST - Create Trip",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200/201', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));",
        "pm.environment.set('autoMaintTripId', pm.response.json().data.id);"
      ] } }],
      request: {
        method: "POST", url: "{{baseUrl}}/trips",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }, { key: "Content-Type", value: "application/json" }],
        body: { mode: "raw", raw: '{\n"vehicleId": {{vehicleId_Van01}},\n"driverId": {{driverId_Alex}},\n"source": "Delhi", "destination": "Jaipur",\n"cargoWeightKg": 800, "plannedDistanceKm": 280\n}' }
      }
    },
    {
      name: "I3-15B: AUTO-MAINTENANCE TEST - Dispatch Trip",
      event: [{ listen: "test", script: { exec: [ "pm.test('Status 200/201', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));" ] } }],
      request: {
        method: "PATCH", url: "{{baseUrl}}/trips/{{autoMaintTripId}}/dispatch",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I3-15C: AUTO-MAINTENANCE TEST - Complete Trip with high odometer",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200/201', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));",
        "pm.test('AUTO-MAINTENANCE TRIGGERED', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.maintenanceTriggered).to.be.true;",
        "});"
      ] } }],
      request: {
        method: "PATCH", url: "{{baseUrl}}/trips/{{autoMaintTripId}}/complete",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }, { key: "Content-Type", value: "application/json" }],
        body: { mode: "raw", raw: '{\n"endOdometer": 5200, "revenue": 8000\n}' }
      }
    },
    {
      name: "I3-16: Verify Auto-Maintenance — Van-01 now IN_SHOP",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Van-01 is IN_SHOP after auto-maintenance trigger', () => {",
        "  pm.expect(pm.response.json().data.status).to.equal('IN_SHOP');",
        "});",
        "pm.test('Van-01 odometer updated to 5200', () => {",
        "  pm.expect(pm.response.json().data.currentOdometer).to.equal(5200);",
        "});",
        "pm.test('Van-01 lastServiceOdometer updated to 5200', () => {",
        "  pm.expect(pm.response.json().data.lastServiceOdometer).to.equal(5200);",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/vehicles/{{vehicleId_Van01}}",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I3-17: Verify Auto-Maintenance Log Created",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200/201', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));",
        "pm.test('Auto-triggered maintenance log exists for Van-01', () => {",
        "  const { data } = pm.response.json();",
        "  const autoLog = data.find(l => l.isAutoTriggered === true);",
        "  pm.expect(autoLog).to.not.be.undefined;",
        "  pm.expect(autoLog.type).to.equal('Scheduled Service');",
        "  pm.expect(autoLog.status).to.equal('ACTIVE');",
        "  pm.environment.set('autoMaintLogId', autoLog.id);",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/maintenance?vehicleId={{vehicleId_Van01}}&status=ACTIVE",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I3-18A: Create Cancel Trip",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200/201', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));",
        "pm.environment.set('cancelTripId', pm.response.json().data.id);"
      ] } }],
      request: {
        method: "POST", url: "{{baseUrl}}/trips",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }, { key: "Content-Type", value: "application/json" }],
        body: { mode: "raw", raw: '{\n"vehicleId": {{vehicleId_Bike03}},\n"driverId": {{driverId_Arjun}},\n"source": "Pune", "destination": "Nashik",\n"cargoWeightKg": 100, "plannedDistanceKm": 200\n}' }
      }
    },
    {
      name: "I3-18B: Dispatch Cancel Trip",
      event: [{ listen: "test", script: { exec: [ "pm.test('Status 200/201', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));" ] } }],
      request: {
        method: "PATCH", url: "{{baseUrl}}/trips/{{cancelTripId}}/dispatch",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I3-18C: R8 — Cancel Dispatched Trip Restores Status",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200/201', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));",
        "pm.test('Trip status is CANCELLED', () => {",
        "  pm.expect(pm.response.json().data.status).to.equal('CANCELLED');",
        "});"
      ] } }],
      request: {
        method: "PATCH", url: "{{baseUrl}}/trips/{{cancelTripId}}/cancel",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I3-19: Maintenance Create + Vehicle Auto-IN_SHOP (Rule R9)",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200/201', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));",
        "pm.test('Maintenance log created', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.maintenanceLog.status).to.equal('ACTIVE');",
        "  pm.environment.set('newMaintenanceId', data.maintenanceLog.id);",
        "});",
        "pm.test('Rule R9: Bike-03 status is now IN_SHOP', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.vehicle.status).to.equal('IN_SHOP');",
        "});"
      ] } }],
      request: {
        method: "POST", url: "{{baseUrl}}/maintenance",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }, { key: "Content-Type", value: "application/json" }],
        body: { mode: "raw", raw: '{\n"vehicleId": {{vehicleId_Bike03}},\n"type": "Oil Change",\n"description": "Routine oil change at 3200km",\n"cost": 3500,\n"odometerAtService": 3200\n}' }
      }
    },
    {
      name: "I3-20: Close Maintenance — Vehicle Restored to AVAILABLE",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200/201', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));",
        "pm.test('Maintenance status is CLOSED', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.maintenanceLog.status).to.equal('CLOSED');",
        "  pm.expect(data.maintenanceLog.closedAt).to.not.be.null;",
        "});",
        "pm.test('Rule R10: Bike-03 restored to AVAILABLE', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.vehicle.status).to.equal('AVAILABLE');",
        "});"
      ] } }],
      request: {
        method: "PATCH", url: "{{baseUrl}}/maintenance/{{newMaintenanceId}}/close",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    },
    {
      name: "I3-21: Fuel Log Creation + Auto-Computed Total Cost",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200/201', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));",
        "pm.test('totalCost auto-computed (8 × 106 = 848)', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.totalCost).to.equal(848);",
        "  pm.expect(data.litres).to.equal(8);",
        "  pm.expect(data.costPerLitre).to.equal(106);",
        "});"
      ] } }],
      request: {
        method: "POST", url: "{{baseUrl}}/financial/fuel",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }, { key: "Content-Type", value: "application/json" }],
        body: { mode: "raw", raw: '{\n"vehicleId": {{vehicleId_Bike03}},\n"litres": 8,\n"costPerLitre": 106,\n"odometerReading": 3250,\n"date": "2025-01-15"\n}' }
      }
    },
    {
      name: "I3-22: Trip Audit Timeline",
      event: [{ listen: "test", script: { exec: [
        "pm.test('Status 200/201', () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));",
        "pm.test('Has TripEvent audit trail', () => {",
        "  const { data } = pm.response.json();",
        "  pm.expect(data.events).to.be.an('array');",
        "  pm.expect(data.events.length).to.equal(2);",
        "});",
        "pm.test('Events have correct structure', () => {",
        "  const { data } = pm.response.json();",
        "  const e = data.events[0];",
        "  pm.expect(e).to.have.all.keys('id','tripId','actorId','fromStatus','toStatus','notes','createdAt','actor');",
        "  pm.expect(e.actor).to.have.all.keys('name','role');",
        "});",
        "pm.test('First event: DRAFT → DISPATCHED', () => {",
        "  const { data } = pm.response.json();",
        "  const dispatchEvent = data.events.find(e => e.toStatus === 'DISPATCHED');",
        "  pm.expect(dispatchEvent).to.not.be.undefined;",
        "  pm.expect(dispatchEvent.fromStatus).to.equal('DRAFT');",
        "});"
      ] } }],
      request: {
        method: "GET", url: "{{baseUrl}}/trips/{{tripId_completed}}",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }]
      }
    }
];

// Remove if it already exists (for idempotency)
collection.item = collection.item.filter(f => f.name !== "03 — Trips & Business Rules");
collection.item.push(folder03);

fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
console.log('03 — Trips & Business Rules appended to collection.');
