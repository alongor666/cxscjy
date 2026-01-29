import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import {
  initDuckDB,
  loadParquetFile,
  loadParquetFromURL,
  queryJSON,
  getTableColumns,
  getRowCount,
  getDistinctValues,
} from './client'

interface DuckDBContextValue {
  isInitialized: boolean
  isLoading: boolean
  isLoaded: boolean
  error: string | null
  columns: string[]
  rowCount: number
  initialize: () => Promise<void>
  loadFile: (file: File) => Promise<void>
  loadFromURL: (url: string) => Promise<void>
  query: <T = Record<string, unknown>>(sql: string) => Promise<T[]>
  getDistinct: (column: string) => Promise<string[]>
}

const DuckDBContext = createContext<DuckDBContextValue | null>(null)

export function DuckDBProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [columns, setColumns] = useState<string[]>([])
  const [rowCount, setRowCount] = useState(0)

  const initialize = useCallback(async () => {
    if (isInitialized) return
    try {
      await initDuckDB()
      setIsInitialized(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize DuckDB')
    }
  }, [isInitialized])

  const loadFile = useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)
    try {
      await initialize()
      await loadParquetFile(file)
      const cols = await getTableColumns()
      const count = await getRowCount()
      setColumns(cols)
      setRowCount(count)
      setIsLoaded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file')
    } finally {
      setIsLoading(false)
    }
  }, [initialize])

  const loadFromURL = useCallback(async (url: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await initialize()
      await loadParquetFromURL(url)
      const cols = await getTableColumns()
      const count = await getRowCount()
      setColumns(cols)
      setRowCount(count)
      setIsLoaded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file from URL')
    } finally {
      setIsLoading(false)
    }
  }, [initialize])

  const query = useCallback(async <T = Record<string, unknown>>(sql: string): Promise<T[]> => {
    if (!isLoaded) throw new Error('Data not loaded')
    return queryJSON<T>(sql)
  }, [isLoaded])

  const getDistinct = useCallback(async (column: string): Promise<string[]> => {
    if (!isLoaded) throw new Error('Data not loaded')
    return getDistinctValues(column)
  }, [isLoaded])

  return (
    <DuckDBContext.Provider
      value={{
        isInitialized,
        isLoading,
        isLoaded,
        error,
        columns,
        rowCount,
        initialize,
        loadFile,
        loadFromURL,
        query,
        getDistinct,
      }}
    >
      {children}
    </DuckDBContext.Provider>
  )
}

export function useDuckDB() {
  const context = useContext(DuckDBContext)
  if (!context) {
    throw new Error('useDuckDB must be used within a DuckDBProvider')
  }
  return context
}
