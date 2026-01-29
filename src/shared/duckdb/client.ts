import * as duckdb from '@duckdb/duckdb-wasm'
import { Table } from 'apache-arrow'

// DuckDB WASM bundles CDN
const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles()

let db: duckdb.AsyncDuckDB | null = null
let conn: duckdb.AsyncDuckDBConnection | null = null

/**
 * 初始化 DuckDB 实例
 */
export async function initDuckDB(): Promise<duckdb.AsyncDuckDB> {
  if (db) return db

  // 选择最佳 bundle
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES)

  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker!}");`], {
      type: 'text/javascript',
    })
  )

  // 创建 worker
  const worker = new Worker(worker_url)
  const logger = new duckdb.ConsoleLogger()
  db = new duckdb.AsyncDuckDB(logger, worker)

  await db.instantiate(bundle.mainModule, bundle.pthreadWorker)
  URL.revokeObjectURL(worker_url)

  // 创建连接
  conn = await db.connect()

  return db
}

/**
 * 获取数据库连接
 */
export async function getConnection(): Promise<duckdb.AsyncDuckDBConnection> {
  if (!conn) {
    await initDuckDB()
  }
  return conn!
}

/**
 * 加载 Parquet 文件到 DuckDB
 */
export async function loadParquetFile(file: File): Promise<void> {
  const connection = await getConnection()

  // 读取文件为 ArrayBuffer
  const buffer = await file.arrayBuffer()
  const uint8Array = new Uint8Array(buffer)

  // 注册文件到 DuckDB
  await db!.registerFileBuffer(file.name, uint8Array)

  // 创建表
  await connection.query(`
    CREATE OR REPLACE TABLE car_insurance AS
    SELECT * FROM read_parquet('${file.name}')
  `)

  console.log('Parquet file loaded successfully:', file.name)
}

/**
 * 从 URL 加载 Parquet 文件
 */
export async function loadParquetFromURL(url: string): Promise<void> {
  const connection = await getConnection()

  // 获取文件
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  const uint8Array = new Uint8Array(buffer)

  // 获取文件名
  const fileName = url.split('/').pop() || 'data.parquet'

  // 注册文件到 DuckDB
  await db!.registerFileBuffer(fileName, uint8Array)

  // 创建表
  await connection.query(`
    CREATE OR REPLACE TABLE car_insurance AS
    SELECT * FROM read_parquet('${fileName}')
  `)

  console.log('Parquet file loaded from URL:', url)
}

/**
 * 执行 SQL 查询并返回 Arrow Table
 */
export async function queryArrow(sql: string): Promise<Table> {
  const connection = await getConnection()
  const result = await connection.query(sql)
  return result
}

/**
 * 执行 SQL 查询并返回 JavaScript 对象数组
 */
export async function queryJSON<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  const table = await queryArrow(sql)
  return table.toArray().map(row => row.toJSON() as T)
}

/**
 * 获取表的列名
 */
export async function getTableColumns(): Promise<string[]> {
  const result = await queryJSON<{ column_name: string }>(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'car_insurance'
    ORDER BY ordinal_position
  `)
  return result.map(r => r.column_name)
}

/**
 * 获取表的行数
 */
export async function getRowCount(): Promise<number> {
  const result = await queryJSON<{ count: number }>(`
    SELECT COUNT(*) as count FROM car_insurance
  `)
  return Number(result[0]?.count ?? 0)
}

/**
 * 获取数据预览
 */
export async function getDataPreview(limit: number = 10): Promise<Record<string, unknown>[]> {
  return queryJSON(`SELECT * FROM car_insurance LIMIT ${limit}`)
}

/**
 * 获取唯一值列表
 */
export async function getDistinctValues(column: string): Promise<string[]> {
  const result = await queryJSON<{ value: string }>(`
    SELECT DISTINCT "${column}" as value
    FROM car_insurance
    WHERE "${column}" IS NOT NULL
    ORDER BY "${column}"
  `)
  return result.map(r => String(r.value))
}

/**
 * 关闭数据库连接
 */
export async function closeDB(): Promise<void> {
  if (conn) {
    await conn.close()
    conn = null
  }
  if (db) {
    await db.terminate()
    db = null
  }
}
