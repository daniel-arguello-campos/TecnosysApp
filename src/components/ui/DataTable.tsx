import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  search: string;
  onSearch: (value: string) => void;
  placeholder: string;
}

export function DataTable<T>({ data, columns, search, onSearch, placeholder }: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter: search },
    onGlobalFilterChange: onSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <div className="surface overflow-hidden">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <input className="input max-w-md" value={search} onChange={(event) => onSearch(event.target.value)} placeholder={placeholder} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900/70">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/70">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap px-4 py-3 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 ? <div className="p-4"><EmptyState title="Sin registros" description="Cuando agregues información al sistema aparecerá aquí." /></div> : null}
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
        <span className="text-slate-500 dark:text-slate-400">
          Página {table.getState().pagination.pageIndex + 1} de {Math.max(table.getPageCount(), 1)}
        </span>
        <div className="flex gap-2">
          <button className="btn-secondary h-9 w-9 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Página anterior">
            <ChevronLeft size={16} />
          </button>
          <button className="btn-secondary h-9 w-9 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Página siguiente">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
