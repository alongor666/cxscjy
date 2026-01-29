interface HeaderProps {
  currentPage: 'home' | 'dashboard'
  onPageChange: (page: 'home' | 'dashboard') => void
  isDataLoaded: boolean
}

export function Header({ currentPage, onPageChange, isDataLoaded }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-800">
              四川车险市场分析
            </h1>
          </div>

          <nav className="flex items-center space-x-1">
            <button
              onClick={() => onPageChange('home')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'home'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              数据导入
            </button>
            <button
              onClick={() => onPageChange('dashboard')}
              disabled={!isDataLoaded}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-primary-50 text-primary-700'
                  : isDataLoaded
                  ? 'text-gray-600 hover:bg-gray-100'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              仪表盘
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
