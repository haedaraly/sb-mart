'use client'

import { useState } from 'react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { type Transaction, formatRupiah } from '@/lib/data/transactions'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

interface TransactionTableProps {
  transactions: Transaction[]
  loading?: boolean
  onDeleted?: () => void
}

function ItemTooltip({ items }: { items: Transaction['items'] }) {
  const [visible, setVisible] = useState(false)
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface text-label-md font-label-md font-semibold cursor-help">
        <span className="ms text-[15px]">inventory_2</span>
        {items.length} Item
      </span>
      {visible && (
        <div className="absolute left-0 bottom-full mb-2 flex flex-col w-64 p-3 rounded-xl bg-inverse-surface text-inverse-on-surface shadow-level-3 z-30 text-body-sm font-body-sm pointer-events-none">
          <div className="font-semibold pb-1.5 mb-1.5 border-b border-inverse-on-surface/20 text-surface-variant uppercase text-label-sm font-label-sm">
            Rincian Barang
          </div>
          {items.map((item, i) => (
            <div key={i} className="flex justify-between py-0.5 gap-2">
              <span className="truncate">{item.nama}</span>
              <span className="font-mono flex-shrink-0">{item.nilai}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RowActions({ onDeleteRequest }: { onDeleteRequest: () => void }) {
  return (
    <div className="flex items-center justify-center gap-1">
      <button
        className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-error"
        title="Batalkan/Hapus Transaksi"
        aria-label="Hapus transaksi"
        type="button"
        onClick={onDeleteRequest}
      >
        <span className="ms text-[18px]" aria-hidden="true">delete</span>
      </button>
    </div>
  )
}

const THEAD_COLS = [
  { label: 'No', className: 'py-3.5 px-4 w-12 text-center' },
  { label: 'No. Transaksi', className: 'py-3.5 px-4' },
  { label: 'Tanggal & Jam', className: 'py-3.5 px-4' },
  { label: 'Lokasi / Gedung', className: 'py-3.5 px-4' },
  { label: 'Item Pembelian', className: 'py-3.5 px-4' },
  { label: 'Total Nominal', className: 'py-3.5 px-4 text-right' },
  { label: 'Operator', className: 'py-3.5 px-4' },
  { label: 'Aksi', className: 'py-3.5 px-4 text-center w-16' },
]

export default function TransactionTable({
  transactions,
  loading = false,
  onDeleted,
}: TransactionTableProps) {
  const { error: toastError } = useToast()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; noTransaksi: string } | null>(null)

  const filtered = transactions

  function copyTransaksi(id: string, noTransaksi: string) {
    navigator.clipboard.writeText(noTransaksi)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1200)
  }

  async function deleteRow(id: string) {
    try {
      const response = await fetch(`/api/purchases/${id}`, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Gagal menghapus transaksi.')
      setConfirmDelete(null)
      onDeleted?.()
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Gagal menghapus transaksi.')
    }
  }

  const totalHalaman = filtered.reduce((sum, t) => sum + t.totalNominal, 0)

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-[#E2E8F0] overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FFF9F5] text-on-surface-variant uppercase text-table-header font-table-header tracking-wider border-b border-[#E2E8F0]">
              {THEAD_COLS.map((col) => (
                <th key={col.label} className={col.className}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-table-cell font-table-cell text-on-surface divide-y divide-[#E2E8F0]/50">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-body-sm text-on-surface-variant">Memuat transaksi...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-body-sm text-on-surface-variant">Tidak ada transaksi yang sesuai filter.</td></tr>
            ) : filtered.map((t, idx) => (
              <tr
                key={t.id}
                className={cn(
                  'transition-colors group',
                  idx % 2 === 0 ? 'bg-white' : 'bg-[#FFFCFA]',
                  hoveredRow === t.id ? 'bg-[#FFF2E8]' : '',
                )}
                onMouseEnter={() => setHoveredRow(t.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* No */}
                <td className="py-3.5 px-4 text-center text-on-surface-variant text-body-sm font-body-sm">
                  {String(idx + 1).padStart(2, '0')}
                </td>

                {/* No. Transaksi */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-table-cell-mono font-table-cell-mono font-semibold text-primary tabular-nums">
                      {t.noTransaksi}
                    </span>
                    <button
                      onClick={() => copyTransaksi(t.id, t.noTransaksi)}
                      className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-primary transition-opacity"
                      title="Salin No Transaksi"
                      type="button"
                    >
                      <span className="ms text-[14px]">
                        {copiedId === t.id ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </td>

                {/* Tanggal & Jam */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <span className="text-body-md font-body-md font-medium text-on-surface">
                      {t.tanggal}
                    </span>
                    <span className="text-body-sm font-body-sm text-on-surface-variant">
                      {t.jam}
                    </span>
                  </div>
                </td>

                {/* Lokasi */}
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-label-md font-label-md font-medium text-on-surface">
                    <span className={cn('w-1.5 h-1.5 rounded-full', t.lokasiColor)} />
                    {t.lokasi}
                  </span>
                </td>

                {/* Item Pembelian */}
                <td className="py-3.5 px-4">
                  <ItemTooltip items={t.items} />
                </td>

                {/* Total Nominal */}
                <td className="py-3.5 px-4 text-right">
                  <span className="text-table-cell-mono font-table-cell-mono font-bold text-on-surface tabular-nums">
                    {formatRupiah(t.totalNominal)}
                  </span>
                </td>

                {/* Operator */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center font-semibold text-label-sm font-label-sm flex-shrink-0',
                        t.operatorBg,
                        t.operatorText,
                      )}
                    >
                      {t.operatorInisial}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-body-md font-body-md font-medium leading-tight">
                        {t.operatorNama}
                      </span>
                      <span className="text-label-sm font-label-sm text-on-surface-variant">
                        {t.operatorJabatan}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Aksi */}
                <td className="py-3.5 px-4">
                  <RowActions
                    onDeleteRequest={() => setConfirmDelete({ id: t.id, noTransaksi: t.noTransaksi })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      <div className="px-space-lg py-3.5 bg-[#FFF9F5] border-t border-[#FFE0CC] flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex items-center gap-2">
          <span className="ms text-primary text-[20px]">calculate</span>
          <span className="text-body-md font-body-md text-on-surface">
            Menampilkan <span className="font-semibold text-on-surface">{filtered.length}</span> transaksi
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
              Total Terpilih di Halaman Ini:
            </span>
            <span className="text-headline-md font-headline-md text-primary font-bold underline decoration-double decoration-primary tabular-nums">
              {formatRupiah(totalHalaman)}
            </span>
          </div>
        </div>
      </div>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && void deleteRow(confirmDelete.id)}
        title="Hapus Transaksi?"
        message={`Transaksi ${confirmDelete?.noTransaksi ?? ''} akan dihapus secara permanen. Tindakan ini memerlukan otorisasi bendahara dan tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        variant="danger"
      />
    </div>
  )
}
