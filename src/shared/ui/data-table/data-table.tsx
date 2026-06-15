import type { ReactNode } from 'react'

export interface DataTableColumn<T> {
  key: string
  header: string
  cell: (item: T) => ReactNode
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowKey?: (item: T, index: number) => string
}

export function DataTable<T>({ columns, data, getRowKey }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="h-14 px-4 text-left text-[13px] font-semibold text-text-secondary">{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={getRowKey ? getRowKey(item, index) : String(index)} className="border-t border-border">
              {columns.map((column) => (
                <td key={column.key} className="h-14 px-4">{column.cell(item)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
