import { FilterState } from '@/features/filters'

/**
 * 根据筛选条件构建 WHERE 子句
 */
export function buildWhereClause(filters: FilterState): string {
  const conditions: string[] = []

  if (filters.yearMonths.length > 0) {
    const values = filters.yearMonths.map(v => `'${escapeSQL(v)}'`).join(', ')
    conditions.push(`"年月" IN (${values})`)
  }

  if (filters.cities.length > 0) {
    const values = filters.cities.map(v => `'${escapeSQL(v)}'`).join(', ')
    conditions.push(`"城市" IN (${values})`)
  }

  if (filters.insuranceTypes.length > 0) {
    const values = filters.insuranceTypes.map(v => `'${escapeSQL(v)}'`).join(', ')
    conditions.push(`"险种" IN (${values})`)
  }

  if (filters.companies.length > 0) {
    const values = filters.companies.map(v => `'${escapeSQL(v)}'`).join(', ')
    conditions.push(`"业务类型" IN (${values})`)
  }

  if (conditions.length === 0) {
    return ''
  }

  return `WHERE ${conditions.join(' AND ')}`
}

/**
 * 转义 SQL 字符串中的特殊字符
 */
function escapeSQL(value: string): string {
  return value.replace(/'/g, "''")
}
