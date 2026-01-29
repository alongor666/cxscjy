import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { TrendData } from './index'

interface TrendChartProps {
  data: TrendData[]
  loading: boolean
}

export function TrendChart({ data, loading }: TrendChartProps) {
  const option: EChartsOption = {
    title: {
      text: '月度保费趋势',
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
        type: 'cross',
      },
      formatter: (params: unknown) => {
        const items = params as Array<{
          name: string
          seriesName: string
          value: number
          color: string
        }>
        let html = `<div class="font-medium">${items[0]?.name}</div>`
        items.forEach(item => {
          const value =
            item.seriesName === '保费'
              ? `${(item.value / 10000).toFixed(2)} 万元`
              : `${item.value.toLocaleString()} 件`
          html += `<div class="flex items-center mt-1">
            <span style="display:inline-block;width:10px;height:10px;background:${item.color};border-radius:50%;margin-right:6px;"></span>
            <span>${item.seriesName}：${value}</span>
          </div>`
        })
        return html
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
      type: 'category',
      data: data.map(d => d.yearMonth),
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '保费（万元）',
        axisLabel: {
          formatter: (value: number) => (value / 10000).toFixed(0),
        },
      },
      {
        type: 'value',
        name: '件数',
        axisLabel: {
          formatter: (value: number) => value.toLocaleString(),
        },
      },
    ],
    series: [
      {
        name: '保费',
        type: 'line',
        data: data.map(d => d.premium),
        smooth: true,
        itemStyle: {
          color: '#3b82f6',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ],
          },
        },
      },
      {
        name: '件数',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(d => d.policies),
        smooth: true,
        itemStyle: {
          color: '#10b981',
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
    <div className="chart-container col-span-2">
      <ReactECharts option={option} style={{ height: '400px' }} />
    </div>
  )
}
