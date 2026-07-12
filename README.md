<div align="center">
  <svg width="480" height="120" viewBox="0 0 480 120" xmlns="http://www.w3.org/2000/svg">
    <rect width="480" height="120" rx="16" fill="#0f172a" />
    <path d="M 130 45 h 40 v 25 h -40 z M 170 55 h 20 l 10 15 h -30 z M 140 75 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0 M 175 75 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linejoin="round"/>
    <text x="220" y="75" font-family="'Segoe UI', Arial, sans-serif" font-size="48" font-weight="bold" fill="#ffffff">LEVO</text>
    <text x="220" y="100" font-family="'Segoe UI', Arial, sans-serif" font-size="16" fill="#f59e0b">Smart Transport Operations Platform</text>
  </svg>
  <h1>LEVO</h1>
  <p><strong>Smart Transport Operations Platform</strong></p>
  <p>Production-grade fleet, driver, and logistics operations management — built for scale.</p>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node.js 18+" />
  <img src="https://img.shields.io/badge/PostgreSQL-14%2B-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL 14+" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License MIT" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg" alt="PRs Welcome" />
</div>

<br />

## Architecture Diagram

```svg
<svg width="700" height="400" viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', Arial, sans-serif">
  <!-- Background -->
  <rect width="700" height="400" fill="#f8fafc" />
  
  <!-- Client Box -->
  <rect x="40" y="150" width="160" height="100" rx="8" fill="#3b82f6" />
  <text x="120" y="195" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">Browser / Client</text>
  <text x="120" y="215" fill="#ffffff" font-size="12" text-anchor="middle">React + Vite (Port 5173)</text>
  
  <!-- Arrow Client -> Server -->
  <path d="M 200 200 L 260 200" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)" />
  <text x="230" y="190" fill="#64748b" font-size="11" text-anchor="middle">HTTP/REST /api proxy</text>
  
  <!-- Server Box -->
  <rect x="270" y="150" width="160" height="100" rx="8" fill="#0f172a" />
  <text x="350" y="195" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">Express API Server</text>
  <text x="350" y="215" fill="#ffffff" font-size="12" text-anchor="middle">Node.js (Port 3001)</text>

  <!-- Arrow Server -> DB -->
  <path d="M 350 250 L 350 310" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)" />
  
  <!-- Database Box -->
  <rect x="270" y="320" width="160" height="60" rx="8" fill="#10b981" />
  <text x="350" y="355" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">PostgreSQL Database</text>
  
  <!-- Arrow Server -> External -->
  <path d="M 430 200 L 490 200" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)" />
  
  <!-- External Services Box -->
  <rect x="500" y="150" width="160" height="100" rx="8" fill="#f59e0b" />
  <text x="580" y="185" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">External Services</text>
  <text x="580" y="210" fill="#ffffff" font-size="12" text-anchor="middle">- OpenWeather API</text>
  <text x="580" y="230" fill="#ffffff" font-size="12" text-anchor="middle">- Grok AI (xAI)</text>

  <!-- Arrow Server -> Cron -->
  <path d="M 410 150 L 450 110 L 490 110" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)" fill="none" />
  
  <!-- Cron Box -->
  <rect x="500" y="60" width="160" height="70" rx="8" fill="#8b5cf6" />
  <text x="580" y="85" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">node-cron</text>
  <text x="580" y="105" fill="#ffffff" font-size="11" text-anchor="middle">Daily License Check</text>
  <text x="580" y="120" fill="#ffffff" font-size="11" text-anchor="middle">Hourly Weather Alerts</text>
  
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#94a3b8" />
    </marker>
  </defs>
</svg>
```

---

## Feature Overview

| 🚛 Fleet Management | 🧑✈️ Driver Management |
|---------------------|----------------------|
| • Full Vehicle CRUD: registration, type, capacity, and cost.<br>• Real-time status tracking (AVAILABLE, ON_TRIP, IN_SHOP, RETIRED).<br>• Automated exclusion of IN_SHOP and RETIRED vehicles from dispatch.<br>• Real-time odometer and service interval tracking. | • Full Driver CRUD: licenses, contact info, and safety metrics.<br>• Dynamic statuses (AVAILABLE, ON_TRIP, OFF_DUTY, SUSPENDED).<br>• Daily cron jobs for automated 30-day license expiry warnings.<br>• Granular safety score system (0–100) with event-driven adjustments. |
| **🗺️ Trip Operations** | **🔧 Auto-Maintenance** |
| • Robust trip lifecycle state machine: DRAFT → DISPATCHED → COMPLETED.<br>• 9 strict business rules enforced atomically before any dispatch.<br>• Full immutable audit trail (TripEvent) tracking every state transition. | • Trip completion natively triggers automated vehicle service checks.<br>• Automatically flags vehicles as IN_SHOP when service thresholds are crossed.<br>• Atomic creation of MaintenanceLogs and system-wide push notifications. |
| **🌦️ Weather Intelligence** | **📊 Analytics & Exports** |
| • Seamless OpenWeather API integration for pre-dispatch conditions.<br>• Advanced risk assessment via Grok (xAI) estimating potential delays.<br>• Active trip reassessment every hour with graceful API degradation. | • Deep operational cost breakdowns: fuel, maintenance, and vehicle ROI.<br>• Comprehensive metrics for fleet utilization and monthly revenue trends.<br>• One-click raw CSV data exports and generated PDF fleet summary reports. |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | **Node.js 18+** | Runtime environment |
| | **Express 4** | Web server framework handling 40+ REST endpoints |
| | **TypeScript 5** | Type-safe backend logic and schemas |
| | **Prisma 5** | High-performance ORM abstracting database complexity |
| | **PostgreSQL 14+** | Relational database anchoring 11 core data models |
| | **JWT + bcryptjs** | httpOnly cookie authentication and secure password hashing |
| | **express-validator** | Request payload validation middleware |
| | **node-cron** | Scheduled background jobs processing |
| | **PDFKit** | Backend PDF fleet report document generation |
| | **json2csv** | High-speed CSV data exports |
| **Frontend** | **Vite 5** | Lightning-fast build tool and local dev server |
| | **React 18** | UI component library driving the entire single-page app |
| | **TypeScript 5** | Type-safe frontend language bridging API interfaces |
| | **Zustand 4** | Global state management (configured with `persist` middleware) |
| | **TanStack Query v5** | Remote server state synchronization and cache invalidation |
| | **React Hook Form + Zod** | Bulletproof form state handling and client-side validation |
| | **Radix UI** | Accessible, unstyled UI primitives powering modals and selects |
| | **Recharts** | Complex analytics charting and data visualizations |
| | **Lucide React** | Scalable, clean SVG iconography |
| | **Tailwind CSS 3** | Utility-first custom styling with brand design tokens |

---

## System Architecture & Database Schema

```svg
<svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', Arial, sans-serif">
  <rect width="800" height="500" fill="#f8fafc" />
  
  <!-- User -->
  <rect x="50" y="50" width="140" height="60" rx="4" fill="#1e293b" />
  <text x="120" y="75" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">User</text>
  <text x="120" y="95" fill="#cbd5e1" font-size="10" text-anchor="middle">id, email, role</text>
  
  <!-- OTP -->
  <rect x="250" y="50" width="100" height="50" rx="4" fill="#1e293b" />
  <text x="300" y="75" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">OTP</text>
  <text x="300" y="90" fill="#cbd5e1" font-size="10" text-anchor="middle">email, code</text>
  
  <!-- Notification -->
  <rect x="50" y="160" width="140" height="60" rx="4" fill="#1e293b" />
  <text x="120" y="185" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">Notification</text>
  <text x="120" y="205" fill="#cbd5e1" font-size="10" text-anchor="middle">id, userId, type</text>
  
  <!-- Driver -->
  <rect x="250" y="160" width="140" height="60" rx="4" fill="#1e293b" />
  <text x="320" y="185" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">Driver</text>
  <text x="320" y="205" fill="#cbd5e1" font-size="10" text-anchor="middle">id, status, licenseExpiry</text>

  <!-- SafetyEvent -->
  <rect x="50" y="270" width="140" height="60" rx="4" fill="#1e293b" />
  <text x="120" y="295" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">SafetyEvent</text>
  <text x="120" y="315" fill="#cbd5e1" font-size="10" text-anchor="middle">id, driverId, delta</text>

  <!-- Vehicle -->
  <rect x="450" y="160" width="140" height="60" rx="4" fill="#1e293b" />
  <text x="520" y="185" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">Vehicle</text>
  <text x="520" y="205" fill="#cbd5e1" font-size="10" text-anchor="middle">id, regNumber, status</text>
  
  <!-- Trip -->
  <rect x="350" y="270" width="140" height="70" rx="4" fill="#1e293b" />
  <text x="420" y="295" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">Trip</text>
  <text x="420" y="315" fill="#cbd5e1" font-size="10" text-anchor="middle">id, status, vehicleId</text>
  <text x="420" y="330" fill="#cbd5e1" font-size="10" text-anchor="middle">driverId, createdById</text>

  <!-- TripEvent -->
  <rect x="350" y="390" width="140" height="60" rx="4" fill="#1e293b" />
  <text x="420" y="415" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">TripEvent</text>
  <text x="420" y="435" fill="#cbd5e1" font-size="10" text-anchor="middle">id, tripId, from/to</text>

  <!-- MaintenanceLog -->
  <rect x="630" y="270" width="140" height="60" rx="4" fill="#1e293b" />
  <text x="700" y="295" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">MaintenanceLog</text>
  <text x="700" y="315" fill="#cbd5e1" font-size="10" text-anchor="middle">id, vehicleId, cost</text>

  <!-- FuelLog -->
  <rect x="180" y="390" width="140" height="60" rx="4" fill="#1e293b" />
  <text x="250" y="415" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">FuelLog</text>
  <text x="250" y="435" fill="#cbd5e1" font-size="10" text-anchor="middle">id, vehicleId, tripId</text>

  <!-- Expense -->
  <rect x="520" y="390" width="140" height="60" rx="4" fill="#1e293b" />
  <text x="590" y="415" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">Expense</text>
  <text x="590" y="435" fill="#cbd5e1" font-size="10" text-anchor="middle">id, vehicleId, tripId</text>

  <!-- Relationships -->
  <g stroke="#64748b" stroke-width="1.5" fill="none">
    <!-- User -> Trip -->
    <path d="M 120 110 L 120 135 L 420 135 L 420 270" />
    <!-- User -> Notification -->
    <path d="M 120 110 L 120 160" />
    <!-- Driver -> Trip -->
    <path d="M 320 220 L 320 245 L 390 245 L 390 270" />
    <!-- Vehicle -> Trip -->
    <path d="M 520 220 L 520 245 L 450 245 L 450 270" />
    <!-- Trip -> TripEvent -->
    <path d="M 420 340 L 420 390" />
    <!-- Driver -> SafetyEvent -->
    <path d="M 290 220 L 290 245 L 120 245 L 120 270" />
    <!-- Vehicle -> MaintenanceLog -->
    <path d="M 550 220 L 550 245 L 700 245 L 700 270" />
    <!-- Trip -> FuelLog -->
    <path d="M 390 340 L 390 365 L 250 365 L 250 390" />
    <!-- Trip -> Expense -->
    <path d="M 450 340 L 450 365 L 590 365 L 590 390" />
  </g>
</svg>
```

---

## Trip Lifecycle State Machine

```svg
<svg width="600" height="200" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', Arial, sans-serif">
  <rect width="600" height="200" fill="#f8fafc" />
  
  <!-- DRAFT -->
  <rect x="50" y="50" width="120" height="40" rx="20" fill="#6b7280" />
  <text x="110" y="75" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">DRAFT</text>
  
  <!-- DISPATCHED -->
  <rect x="240" y="50" width="120" height="40" rx="20" fill="#3b82f6" />
  <text x="300" y="75" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">DISPATCHED</text>

  <!-- COMPLETED -->
  <rect x="430" y="50" width="120" height="40" rx="20" fill="#10b981" stroke="#047857" stroke-width="2" />
  <text x="490" y="75" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">COMPLETED</text>
  <path d="M540 65 h4 v10 h-10 v-10 h4 v-3 a3 3 0 0 1 6 0 v3" fill="none" stroke="#ffffff" stroke-width="1.5" />

  <!-- CANCELLED -->
  <rect x="240" y="130" width="120" height="40" rx="20" fill="#ef4444" stroke="#b91c1c" stroke-width="2" />
  <text x="300" y="155" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">CANCELLED</text>
  <path d="M350 145 h4 v10 h-10 v-10 h4 v-3 a3 3 0 0 1 6 0 v3" fill="none" stroke="#ffffff" stroke-width="1.5" />

  <!-- Arrow DRAFT -> DISPATCHED -->
  <path d="M 170 70 L 230 70" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />
  <text x="200" y="60" fill="#475569" font-size="12" font-style="italic" text-anchor="middle">dispatch</text>
  
  <!-- Arrow DISPATCHED -> COMPLETED -->
  <path d="M 360 70 L 420 70" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />
  <text x="390" y="60" fill="#475569" font-size="12" font-style="italic" text-anchor="middle">complete</text>

  <!-- Arrow DRAFT -> CANCELLED -->
  <path d="M 110 90 L 110 150 L 230 150" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" fill="none" />
  <text x="170" y="145" fill="#475569" font-size="12" font-style="italic" text-anchor="middle">cancel</text>
  
  <!-- Arrow DISPATCHED -> CANCELLED -->
  <path d="M 300 90 L 300 120" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />
  <text x="325" y="110" fill="#475569" font-size="12" font-style="italic" text-anchor="middle">cancel</text>

  <text x="300" y="190" fill="#64748b" font-size="11" text-anchor="middle">Note: All transitions are atomic (prisma.$transaction)</text>
  
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
    </marker>
  </defs>
</svg>
```

---

## 9 Immutable Business Rules (Trip Lifecycle)

The LEVO Trip Engine enforces strict business integrity. To avoid race conditions in dispatch, all 9 rules are strictly re-validated at **both** trip creation AND dispatch time.

1. **R1 — Vehicle Exists:** The selected vehicle must exist in the database.
2. **R2 — Not Retired:** The vehicle cannot have a `RETIRED` status.
3. **R3 — Not In Shop:** The vehicle cannot have an `IN_SHOP` status.
4. **R4 — Not On Trip (Vehicle):** The vehicle cannot currently be assigned to another active trip (`ON_TRIP`).
5. **R5 — Driver Exists:** The assigned driver must exist in the database.
6. **R6 — Not Suspended:** The assigned driver cannot have a `SUSPENDED` status.
7. **R7 — Not On Trip (Driver):** The driver cannot currently be assigned to another active trip (`ON_TRIP`).
8. **R8 — License Active:** The driver's license must not be expired at the time of dispatch.
9. **R9 — Cargo Weight Limit:** The planned cargo weight must not exceed the vehicle's `maxCapacityKg`.
   > Example: Attempting to assign 600kg cargo on Van-05 (500kg max capacity) → `409 CARGO_OVERWEIGHT`

---

## Role-Based Access Control (RBAC)

LEVO enforces RBAC natively across both the React frontend (route guarding and component visibility) and the Express backend (strict middleware verification on every protected route).

| Feature | Fleet Manager | Dispatcher | Safety Officer | Financial Analyst |
|---------|---------------|------------|----------------|-------------------|
| Create Vehicle | ✅ | ❌ | ❌ | ❌ |
| Delete Vehicle | ✅ | ❌ | ❌ | ❌ |
| Create Trip | ✅ | ✅ | ❌ | ❌ |
| Dispatch Trip | ✅ | ✅ | ❌ | ❌ |
| Complete Trip | ✅ | ✅ | ❌ | ❌ |
| Cancel Trip | ✅ | ✅ | ❌ | ❌ |
| Log Fuel | ✅ | ✅ | ❌ | ❌ |
| Add Expense | ✅ | ✅ | ❌ | ❌ |
| Add Safety Event | ✅ | ❌ | ✅ | ❌ |
| Suspend Driver | ✅ | ❌ | ✅ | ❌ |
| Reinstate Driver | ✅ | ❌ | ✅ | ❌ |
| View Analytics | ✅ | ❌ | ❌ | ✅ |
| Export CSV/PDF | ✅ | ❌ | ❌ | ✅ |
| Manage Settings | ✅ | ❌ | ❌ | ❌ |

---

## Project Structure

```text
levo/
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts          # Axios instance + response interceptor
│   │   │   └── hooks/             # React Query hooks per domain
│   │   ├── components/
│   │   │   ├── dashboard/         # KpiCard, FleetStatusChart, CompliancePanel
│   │   │   ├── layout/            # AppLayout, Sidebar, Header
│   │   │   ├── vehicles/          # VehicleTable, VehicleForm
│   │   │   ├── drivers/           # DriverTable, DriverForm, SafetyEventModal
│   │   │   ├── trips/             # TripTable, TripForm, WeatherPanel
│   │   │   └── ui/                # Shared: Badge, Modal, Skeleton, Toast
│   │   ├── pages/                 # 12 page components
│   │   ├── store/
│   │   │   └── authStore.ts       # Zustand auth (persist)
│   │   ├── types/
│   │   │   └── index.ts           # All TypeScript interfaces
│   │   └── lib/
│   │       └── utils.ts           # cn(), fmtCurrency(), daysUntil(), etc.
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma          # 11 models, 6 enums
│   │   └── seed.ts                # Full demo dataset
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.ts          # Singleton client (hot-reload safe)
│   │   ├── jobs/
│   │   │   ├── licenseExpiry.cron.ts   # Daily 08:00 — license alerts
│   │   │   └── weatherAlert.cron.ts    # Hourly — active trip weather
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT verify (cookie + Bearer)
│   │   │   └── rbac.ts            # requireRole(...roles)
│   │   ├── routes/                # 9 Express routers
│   │   ├── services/              # Business logic per domain
│   │   └── utils/
│   │       ├── errors.ts          # AppError + factories
│   │       ├── response.ts        # sendSuccess / sendError
│   │       ├── otp.ts             # generateOTP, getOTPExpiry
│   │       ├── grok.ts            # Grok AI weather risk
│   │       ├── csvExport.ts       # json2csv exporters
│   │       └── pdfExport.ts       # PDFKit fleet summary
│   ├── src/app.ts
│   ├── src/index.ts
│   ├── package.json
│   └── tsconfig.json
│
└── package.json                   # Root — concurrently dev scripts
```

---

## Getting Started

Follow these steps to launch the entire platform stack locally. 

**Prerequisites:**
- Node.js 18+
- PostgreSQL 14+ (running natively or via Docker)
- npm or yarn

**1. Clone the repository**
```bash
git clone https://github.com/aryanf192811-eng/LEVO.git
cd LEVO
```

**2. Install dependencies**
```bash
npm install          # Install root devDependencies for concurrent execution
cd server && npm install
cd ../client && npm install
cd ..
```

**3. Configure your environment**
```bash
cp server/.env.example server/.env
# Open server/.env and edit your DATABASE_URL with your PostgreSQL credentials
```

**4. Initialize Database and Seed Data**
```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

**5. Launch Platform (Development Mode)**
```bash
# Return to the repo root to start both server (3001) and client (5173) concurrently
cd ..
npm run dev
```

Access the application in your browser at: **http://localhost:5173**

---

## Environment Variables

The `server/.env` file powers backend configurations. 

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | **Required** | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/levo` |
| `JWT_SECRET` | **Required** | Min 32 chars, keep secret | `your_super_secret_key_min_32_chars` |
| `JWT_EXPIRES_IN` | Optional | Token lifespan (default: 7d) | `7d` |
| `PORT` | Optional | API server port (default: 3001) | `3001` |
| `NODE_ENV` | Optional | Environment flag | `development` |
| `OPENWEATHER_API_KEY` | Optional | OpenWeather API for weather data | `abc123...` |
| `GROK_API_KEY` | Optional | xAI Grok for risk assessment | `xai-...` |

> ⚠️ Weather intelligence features (`OPENWEATHER_API_KEY`, `GROK_API_KEY`) are **optional**. The system degrades gracefully — trip creation and all core operations will always work seamlessly without them.

---

## Demo Credentials

The database seeding process injects realistic demo data along with 4 dedicated user accounts, allowing you to test out the distinct Role-Based Access workflows.

| Role | Email | Password | Demo Highlights |
|------|-------|----------|-----------------|
| **Fleet Manager** | `fleet@transitops.com` | `password123` | Full system access, dynamic dashboard with all operational KPIs |
| **Dispatcher** | `dispatch@transitops.com` | `password123` | Create, dispatch, and complete trips directly from the dashboard |
| **Safety Officer** | `safety@transitops.com` | `password123` | See Dev Malhotra's license expiring in 12 days flagged on the compliance panel |
| **Financial Analyst** | `finance@transitops.com` | `password123` | View exclusive Analytics tab, vehicle ROI trackers, and export CSV/PDF reports |

> 🔑 **Important Auth Note:** LEVO employs a simulated two-step OTP mechanism. After submitting your email and password, the generated 6-digit OTP code will print directly to the running server terminal output (e.g., `[DEV] OTP for fleet@transitops.com: 123456`). Enter this code in your browser to complete authentication. There is no external email service integrated.

```text
🎯 Demo Scenarios Built into Seed Data:
• Auto-Maintenance: Van-01 is pre-seeded at 4800km (service interval: 5000km). Complete any trip with it that covers >200km to instantly trigger an atomic auto-maintenance event!
• Expiring Licenses: Dev Malhotra's license natively expires in exactly 12 days — highly visible on the Safety Officer dashboard.
• Status Exclusion: Van-04 is IN_SHOP and Van-06 is RETIRED — watch them automatically filter out of the Dispatch vehicle selection dropdowns.
• Enforcement: Priya Nair is actively SUSPENDED — watch the system block any attempt to dispatch her.
• Business Rules: Try creating a new trip with a 600kg cargo load on Van-05 (which has a 500kg max capacity limit) to see a native CARGO_OVERWEIGHT violation response.
```

---

## API Reference

The backend exposes over 40+ atomic REST endpoints divided across 9 routers. 

<details>
<summary><strong>Auth (<code>/api/auth</code>)</strong></summary>

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/login` | No | — | Step 1: validate credentials, send OTP to console |
| POST | `/verify-otp` | No | — | Step 2: verify OTP, set JWT httpOnly cookie |
| POST | `/logout` | Yes | All | Clear JWT cookie |
| GET  | `/me` | Yes | All | Get current authenticated user details |

</details>

<details>
<summary><strong>Vehicles (<code>/api/vehicles</code>)</strong></summary>

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | Yes | All | List and filter all vehicles |
| GET | `/dispatchable` | Yes | All | Fetch available vehicles strictly for dispatch |
| GET | `/:id` | Yes | All | Retrieve detailed vehicle stats and relations |
| POST | `/` | Yes | Fleet Manager | Create new vehicle |
| PUT | `/:id` | Yes | Fleet Manager | Modify vehicle configuration |
| DELETE | `/:id` | Yes | Fleet Manager | Delete vehicle entirely |

</details>

<details>
<summary><strong>Drivers (<code>/api/drivers</code>)</strong></summary>

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | Yes | All | List and filter all drivers |
| GET | `/dispatchable` | Yes | All | Fetch available drivers strictly for dispatch |
| GET | `/:id` | Yes | All | Retrieve driver record and historical safety events |
| POST | `/` | Yes | Fleet Manager | Register a new driver |
| PUT | `/:id` | Yes | Fleet Manager | Update driver profile |
| DELETE | `/:id` | Yes | Fleet Manager | Delete driver |
| POST | `/:id/safety-event` | Yes | Manager, Safety | Append a safety delta altering the driver score |
| PATCH | `/:id/suspend` | Yes | Manager, Safety | Suspend driver (blocks dispatching) |
| PATCH | `/:id/reinstate` | Yes | Manager, Safety | Reinstate driver |

</details>

<details>
<summary><strong>Trips (<code>/api/trips</code>)</strong></summary>

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | Yes | All | Fetch paginated historical and active trips |
| GET | `/:id` | Yes | All | Retrieve trip audit trail and financial logs |
| POST | `/` | Yes | Manager, Dispatcher | Create a new DRAFT trip |
| PATCH | `/:id/dispatch` | Yes | Manager, Dispatcher | Transition trip to DISPATCHED |
| PATCH | `/:id/complete` | Yes | Manager, Dispatcher | Transition trip to COMPLETED (requires body: endOdometer, revenue) |
| PATCH | `/:id/cancel` | Yes | Manager, Dispatcher | Terminate trip gracefully to CANCELLED |

</details>

<details>
<summary><strong>Maintenance (<code>/api/maintenance</code>)</strong></summary>

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | Yes | All | Fetch system maintenance logs |
| POST | `/` | Yes | Fleet Manager | Manually flag a vehicle for maintenance |
| PATCH | `/:id/close` | Yes | Fleet Manager | Conclude maintenance ticket and release vehicle |

</details>

<details>
<summary><strong>Financial (<code>/api/financial</code>)</strong></summary>

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/fuel` | Yes | Manager, Dispatcher | Log volumetric refuel events |
| POST | `/expense` | Yes | Manager, Dispatcher | Record overhead vehicular expenses |

</details>

<details>
<summary><strong>Weather (<code>/api/weather</code>)</strong></summary>

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/assess` | Yes | All | Trigger OpenWeather + Grok API assessment |

</details>

<details>
<summary><strong>Notifications (<code>/api/notifications</code>)</strong></summary>

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | Yes | All | Poll user notifications |
| PATCH | `/:id/read` | Yes | All | Mark individual notification as read |
| POST | `/read-all` | Yes | All | Clear unread status globally |

</details>

<details>
<summary><strong>Dashboard & Analytics (<code>/api/dashboard</code>)</strong></summary>

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/kpis` | Yes | All | Core summary statistics |
| GET | `/analytics/fuel-efficiency` | Yes | Manager, Finance | Compute granular Km/L efficiencies |
| GET | `/analytics/operational-costs` | Yes | Manager, Finance | Total maintenance + fuel overhead metrics |
| GET | `/analytics/vehicle-roi` | Yes | Manager, Finance | Revenue versus Operational Cost analytics |
| GET | `/analytics/monthly-revenue` | Yes | Manager, Finance | Temporal SQL grouping of historical profit |
| GET | `/export/csv` | Yes | Manager, Finance | Generate and download raw database dumps |
| GET | `/export/pdf` | Yes | Manager, Finance | Compile professional PDFKit summary |

</details>

---

## Auto-Maintenance Logic

LEVO automates routine vehicle health compliance by intercepting trip completion events in the backend and evaluating the newly uploaded odometers against configured service intervals.

If a vehicle crosses its service threshold, the system wraps an entire cascading state adjustment inside a single, strictly atomic `prisma.$transaction`. 

**Concrete Worked Example:**
```text
Van-01 Configuration:
  currentOdometer:      4800 km
  serviceIntervalKm:    5000 km
  lastServiceOdometer:  0 km

A dispatcher completes a trip with Van-01, passing endOdometer = 5100 km:
  kmSinceService = 5100 - 0 = 5100 km
  threshold      = 5000 km
  needsMaintenance = 5100 >= 5000 → TRUE

Atomic Prisma transaction executes the following instantly:
  1. Updates the Trip status → COMPLETED
  2. Updates Van-01 status → IN_SHOP (Immediately blocks future dispatch)
  3. Updates Van-01.lastServiceOdometer = 5100
  4. Releases the Driver status → AVAILABLE
  5. Injects a TripEvent with notes: "Auto-maintenance triggered at 5100km"
  6. Generates a new MaintenanceLog (isAutoTriggered: true)
  7. Broadcasts a system Notification (type: MAINTENANCE_DUE) to all Fleet Managers
```
> **Note:** If *any* step in the chain fails (e.g. database disconnect), the entire transaction rolls back. The vehicle never ends up in a fractured or inconsistent state.

---

## Intelligent Weather Risk Assessment

Logistics optimization requires predicting routing problems before they happen. LEVO provides an optional AI-driven weather analysis pipeline:

**The Assessment Flow:**
```text
User selects Source (Mumbai) + Destination (Delhi) in Trip Form
    ↓
Frontend calls GET /api/weather/assess?source=Mumbai&destination=Delhi
    ↓
Backend fires Promise.all([getWeather(Mumbai), getWeather(Delhi)]) via OpenWeather
    ↓
Backend formats the JSON array and proxies it securely to Grok (xAI)
    ↓
Grok evaluates wind speeds, rainfall density, and visibility against routing algorithms
    ↓
Returns parsed response: { risk_level: "HIGH", estimated_delay_hours: 3, recommendation: "...", proceed: false }
    ↓
Frontend dynamically renders risk panel warnings, allowing dispatchers to adapt
```

**Graceful Degradation:**
The platform is designed to be highly resilient. Missing API keys never crash the client or block critical dispatch logic.
- If `OPENWEATHER_API_KEY` is missing: Returns `{ available: false }` (No error thrown).
- If `OPENWEATHER_API_KEY` is present but `GROK_API_KEY` is missing: Returns raw weather data with `{ risk: null }` (Weather UI populates, AI assessment is hidden).
- If both are missing: Trip creation continues entirely unaffected.

---

## Analytics & Exports

LEVO empowers Financial Analysts and Fleet Managers with real-time operational visibility. 

Available API endpoints compute deep aggregations directly at the database level:
- **Vehicle ROI**: Tracks exact profitability via `(Revenue - (Fuel + Maintenance)) / AcquisitionCost × 100`
- **Fleet Utilization**: Represents total uptime via `onTripVehicles / (totalVehicles - retiredVehicles) × 100`
- **Fuel Efficiency**: Aggregates all linked refuel logs to construct true historical `Km/L` ratios.

**Data Exports:**
- **CSV Data Dumps:** The system utilizes `json2csv` to instantly generate and pipe raw Excel-ready datasets for Vehicles, Trips, and Expenses. (`GET /api/dashboard/export/csv?type=trips`)
- **PDF Fleet Summaries:** The `GET /api/dashboard/export/pdf` route generates a professional backend PDF file using `PDFKit`. The document downloads directly as `levo-fleet-summary.pdf` and contains polished sections detailing Fleet KPIs, Top 3 Fuel-Efficient Vehicles, and Vehicle ROI tables complete with timestamped footers.

---

## UI Layout Mockup

```svg
<svg width="700" height="400" viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', Arial, sans-serif">
  <!-- Background Base -->
  <rect width="700" height="400" fill="#f8fafc" />
  
  <!-- Sidebar -->
  <rect width="200" height="400" fill="#0f172a" />
  <rect x="20" y="20" width="30" height="30" rx="4" fill="#f59e0b" />
  <text x="60" y="42" fill="#ffffff" font-size="16" font-weight="bold">LEVO</text>
  
  <rect x="10" y="80" width="180" height="40" rx="8" fill="#1e293b" />
  <text x="45" y="105" fill="#f8fafc" font-size="14">Dashboard</text>
  <text x="45" y="145" fill="#94a3b8" font-size="14">Fleet</text>
  <text x="45" y="185" fill="#94a3b8" font-size="14">Drivers</text>
  <text x="45" y="225" fill="#94a3b8" font-size="14">Trips</text>
  <text x="45" y="265" fill="#94a3b8" font-size="14">Maintenance</text>
  
  <!-- Header Bar -->
  <rect x="200" y="0" width="500" height="56" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
  <text x="230" y="35" fill="#0f172a" font-size="18" font-weight="bold">Dashboard Overview</text>
  <circle cx="650" cy="28" r="10" fill="#f1f5f9" />
  <circle cx="680" cy="28" r="12" fill="#3b82f6" />
  
  <!-- Content Area - KPI Row -->
  <rect x="220" y="80" width="105" height="80" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
  <text x="235" y="110" fill="#64748b" font-size="12">Total Fleet</text>
  <text x="235" y="135" fill="#0f172a" font-size="22" font-weight="bold">24</text>
  
  <rect x="340" y="80" width="105" height="80" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
  <text x="355" y="110" fill="#64748b" font-size="12">Active Trips</text>
  <text x="355" y="135" fill="#0f172a" font-size="22" font-weight="bold">8</text>

  <rect x="460" y="80" width="105" height="80" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
  <text x="475" y="110" fill="#64748b" font-size="12">In Shop</text>
  <text x="475" y="135" fill="#ef4444" font-size="22" font-weight="bold">3</text>
  
  <rect x="580" y="80" width="100" height="80" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
  <text x="595" y="110" fill="#64748b" font-size="12">Utilized</text>
  <text x="595" y="135" fill="#10b981" font-size="22" font-weight="bold">86%</text>

  <!-- Content Area - 2 Columns -->
  <!-- Left Panel: Table -->
  <rect x="220" y="180" width="280" height="190" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
  <text x="240" y="210" fill="#0f172a" font-size="14" font-weight="bold">Recent Dispatches</text>
  <rect x="240" y="230" width="240" height="30" rx="4" fill="#f8fafc" />
  <rect x="240" y="270" width="240" height="30" rx="4" fill="#f8fafc" />
  <rect x="240" y="310" width="240" height="30" rx="4" fill="#f8fafc" />
  <rect x="240" y="350" width="240" height="30" rx="4" fill="#f8fafc" />

  <!-- Right Panel: Chart -->
  <rect x="520" y="180" width="160" height="190" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
  <text x="540" y="210" fill="#0f172a" font-size="14" font-weight="bold">Fleet Status</text>
  <circle cx="600" cy="285" r="45" fill="none" stroke="#e2e8f0" stroke-width="20" />
  <path d="M 600 240 A 45 45 0 0 1 645 285" fill="none" stroke="#10b981" stroke-width="20" />
  <path d="M 645 285 A 45 45 0 0 1 600 330" fill="none" stroke="#3b82f6" stroke-width="20" />
</svg>
```

---

## Scheduled Background Jobs

The platform leverages `node-cron` to autonomously audit platform state without user interaction.

| Job | Schedule | Trigger Logic |
|---|---|---|
| **License Expiry Check** | Daily at 08:00 | `cron.schedule('0 8 * * *', ...)` |
| **Weather Alert Analysis** | Every hour | `cron.schedule('0 * * * *', ...)` |

**License Expiry Logic:**
1. Scans the database for all drivers possessing a `licenseExpiry` date ≤ 30 days from the current timestamp (excludes already SUSPENDED drivers).
2. Generates a targeted `LICENSE_EXPIRY` notification for Safety Officers.
3. Suppresses duplicate spam by deduplicating notifications via `metadata.driverId` and creation date.

**Weather Alert Logic:**
1. Isolates all currently active trips (status = `DISPATCHED`).
2. Re-assesses the live weather conditions for each trip's dynamic source and destination.
3. Automatically updates the `weatherRiskLevel` and `weatherRec` metadata directly on the trip record.
4. If a trip's risk transitions to `HIGH`, the system instantly broadcasts a `WEATHER_ALERT` notification to Dispatchers. (Features a 4-hour cooldown suppression rule per trip to avoid notification fatigue).

---

## License

MIT License
Copyright (c) 2025 LEVO
