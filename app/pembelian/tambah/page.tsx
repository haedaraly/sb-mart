'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { useToast } from '@/components/ui/Toast'

export default function TambahPembelianPage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [location, setLocation] = useState('Gedung Shofiyah - TU')
  const [description, setDescription] = useState('')
  const [items, setItems] = useState([
    { name: '', qty: 1, unit: 'pcs', price: 0 },
  ])

  const addItem = () => {
    setItems((prev) => [...prev, { name: '', qty: 1, unit: 'pcs', price: 0 }])
  }

  const removeItem = (idx: number) => {
    if (items.length === 1) return
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateItem = (idx: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it))
    )
  }

  const totalBelanja = items.reduce(
    (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0),
    0
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      toastError('Deskripsi / peruntukan wajib diisi')
      return
    }
    const invalidItem = items.find((i) => !i.name.trim() || Number(i.price) <= 0)
    if (invalidItem) {
      toastError('Pastikan nama barang dan harga sudah diisi dengan benar')
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      success('Transaksi pembelian berhasil disimpan!')
      router.push('/pembelian')
    }, 600)
  }

  return (
    <AppShell>
      <div className="flex flex-col w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/pembelian"
            className="text-body-sm text-primary hover:underline flex items-center gap-1"
          >
            <span className="ms text-[16px]">arrow_back</span>
            Kembali ke Daftar Pembelian
          </Link>
        </div>

        <div className="flex flex-col min-w-0 mb-space-xl">
          <h1 className="text-display-lg font-display-lg text-on-surface tracking-tight flex items-center gap-3">
            <span className="ms text-primary text-[32px]">add_shopping_cart</span>
            Tambah Transaksi Pembelian
          </h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Catat pengeluaran kas operasional baru beserta rincian nota barang.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Form Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-[#E2E8F0] space-y-4">
            <h2 className="text-headline-sm font-semibold text-on-surface mb-2">
              Informasi Transaksi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-label-md font-semibold text-on-surface">
                  Tanggal Transaksi <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="mt-1 w-full h-10 px-3 rounded-xl bg-surface-container-low text-on-surface border border-[#E2E8F0] focus:ring-2 focus:ring-primary-container"
                />
              </div>

              <div>
                <label className="text-label-md font-semibold text-on-surface">
                  Gedung / Lokasi Pemohon <span className="text-error">*</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full h-10 px-3 rounded-xl bg-surface-container-low text-on-surface border border-[#E2E8F0] focus:ring-2 focus:ring-primary-container"
                >
                  <option value="Gedung Shofiyah - TU">Gedung Shofiyah - TU</option>
                  <option value="Gedung Umar - Matham">Gedung Umar - Matham</option>
                  <option value="Gedung Utsman - Asrama">Gedung Utsman - Asrama</option>
                  <option value="Copy Center & Percetakan">Copy Center &amp; Percetakan</option>
                  <option value="Klinik Santri Sehat">Klinik Santri Sehat</option>
                  <option value="Masjid Jami' Putra">Masjid Jami&apos; Putra</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-label-md font-semibold text-on-surface">
                Peruntukan / Keterangan Pembelian <span className="text-error">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Pembelian ATK untuk kebutuhan ujian semester ganjil..."
                rows={2}
                required
                className="mt-1 w-full p-3 rounded-xl bg-surface-container-low text-on-surface border border-[#E2E8F0] focus:ring-2 focus:ring-primary-container"
              />
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-headline-sm font-semibold text-on-surface">
                Rincian Barang / Item Belanja
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-primary font-semibold text-label-md hover:bg-primary-fixed/40 transition-colors"
              >
                <span className="ms text-[18px]">add</span>
                Tambah Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-surface-container-low/60 border border-[#E2E8F0]"
                >
                  <div className="flex-1 w-full">
                    <label className="text-label-sm font-medium text-on-surface-variant block mb-1">
                      Nama Barang #{idx + 1}
                    </label>
                    <input
                      type="text"
                      placeholder="Nama barang..."
                      value={item.name}
                      onChange={(e) => updateItem(idx, 'name', e.target.value)}
                      required
                      className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest text-on-surface border border-[#E2E8F0] text-body-sm"
                    />
                  </div>

                  <div className="w-full sm:w-24">
                    <label className="text-label-sm font-medium text-on-surface-variant block mb-1">
                      Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                      required
                      className="w-full h-9 px-2 text-center rounded-lg bg-surface-container-lowest text-on-surface border border-[#E2E8F0] text-body-sm"
                    />
                  </div>

                  <div className="w-full sm:w-28">
                    <label className="text-label-sm font-medium text-on-surface-variant block mb-1">
                      Satuan
                    </label>
                    <input
                      type="text"
                      placeholder="pcs/rim"
                      value={item.unit}
                      onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                      className="w-full h-9 px-2 text-center rounded-lg bg-surface-container-lowest text-on-surface border border-[#E2E8F0] text-body-sm"
                    />
                  </div>

                  <div className="w-full sm:w-36">
                    <label className="text-label-sm font-medium text-on-surface-variant block mb-1">
                      Harga Satuan (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      placeholder="0"
                      value={item.price}
                      onChange={(e) => updateItem(idx, 'price', e.target.value)}
                      required
                      className="w-full h-9 px-3 text-right rounded-lg bg-surface-container-lowest text-on-surface border border-[#E2E8F0] text-body-sm font-mono"
                    />
                  </div>

                  <div className="sm:pt-5">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={items.length === 1}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="ms text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
              <span className="text-headline-sm font-semibold text-on-surface">
                Total Estimasi Belanja:
              </span>
              <span className="font-table-cell-mono text-display-md text-primary font-bold">
                Rp{totalBelanja.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/pembelian"
              className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] text-on-surface font-semibold hover:bg-surface-container-low transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary font-semibold shadow-level-2 hover:bg-[#E66700] transition-all flex items-center gap-2"
            >
              {submitting && (
                <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              )}
              Simpan Pembelian
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
