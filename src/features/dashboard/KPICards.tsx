import { KPICard } from '@/shared/ui'
import { KPIData } from './index'

interface KPICardsProps {
  data: KPIData | null
  loading: boolean
}

export function KPICards({ data, loading }: KPICardsProps) {
  const formatPremium = (value: number): string => {
    if (value >= 100000000) {
      return (value / 100000000).toFixed(2) + ' 亿'
    }
    if (value >= 10000) {
      return (value / 10000).toFixed(2) + ' 万'
    }
    return value.toFixed(2)
  }

  const formatCount = (value: number): string => {
    if (value >= 10000) {
      return (value / 10000).toFixed(2) + ' 万'
    }
    return value.toLocaleString()
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard
        title="总保费"
        value={data ? formatPremium(data.totalPremium) : '-'}
        unit="元"
        loading={loading}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      <KPICard
        title="总件数"
        value={data ? formatCount(data.totalPolicies) : '-'}
        unit="件"
        loading={loading}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      />

      <KPICard
        title="业务类型"
        value={data ? data.companyCount : '-'}
        unit="类"
        loading={loading}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
      />

      <KPICard
        title="覆盖地市"
        value={data ? data.cityCount : '-'}
        unit="个"
        loading={loading}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
      />
    </div>
  )
}
