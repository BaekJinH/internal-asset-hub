import type { ReactNode } from 'react'
import { EmptyState } from '@/shared/ui/empty-state'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { cn } from '@/shared/lib/cn'

export interface DataTableColumn<T> {
  key: string
  header: string
  cell: (item: T) => ReactNode
  /** Fixed layout: minimum column width in pixels */
  minWidthPx?: number
  /** Fluid layout: column width (e.g. 24%) */
  width?: string
  headerClassName?: string
  cellClassName?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowKey?: (item: T, index: number) => string
  emptyTitle?: string
  emptyDescription?: string
  /**
   * fixed — pixel min-widths, horizontal scroll when needed
   * fluid — percentage widths, fills container on large screens
   */
  layout?: 'fixed' | 'fluid'
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyTitle = '데이터가 없습니다',
  emptyDescription = '표시할 항목이 없습니다.',
  layout = 'fixed',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  const tableMinWidth =
    layout === 'fixed'
      ? columns.reduce((total, column) => total + (column.minWidthPx ?? 120), 0)
      : undefined

  const isFluid = layout === 'fluid'

  return (
    <div
      className={cn(
        'overflow-x-auto',
        isFluid && 'xl:overflow-x-visible',
      )}
    >
      <div
        className={cn(
          'overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm',
          isFluid && 'w-full min-w-[880px] xl:min-w-0',
        )}
        style={tableMinWidth ? { minWidth: tableMinWidth } : undefined}
      >
        <table
          className={cn(
            'w-full caption-bottom text-sm [word-break:keep-all]',
            isFluid ? 'table-fixed' : 'table-fixed',
          )}
          style={tableMinWidth ? { minWidth: tableMinWidth } : undefined}
        >
          <colgroup>
            {columns.map((column) => (
              <col
                key={column.key}
                style={
                  isFluid && column.width
                    ? { width: column.width }
                    : column.minWidthPx
                      ? { width: column.minWidthPx, minWidth: column.minWidthPx }
                      : undefined
                }
              />
            ))}
          </colgroup>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    'h-11 whitespace-nowrap px-3 normal-case tracking-normal',
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={getRowKey ? getRowKey(item, index) : String(index)} className="h-14">
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      'px-3 py-3 align-middle [word-break:keep-all]',
                      column.cellClassName,
                    )}
                  >
                    {column.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>
    </div>
  )
}
