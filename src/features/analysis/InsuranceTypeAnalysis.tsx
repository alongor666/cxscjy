import { useEffect, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { useDuckDB } from '@/shared/duckdb'
import { FilterState } from '@/features/filters'
import { buildWhereClause } from '@/shared/sql/filters'

interface InsuranceTypeAnalysisProps {
  filters: FilterState
}

interface TypeData {
  type: string
  premium: number
  policies: number
}

export function InsuranceTypeAnalysis({ filters }: InsuranceTypeAnalysisProps) {
  const { query } = useDuckDB()
  const [data, setData] = useState<TypeData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const whereClause = buildWhereClause(filters)
        const result = await query<{
          type: string
          premium: number
          policies: number
        }>(`
          SELECT
            "险种" as type,
            SUM("标准保费") as premium,
            SUM("标准件数") as policies
          FROM car_insurance
          ${whereClause}
          GROUP BY "险种"
          ORDER BY premium DESC
        `)
        setData(result)
      } catch (err) {
        console.error('Failed to fetch insurance type analysis:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [query, filters])

  const option: EChartsOption = {
    title: {
      text: '险种结构分析',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#374151',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['保费', '件数'],
      top: 30,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: 80,
      containLabel: true,
    },
    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'category',
      data: data.map(d => d.type),
      axisLabel: {
        width: 100,
        overflow: 'truncate',
      },
    },
    series: [
      {
        name: '保费',
        type: 'bar',
        data: data.map(d => d.premium),
        itemStyle: {
          color: '#3b82f6',
          borderRadius: [0, 4, 4, 0],
        },
        label: {
          show: true,
          position: 'right',
          formatter: (params: { value: number }) =>
            (params.value / 10000).toFixed(0) + '万',
          fontSize: 11,
        },
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
      <ReactECharts option={option} style={{ height: Math.max(300, data.length * 40) + 'px' }} />
    </div>
  )
}
