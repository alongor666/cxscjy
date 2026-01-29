interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  change?: number
  icon?: React.ReactNode
  loading?: boolean
}

export function KPICard({ title, value, unit, change, icon, loading }: KPICardProps) {
  if (loading) {
    return (
      <div className="kpi-card animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    )
  }

  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{title}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-gray-800">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      {change !== undefined && (
        <div className={`mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change.toFixed(1)}% 同比
        </div>
      )}
    </div>
  )
}
