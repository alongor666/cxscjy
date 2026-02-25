import { useEffect, useState } from 'react'
import { useDuckDB } from '@/shared/duckdb'
import { MultiSelect } from './MultiSelect'

export interface FilterState {
  yearMonths: string[]
  cities: string[]
  insuranceTypes: string[]
  companies: string[]
}

export const defaultFilterState: FilterState = {
  yearMonths: [],
  cities: [],
  insuranceTypes: [],
  companies: [],
}

interface FiltersProps {
  value: FilterState
  onChange: (filters: FilterState) => void
}

export function Filters({ value, onChange }: FiltersProps) {
  const { getDistinct, isLoaded } = useDuckDB()
  const [options, setOptions] = useState({
    yearMonths: [] as string[],
    cities: [] as string[],
    insuranceTypes: [] as string[],
    companies: [] as string[],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOptions() {
      if (!isLoaded) return

      try {
        const [yearMonths, cities, insuranceTypes, companies] = await Promise.all([
          getDistinct('年月'),
          getDistinct('城市'),
          getDistinct('险种'),
          getDistinct('业务类型'),
        ])

        setOptions({
          yearMonths,
          cities,
          insuranceTypes,
          companies,
        })
      } catch (err) {
        console.error('Failed to load filter options:', err)
      } finally {
        setLoading(false)
      }
    }

    loadOptions()
  }, [getDistinct, isLoaded])

  const handleChange = (key: keyof FilterState) => (values: string[]) => {
    onChange({ ...value, [key]: values })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center space-x-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 bg-gray-100 rounded w-40"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <MultiSelect
          label="年月"
          options={options.yearMonths}
          value={value.yearMonths}
          onChange={handleChange('yearMonths')}
          placeholder="全部年月"
        />

        <MultiSelect
          label="地市"
          options={options.cities}
          value={value.cities}
          onChange={handleChange('cities')}
          placeholder="全部地市"
        />

        <MultiSelect
          label="险种"
          options={options.insuranceTypes}
          value={value.insuranceTypes}
          onChange={handleChange('insuranceTypes')}
          placeholder="全部险种"
        />

        <MultiSelect
          label="业务类型"
          options={options.companies}
          value={value.companies}
          onChange={handleChange('companies')}
          placeholder="全部类型"
        />

        {(value.yearMonths.length > 0 ||
          value.cities.length > 0 ||
          value.insuranceTypes.length > 0 ||
          value.companies.length > 0) && (
            <button
              onClick={() => onChange(defaultFilterState)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              清除筛选
            </button>
          )}
      </div>
    </div>
  )
}

export { defaultFilterState as default }
