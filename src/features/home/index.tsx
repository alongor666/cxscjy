import { useCallback, useState } from 'react'
import { useDuckDB } from '@/shared/duckdb'
import { Loading } from '@/shared/ui'
import { FileUpload } from './FileUpload'
import { DataPreview } from './DataPreview'

interface HomeProps {
  isLoading: boolean
}

export function Home({ isLoading }: HomeProps) {
  const { loadFile, loadFromURL, isLoaded, columns, rowCount } = useDuckDB()
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([])

  const handleFileSelect = useCallback(async (file: File) => {
    await loadFile(file)
  }, [loadFile])

  const handleLoadDefault = useCallback(async () => {
    // 加载默认数据文件
    await loadFromURL('/四川车险市场分月数据.parquet')
  }, [loadFromURL])

  if (isLoading) {
    return <Loading text="正在加载数据..." />
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          数据导入
        </h2>
        <p className="text-gray-500">
          上传 Parquet 文件或加载默认数据开始分析
        </p>
      </div>

      {!isLoaded ? (
        <div className="space-y-6">
          <FileUpload onFileSelect={handleFileSelect} />

          <div className="text-center">
            <span className="text-gray-400">或</span>
          </div>

          <div className="text-center">
            <button
              onClick={handleLoadDefault}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              加载默认数据（四川车险市场分月数据）
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-700 font-medium">数据加载成功</span>
            </div>
            <p className="mt-2 text-sm text-green-600">
              共 {rowCount.toLocaleString()} 行，{columns.length} 列
            </p>
          </div>

          <DataPreview columns={columns} />
        </div>
      )}
    </div>
  )
}
