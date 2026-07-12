import React from 'react'
import { CloudOff, Wind, Droplets, AlertTriangle } from 'lucide-react'
import { useWeatherAssessment } from '@/api/hooks/useTrips'

interface WeatherPanelProps {
  source: string
  destination: string
}

export default function WeatherPanel({ source, destination }: WeatherPanelProps) {
  const enabled = source.length > 2 && destination.length > 2
  const { data: weather, isLoading, isError } = useWeatherAssessment(source, destination, enabled)

  if (!enabled) return null

  if (isLoading) {
    return (
      <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 animate-pulse flex items-center justify-center">
        <p className="text-sm text-slate-500">Checking weather conditions...</p>
      </div>
    )
  }

  if (isError || !weather || !weather.source) {
    return (
      <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center opacity-70">
        <CloudOff className="w-6 h-6 text-slate-400 mb-2" />
        <p className="text-sm text-slate-500 font-medium">Weather intelligence unavailable</p>
      </div>
    )
  }

  const riskLevel = weather.risk?.risk_level || 'LOW'
  const riskClass = 
    riskLevel === 'HIGH' ? 'bg-red-50 border-red-200 text-red-800' :
    riskLevel === 'MEDIUM' ? 'bg-amber-50 border-amber-200 text-amber-800' :
    'bg-emerald-50 border-emerald-200 text-emerald-800'

  return (
    <div className="mt-4 space-y-3">
      {/* Weather Cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Source', data: weather.source },
          { label: 'Destination', data: weather.destination }
        ].map(({ label, data }, i) => (
          <div key={i} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}: {data.city}</p>
            <div className="flex items-center gap-3">
              <img src={`https://openweathermap.org/img/wn/${data.icon}.png`} alt={data.description} className="w-10 h-10 bg-slate-100 rounded-full" />
              <div>
                <p className="text-lg font-bold text-slate-900">{Math.round(data.temp)}°C</p>
                <p className="text-xs text-slate-600 capitalize">{data.description}</p>
              </div>
            </div>
            <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="flex items-center gap-1"><Wind className="w-3 h-3"/> {data.windSpeed} m/s</span>
              <span className="flex items-center gap-1"><Droplets className="w-3 h-3"/> {data.humidity}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Banner */}
      <div className={`p-3 rounded-lg border flex flex-col gap-1 ${riskClass}`}>
        <div className="flex items-center gap-2 font-medium text-sm">
          {riskLevel === 'HIGH' ? <AlertTriangle className="w-4 h-4"/> : 
           riskLevel === 'MEDIUM' ? <span className="font-bold">⚠</span> : 
           <span className="font-bold">✓</span>}
          {riskLevel === 'LOW' && "Clear conditions. Proceed as planned."}
          {riskLevel === 'MEDIUM' && "Moderate conditions. Monitor weather updates."}
          {riskLevel === 'HIGH' && `High delay risk. Est. delay: ${weather.risk?.estimated_delay_hours}h`}
        </div>
        {weather.risk?.recommendation && (
          <p className="text-xs italic opacity-80">{weather.risk.recommendation}</p>
        )}
      </div>
    </div>
  )
}
