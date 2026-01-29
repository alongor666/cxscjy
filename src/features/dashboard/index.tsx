import { useEffect, useState } from 'react'
import { useDuckDB } from '@/shared/duckdb'
import { FilterState } from '@/features/filters'
import { KPICards } from './KPICards'
import { TrendChart } from './TrendChart'
import { RankingTable } from './RankingTable'
import { CityAnalysis, CompanyAnalysis, InsuranceTypeAnalysis } from '@/features/analysis'
import { buildWhereClause } from '@/shared/sql/filters'

type TabType = 'overview' | 'city' | 'company' | 'insurance'

interface DashboardProps {
  filters: FilterState
}

export interface KPIData {
  totalPremium: number
  totalPolicies: number
  companyCount: number
  cityCount: number
  premiumYoY?: number
}

export interface TrendData {
  yearMonth: string
  premium: number
  policies: number
}

export interface RankingData {
  name: string
  premium: number
  policies: number
  share: number
}

export function Dashboard({ filters }: DashboardProps) {
  const { query } = useDuckDB()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [cityRanking, setCityRanking] = useState<RankingData[]>([])
  const [companyRanking, setCompanyRanking] = useState<RankingData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const whereClause = buildWhereClause(filters)

        // KPI 数据
        const kpiResult = await query<{
          total_premium: number
          total_policies: number
          company_count: number
          city_count: number
        }>(`
          SELECT
            COALESCE(SUM("标准保费"), 0) as total_premium,
            COALESCE(SUM("标准件数"), 0) as total_policies,
            COUNT(DISTINCT "保险") as company_count,
            COUNT(DISTINCT "地市") as city_count
          FROM car_insurance
          ${whereClause}
        `)

        setKpiData({
          totalPremium: kpiResult[0]?.total_premium ?? 0,
          totalPolicies: kpiResult[0]?.total_policies ?? 0,
          companyCount: kpiResult[0]?.company_count ?? 0,
          cityCount: kpiResult[0]?.city_count ?? 0,
        })

        // 月度趋势数据
        const trendResult = await query<{
          year_month: string
          premium: number
          policies: number
        }>(`
          SELECT
            "年月" as year_month,
            SUM("标准保费") as premium,
            SUM("标准件数") as policies
          FROM car_insurance
          ${whereClause}
          GROUP BY "年月"
          ORDER BY "年月"
        `)

        setTrendData(
          trendResult.map(r => ({
            yearMonth: r.year_month,
            premium: r.premium,
            policies: r.policies,
          }))
        )

        // 地市排名
        const cityResult = await query<{
          name: string
          premium: number
          policies: number
        }>(`
          SELECT
            "地市" as name,
            SUM("标准保费") as premium,
            SUM("标准件数") as policies
          FROM car_insurance
          ${whereClause}
          GROUP BY "地市"
          ORDER BY premium DESC
          LIMIT 10
        `)

        const totalCityPremium = cityResult.reduce((sum, r) => sum + r.premium, 0)
        setCityRanking(
          cityResult.map(r => ({
            name: r.name,
            premium: r.premium,
            policies: r.policies,
            share: totalCityPremium > 0 ? (r.premium / totalCityPremium) * 100 : 0,
          }))
        )

        // 公司排名
        const companyResult = await query<{
          name: string
          premium: number
          policies: number
        }>(`
          SELECT
            "保险" as name,
            SUM("标准保费") as premium,
            SUM("标准件数") as policies
          FROM car_insurance
          ${whereClause}
          GROUP BY "保险"
          ORDER BY premium DESC
          LIMIT 10
        `)

        const totalCompanyPremium = companyResult.reduce((sum, r) => sum + r.premium, 0)
        setCompanyRanking(
          companyResult.map(r => ({
            name: r.name,
            premium: r.premium,
            policies: r.policies,
            share: totalCompanyPremium > 0 ? (r.premium / totalCompanyPremium) * 100 : 0,
          }))
        )
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [query, filters])

  const tabs = [
    { id: 'overview' as const, label: '总览' },
    { id: 'city' as const, label: '地市分析' },
    { id: 'company' as const, label: '公司分析' },
    { id: 'insurance' as const, label: '险种分析' },
  ]

  return (
    <div className="space-y-6">
      <KPICards data={kpiData} loading={loading} />

      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 总览视图 */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 gap-6">
            <TrendChart data={trendData} loading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RankingTable
              title="地市保费 TOP10"
              data={cityRanking}
              loading={loading}
            />
            <RankingTable
              title="公司保费 TOP10"
              data={companyRanking}
              loading={loading}
            />
          </div>
        </>
      )}

      {/* 地市分析视图 */}
      {activeTab === 'city' && (
        <CityAnalysis filters={filters} />
      )}

      {/* 公司分析视图 */}
      {activeTab === 'company' && (
        <CompanyAnalysis filters={filters} />
      )}

      {/* 险种分析视图 */}
      {activeTab === 'insurance' && (
        <InsuranceTypeAnalysis filters={filters} />
      )}
    </div>
  )
}
