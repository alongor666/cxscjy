import { useState, useRef, useEffect } from 'react'

interface MultiSelectProps {
  label: string
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = '全部',
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  )

  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  const selectAll = () => {
    onChange([...options])
  }

  const clearAll = () => {
    onChange([])
  }

  const displayText =
    value.length === 0
      ? placeholder
      : value.length === 1
      ? value[0]
      : `已选 ${value.length} 项`

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between min-w-[140px] px-3 py-2
          bg-gray-50 border border-gray-200 rounded-lg text-sm
          hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500
          ${value.length > 0 ? 'text-gray-800' : 'text-gray-500'}
        `}
      >
        <span className="truncate">{displayText}</span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="搜索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="p-2 border-b border-gray-100 flex justify-between">
            <button
              onClick={selectAll}
              className="text-xs text-primary-600 hover:underline"
            >
              全选
            </button>
            <button
              onClick={clearAll}
              className="text-xs text-gray-500 hover:underline"
            >
              清除
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto p-2">
            {filteredOptions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">无匹配项</p>
            ) : (
              filteredOptions.map(option => (
                <label
                  key={option}
                  className="flex items-center px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option)}
                    onChange={() => toggleOption(option)}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 truncate">{option}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
