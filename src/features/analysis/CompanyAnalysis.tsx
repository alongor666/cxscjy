import { useEffect, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { useDuckDB } from '@/shared/duckdb'
import { FilterState } from '@/features/filters'
import { buildWhereClause } from '@/shared/sql/filters'

interface CompanyAnalysisProps {
  filters: FilterState
}

interface CompanyData {
  company: string
  premium: number
  share: number
}

export function CompanyAnalysis({ filters }: CompanyAnalysisProps) {
  const { query } = useDuckDB()
  const [data, setData] = useState<CompanyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const whereClause = buildWhereClause(filters)

        // 获取总保费
        const totalResult = await query<{ total: number }>(`
          SELECT SUM("标准保费") as total
          FROM car_insurance
          ${whereClause}
        `)
        const total = totalResult[0]?.total ?? 0

        // 获取公司数据
        const result = await query<{
          company: string
          premium: number
        }>(`
          SELECT
            "保险" as company,
            SUM("标准保费") as premium
          FROM car_insurance
          ${whereClause}
          GROUP BY "保险"
          ORDER BY premium DESC
          LIMIT 10
        `)

        setData(
          result.map(r => ({
            company: r.company,
            premium: r.premium,
            share: total > 0 ? (r.premium / total) * 100 : 0,
          }))
        )
      } catch (err) {
        console.error('Failed to fetch company analysis:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [query, filters])

  const option: EChartsOption = {
    title: {
      text: '保险公司市场份额 TOP10',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#374151',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const item = params as { name: string; value: number; percent: number }
        return `${item.name}<br/>保费：${(item.value / 10000).toFixed(2)} 万元<br/>占比：${item.percent.toFixed(1)}%`
      },
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 60,
      bottom: 20,
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '55%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: data.map(d => ({
          name: d.company,
          value: d.premium,
        })),
      },
    ],
  }

  if (loading) {
    return (
      <div className="chart-container h-96 animate-pulse">
        <div className="h-full bg-gray-100 rounded"></div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <ReactECharts option={option} style={{ height: '400px' }} />
    </div>
  )
}
