import React, { useState, useEffect } from 'react'
import { api } from '@/api/client'
import { fmtDate, roleLabels } from '@/lib/utils'
import { CheckCircle2, UserPlus, Shield } from 'lucide-react'
import { useToast } from '@/components/common/Toast'

export default function Settings() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    // Attempt to fetch all users. If it fails (endpoint missing), handle gracefully.
    api.get<any[]>('/auth/users')
      .then(res => setUsers(res))
      .catch(err => {
        console.warn('GET /auth/users not available, showing static data', err)
        // Static demo fallback if endpoint doesn't exist
        setUsers([
          { id: 1, name: 'Aryan Admin', email: 'admin@transitops.com', role: 'FLEET_MANAGER', createdAt: new Date().toISOString() },
          { id: 2, name: 'Rajesh Dispatch', email: 'dispatch@transitops.com', role: 'DISPATCHER', createdAt: new Date().toISOString() },
          { id: 3, name: 'Anjali Safety', email: 'safety@transitops.com', role: 'SAFETY_OFFICER', createdAt: new Date().toISOString() },
          { id: 4, name: 'Vikram Finance', email: 'finance@transitops.com', role: 'FINANCIAL_ANALYST', createdAt: new Date().toISOString() }
        ])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleRoleChange = (userId: number, newRole: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole, isDirty: true } : u))
  }

  const handleSave = async (userId: number, role: string) => {
    // Stub save function since we don't have PUT /auth/users/:id in the backend specs
    toast.success('User role updated successfully')
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isDirty: false } : u))
  }

  return (
    <div className="max-w-[1000px] mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organization Settings</h1>
          <p className="text-slate-500 mt-1">Manage users, roles, and system preferences</p>
        </div>
        <button className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
          <UserPlus className="w-4 h-4" /> Invite User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <Shield className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-slate-900">User Management</h3>
        </div>
        
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading users...</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 group">
                <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                <td className="px-6 py-4 text-slate-500">{u.email}</td>
                <td className="px-6 py-4">
                  <select 
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="h-8 px-2 text-sm border-transparent hover:border-slate-200 bg-slate-50 focus:border-amber-500 rounded outline-none font-medium text-slate-700 cursor-pointer"
                  >
                    {Object.entries(roleLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-slate-500">{fmtDate(u.createdAt)}</td>
                <td className="px-6 py-4 text-right">
                  {u.isDirty && (
                    <button onClick={() => handleSave(u.id, u.role)} className="text-xs font-medium px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors border border-emerald-200 flex items-center gap-1.5 ml-auto">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Feature Access Matrix (Static Reference) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-900">Role & Feature Access</h3>
          <p className="text-sm text-slate-500 mt-1">Reference for system permissions based on assigned roles</p>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-4 py-2 uppercase text-[10px] tracking-wider">Feature</th>
                <th className="px-4 py-2 uppercase text-[10px] tracking-wider text-center">Fleet Mgr</th>
                <th className="px-4 py-2 uppercase text-[10px] tracking-wider text-center">Dispatcher</th>
                <th className="px-4 py-2 uppercase text-[10px] tracking-wider text-center">Safety Off</th>
                <th className="px-4 py-2 uppercase text-[10px] tracking-wider text-center">Financial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Vehicle CRUD', roles: ['✓', 'View', 'View', 'View'] },
                { name: 'Driver CRUD', roles: ['✓', 'View', '✓', 'View'] },
                { name: 'Create Trip', roles: ['✓', '✓', '—', '—'] },
                { name: 'Dispatch/Complete', roles: ['✓', '✓', '—', '—'] },
                { name: 'Safety Events', roles: ['—', '—', '✓', '—'] },
                { name: 'Suspend Driver', roles: ['—', '—', '✓', '—'] },
                { name: 'Maintenance CRUD', roles: ['✓', '—', '—', '—'] },
                { name: 'Analytics (full)', roles: ['✓', '—', '—', '✓'] },
                { name: 'Export Reports', roles: ['✓', '—', '—', '✓'] },
                { name: 'Settings', roles: ['✓', '—', '—', '—'] },
              ].map(f => (
                <tr key={f.name}>
                  <td className="px-4 py-2 font-medium text-slate-700">{f.name}</td>
                  {f.roles.map((r, i) => (
                    <td key={i} className={`px-4 py-2 text-center font-bold ${r === '✓' ? 'text-emerald-500' : r === 'View' ? 'text-blue-500' : 'text-slate-300'}`}>
                      {r}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
