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
  const { query, columns } = useDuckDB()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [cityRanking, setCityRanking] = useState<RankingData[]>([])
  const [companyRanking, setCompanyRanking] = useState<RankingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 验证必需的列名
  const requiredColumns = ['签单保费', '签单件数', '业务类型', '城市', '年月']
  const missingColumns = requiredColumns.filter(col => !columns.includes(col))

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      // 检查必需列名
      if (missingColumns.length > 0) {
        setError(`数据文件缺少必需列: ${missingColumns.join(', ')}。请确保上传的 Parquet 文件包含以下列: ${requiredColumns.join(', ')}`)
        setLoading(false)
        return
      }

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
            COALESCE(SUM("签单保费"), 0) as total_premium,
            COALESCE(SUM("签单件数"), 0) as total_policies,
            COUNT(DISTINCT "业务类型") as company_count,
            COUNT(DISTINCT "城市") as city_count
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
            SUM("签单保费") as premium,
            SUM("签单件数") as policies
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
            "城市" as name,
            SUM("签单保费") as premium,
            SUM("签单件数") as policies
          FROM car_insurance
          ${whereClause}
          GROUP BY "城市"
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

        // 业务类型排名
        const companyResult = await query<{
          name: string
          premium: number
          policies: number
        }>(`
          SELECT
            "业务类型" as name,
            SUM("签单保费") as premium,
            SUM("签单件数") as policies
          FROM car_insurance
          ${whereClause}
          GROUP BY "业务类型"
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
        const errorMessage = err instanceof Error ? err.message : '获取数据失败'
        setError(`查询错误: ${errorMessage}`)
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [query, filters, columns, missingColumns])

  const tabs = [
    { id: 'overview' as const, label: '总览' },
    { id: 'city' as const, label: '地市分析' },
    { id: 'company' as const, label: '业务类型分析' },
    { id: 'insurance' as const, label: '险种分析' },
  ]

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <strong>数据错误：</strong> {error}
        </div>
      )}
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
              title="业务类型保费 TOP10"
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

      {/* 业务类型分析视图 */}
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
