import { RankingData } from './index'

interface RankingTableProps {
  title: string
  data: RankingData[]
  loading: boolean
}

export function RankingTable({ title, data, loading }: RankingTableProps) {
  const formatPremium = (value: number): string => {
    if (value >= 100000000) {
      return (value / 100000000).toFixed(2) + ' 亿'
    }
    if (value >= 10000) {
      return (value / 10000).toFixed(2) + ' 万'
    }
    return value.toFixed(2)
  }

  if (loading) {
    return (
      <div className="chart-container animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>

      <table className="data-table">
        <thead>
          <tr>
            <th className="w-12">排名</th>
            <th>名称</th>
            <th className="text-right">保费</th>
            <th className="text-right">占比</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.name}>
              <td>
                <span
                  className={`
                    inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                    ${index < 3 ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}
                  `}
                >
                  {index + 1}
                </span>
              </td>
              <td className="font-medium text-gray-800">{item.name}</td>
              <td className="text-right text-gray-600">{formatPremium(item.premium)}</td>
              <td className="text-right">
                <div className="flex items-center justify-end">
                  <div className="w-16 h-2 bg-gray-100 rounded-full mr-2 overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${Math.min(item.share, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {item.share.toFixed(1)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
