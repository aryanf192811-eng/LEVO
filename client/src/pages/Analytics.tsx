import { useState } from 'react'
import { Download, FileText, Loader2, TrendingUp, Activity, IndianRupee, PieChart } from 'lucide-react'
import { 
  useKPIs, 
  useFuelEfficiency, 
  useOperationalCosts, 
  useMonthlyRevenue, 
  useVehicleROI 
} from '@/api/hooks/useAnalytics'
import { api } from '@/api/client'
import { fmtCurrency, fmtNumber } from '@/lib/utils'

import FuelEfficiencyChart from '@/components/analytics/FuelEfficiencyChart'
import { CostBreakdownChart, MonthlyRevenueChart } from '@/components/analytics/CostBreakdownChart'
import ROITable from '@/components/analytics/ROITable'

export default function Analytics() {
  const { data: kpis } = useKPIs()
  const { data: fuelEff = [] } = useFuelEfficiency()
  const { data: opCosts = [] } = useOperationalCosts()
  const { data: monthlyRev = [] } = useMonthlyRevenue()
  const { data: roiData = [] } = useVehicleROI()

  const [downloadingPDF, setDownloadingPDF] = useState(false)

  const handlePDFDownload = async () => {
    try {
      setDownloadingPDF(true)
      const blob = await api.download('/dashboard/export/pdf')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'transitops-fleet-summary.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Error downloading PDF report')
    } finally {
      setDownloadingPDF(false)
    }
  }

  // Compute Top KPIs
  const avgFuelEfficiency = fuelEff.length > 0 
    ? fuelEff.reduce((s, item) => s + item.efficiencyKmPerLitre, 0) / fuelEff.length 
    : 0

  const totalOpCost = opCosts.reduce((s, c) => s + c.totalCost, 0)
  
  const avgROI = roiData.length > 0 
    ? roiData.reduce((s, r) => s + r.roi, 0) / roiData.length 
    : 0

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-12">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-slate-500 mt-1">Financial performance and operational efficiency</p>
        </div>
        
        {/* EXPORT ROW */}
        <div className="flex flex-wrap items-center gap-2">
          <a href="/api/dashboard/export/csv?type=vehicles" download="transitops-vehicles.csv"
             className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4 text-slate-400" /> CSV — Vehicles
          </a>
          <a href="/api/dashboard/export/csv?type=trips" download="transitops-trips.csv"
             className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4 text-slate-400" /> CSV — Trips
          </a>
          <button 
            onClick={handlePDFDownload} disabled={downloadingPDF}
            className="px-3 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50">
            {downloadingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            PDF Report
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fuel Efficiency</p>
            <p className="text-2xl font-bold text-slate-900">{fmtNumber(avgFuelEfficiency, 1)} <span className="text-sm font-medium text-slate-500">km/L</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Utilization</p>
            <p className="text-2xl font-bold text-slate-900">{kpis?.fleetUtilization ?? 0}%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Op Cost</p>
            <p className="text-2xl font-bold text-slate-900">{fmtCurrency(totalOpCost)}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Avg Vehicle ROI</p>
            <p className={`text-2xl font-bold ${avgROI > 0 ? 'text-emerald-600' : avgROI < 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {avgROI > 0 ? '+' : ''}{fmtNumber(avgROI, 1)}%
            </p>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-6">Monthly Revenue</h3>
          <MonthlyRevenueChart data={monthlyRev} />
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-6">Top Cost Vehicles</h3>
          <CostBreakdownChart data={opCosts} />
        </div>
      </div>

      {/* TABLES ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-6">Fuel Efficiency by Vehicle</h3>
          <FuelEfficiencyChart data={fuelEff} />
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <ROITable data={roiData} />
        </div>
      </div>

    </div>
  )
}
