import { useState, useEffect } from 'react'
import { DuckDBProvider, useDuckDB } from '@/shared/duckdb/context'
import { Header } from '@/shared/ui/Header'
import { Home } from '@/features/home'
import { Dashboard } from '@/features/dashboard'
import { Filters, FilterState, defaultFilterState } from '@/features/filters'

type Page = 'home' | 'dashboard'

function AppContent() {
  const { isLoaded, isLoading, error } = useDuckDB()
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [filters, setFilters] = useState<FilterState>(defaultFilterState)

  // 数据加载成功后自动跳转到仪表盘
  useEffect(() => {
    if (isLoaded) {
      setCurrentPage('dashboard')
    }
  }, [isLoaded])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isDataLoaded={isLoaded}
      />

      <main className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <strong>错误：</strong> {error}
          </div>
        )}

        {currentPage === 'home' && (
          <Home isLoading={isLoading} />
        )}

        {currentPage === 'dashboard' && isLoaded && (
          <div className="space-y-6">
            <Filters value={filters} onChange={setFilters} />
            <Dashboard filters={filters} />
          </div>
        )}

        {currentPage === 'dashboard' && !isLoaded && (
          <div className="text-center py-20">
            <p className="text-gray-500">请先上传或加载数据文件</p>
            <button
              onClick={() => setCurrentPage('home')}
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              前往数据导入
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <DuckDBProvider>
      <AppContent />
    </DuckDBProvider>
  )
}

export default App
