import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { VehicleStatusBreakdown } from '@/types'

const CHART_COLORS = {
  AVAILABLE: '#10b981', // emerald
  ON_TRIP:   '#3b82f6', // blue
  IN_SHOP:   '#f59e0b', // amber
  RETIRED:   '#9ca3af', // gray
}

export default function FleetStatusChart({ data }: { data?: VehicleStatusBreakdown }) {
  if (!data) return null

  const chartData = [
    { name: 'Available', value: data.AVAILABLE, color: CHART_COLORS.AVAILABLE },
    { name: 'On Trip', value: data.ON_TRIP, color: CHART_COLORS.ON_TRIP },
    { name: 'In Shop', value: data.IN_SHOP, color: CHART_COLORS.IN_SHOP },
    { name: 'Retired', value: data.RETIRED, color: CHART_COLORS.RETIRED },
  ].filter(d => d.value > 0)

  return (
    <div className="w-full flex flex-col items-center">
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontWeight: 500 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        {chartData.map(entry => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs font-medium text-slate-600">{entry.name}</span>
            <span className="text-xs text-slate-400">({entry.value})</span>
          </div>
        ))}
      </div>
    </div>
  )
}
