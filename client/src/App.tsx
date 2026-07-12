import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'

// Pages — will be created in F3–F11
// Import them here with lazy loading to avoid errors until they exist
import Login       from '@/pages/Login'
import AppLayout   from '@/components/layout/AppLayout'
import Dashboard   from '@/pages/Dashboard'
import Vehicles    from '@/pages/Vehicles'
import VehicleDetail from '@/pages/VehicleDetail'
import Drivers     from '@/pages/Drivers'
import DriverDetail from '@/pages/DriverDetail'
import Trips       from '@/pages/Trips'
import TripDetail  from '@/pages/TripDetail'
import Maintenance from '@/pages/Maintenance'
import FuelExpenses from '@/pages/FuelExpenses'
import Analytics   from '@/pages/Analytics'
import Settings    from '@/pages/Settings'

const queryClient = new QueryClient({
defaultOptions: {
queries: {
retry: 1,
staleTime: 30_000,          // 30s stale time
refetchOnWindowFocus: true,
},
},
})

// Protected route wrapper
function Protected({ children }: { children: React.ReactNode }) {
const isAuthenticated = useAuthStore(s => s.isAuthenticated)
if (!isAuthenticated) return <Navigate to="/login" replace />
return <>{children}</>
}

// Role guard — redirects if user doesn't have required role
function RoleGuard({ roles, children }: { roles: string[]; children: React.ReactNode }) {
const user = useAuthStore(s => s.user)
if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
return <>{children}</>
}

import { ToastProvider } from '@/components/common/Toast'

export default function App() {
const checkAuth = useAuthStore(s => s.checkAuth)

useEffect(() => {
checkAuth()  // Verify JWT cookie on app load / refresh
}, [checkAuth])

return (
<QueryClientProvider client={queryClient}>
  <ToastProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Protected><AppLayout /></Protected>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"   element={<Dashboard />} />
          <Route path="vehicles"    element={<Vehicles />} />
          <Route path="vehicles/:id" element={<VehicleDetail />} />
          <Route path="drivers"     element={<Drivers />} />
          <Route path="drivers/:id"  element={<DriverDetail />} />
          <Route path="trips"       element={<Trips />} />
          <Route path="trips/:id"   element={<TripDetail />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="fuel-expenses" element={<FuelExpenses />} />
          <Route path="analytics"   element={<Analytics />} />
          <Route path="settings"    element={
            <RoleGuard roles={['FLEET_MANAGER']}>
              <Settings />
            </RoleGuard>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </ToastProvider>
</QueryClientProvider>

)
}
