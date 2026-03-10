import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react'

/**
 * DataTable – reusable paginated data table.
 *
 * Props:
 *   columns  – Array<{ key, label, render?, className?, headerClassName? }>
 *   data     – Array of row objects
 *   pageSize – default rows per page (default 10)
 *   searchKeys – Array<string> keys to search across
 *   emptyText – string shown when no data
 *   loading   – boolean
 *   actions   – (row) => ReactNode — optional per-row action cell
 */
export default function DataTable({
  columns = [],
  data = [],
  pageSize: defaultPageSize = 10,
  searchKeys = [],
  emptyText = 'Tidak ada data',
  loading = false,
  actions,
}) {
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  // Filter
  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(q))
    )
  }, [data, search, searchKeys])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const from       = (safePage - 1) * pageSize
  const slice      = filtered.slice(from, from + pageSize)

  function goTo(p) { setPage(Math.max(1, Math.min(p, totalPages))) }

  // Reset page when search changes
  function handleSearch(e) {
    setSearch(e.target.value)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {searchKeys.length > 0 && (
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Cari…"
              className="pl-8 pr-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white w-52"
            />
          </div>
        )}
        <div className="ml-auto flex items-center gap-2 text-sm text-zinc-500">
          <span>Baris:</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
            className="border border-surface-200 rounded-xl px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 font-semibold text-surface-600 text-left whitespace-nowrap ${col.headerClassName ?? ''}`}
                  >
                    {col.label}
                  </th>
                ))}
                {actions && (
                  <th className="px-4 py-3 font-semibold text-surface-600 text-center whitespace-nowrap">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {loading && (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-12 text-surface-400">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-primary-500" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Memuat…
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-12 text-surface-400">
                    {emptyText}
                  </td>
                </tr>
              )}
              {!loading && slice.map((row, idx) => (
                <tr key={row.id ?? idx} className="hover:bg-surface-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-surface-700 ${col.className ?? ''}`}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-center">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-500">
          <span>
            Menampilkan {Math.min(from + 1, filtered.length)}–{Math.min(from + pageSize, filtered.length)} dari {filtered.length} data
          </span>
          <div className="flex items-center gap-1">
            <PagBtn onClick={() => goTo(1)}          disabled={safePage === 1}          title="Pertama">
              <ChevronsLeft size={14} />
            </PagBtn>
            <PagBtn onClick={() => goTo(safePage - 1)} disabled={safePage === 1}        title="Sebelumnya">
              <ChevronLeft size={14} />
            </PagBtn>

            {/* Page numbers */}
            {pageNumbers(safePage, totalPages).map((p, i) =>
              p === '…' ? (
                <span key={`e${i}`} className="px-2">…</span>
              ) : (
                <PagBtn
                  key={p}
                  onClick={() => goTo(p)}
                  active={p === safePage}
                >
                  {p}
                </PagBtn>
              )
            )}

            <PagBtn onClick={() => goTo(safePage + 1)} disabled={safePage === totalPages} title="Berikutnya">
              <ChevronRight size={14} />
            </PagBtn>
            <PagBtn onClick={() => goTo(totalPages)}   disabled={safePage === totalPages} title="Terakhir">
              <ChevronsRight size={14} />
            </PagBtn>
          </div>
        </div>
      )}
    </div>
  )
}

function PagBtn({ children, onClick, disabled, active, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium transition-colors
        ${active
          ? 'bg-primary-600 text-white'
          : 'text-zinc-600 hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed'}
      `}
    >
      {children}
    </button>
  )
}

/** Generate page number array with ellipsis, e.g. [1, '…', 4, 5, 6, '…', 20] */
function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  pages.push(1)
  if (current > 3) pages.push('…')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}
