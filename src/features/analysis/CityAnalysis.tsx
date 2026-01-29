import { useEffect, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { useDuckDB } from '@/shared/duckdb'
import { FilterState } from '@/features/filters'
import { buildWhereClause } from '@/shared/sql/filters'

interface CityAnalysisProps {
  filters: FilterState
}

interface CityData {
  city: string
  premium: number
  policies: number
}

export function CityAnalysis({ filters }: CityAnalysisProps) {
  const { query } = useDuckDB()
  const [data, setData] = useState<CityData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const whereClause = buildWhereClause(filters)
        const result = await query<{
          city: string
          premium: number
          policies: number
        }>(`
          SELECT
            "地市" as city,
            SUM("标准保费") as premium,
            SUM("标准件数") as policies
          FROM car_insurance
          ${whereClause}
          GROUP BY "地市"
          ORDER BY premium DESC
        `)
        setData(result)
      } catch (err) {
        console.error('Failed to fetch city analysis:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [query, filters])

  const option: EChartsOption = {
    title: {
      text: '地市保费分布',
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
      formatter: (params: unknown) => {
        const item = (params as Array<{ name: string; value: number }>)[0]
        if (!item) return ''
        return `${item.name}<br/>保费：${(item.value / 10000).toFixed(2)} 万元`
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: 60,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.city),
      axisLabel: {
        rotate: 45,
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: '保费（万元）',
      axisLabel: {
        formatter: (value: number) => (value / 10000).toFixed(0),
      },
    },
    series: [
      {
        type: 'bar',
        data: data.map(d => d.premium),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#93c5fd' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
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
      <ReactECharts option={option} style={{ height: '400px' }} />
    </div>
  )
}
