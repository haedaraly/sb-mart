'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import { useToast } from '@/components/ui/Toast'

interface LocationOption {
  code: string
  name: string
}

interface CategoryOption {
  name: string
}

interface PurchaseItemForm {
  name: string
  qty: string
  unit: string
  category: string
  price: string
}

const newItem = (): PurchaseItemForm => ({ name: '', qty: '1', unit: 'pcs', category: '', price: '' })

function localDate() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export default function TambahPembelianPage() {
  const { success, error: toastError } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [locationsLoading, setLocationsLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [date, setDate] = useState(localDate)
  const [location, setLocation] = useState('')
  const [items, setItems] = useState<PurchaseItemForm[]>([newItem()])

  useEffect(() => {
    let active = true
    async function loadOptions() {
      try {
        const [locationResponse, categoryResponse] = await Promise.all([
          fetch('/api/locations', { cache: 'no-store' }),
          fetch('/api/purchase-categories', { cache: 'no-store' }),
        ])
        const [locationData, categoryData] = await Promise.all([
          locationResponse.json(),
          categoryResponse.json(),
        ])
        if (!locationResponse.ok) {
          throw new Error(locationData.error || 'Gagal memuat daftar gedung.')
        }
        if (!categoryResponse.ok) {
          throw new Error(categoryData.error || 'Gagal memuat daftar kategori.')
        }
        if (active) {
          setLocations(locationData)
          setLocation(locationData[0]?.code ?? '')
          setCategories(categoryData.map((name: string) => ({ name })))
        }
      } catch (err) {
        if (active) {
          toastError(err instanceof Error ? err.message : 'Gagal memuat data pembelian.')
        }
      } finally {
        if (active) {
          setLocationsLoading(false)
          setCategoriesLoading(false)
        }
      }
    }
    loadOptions()
    return () => {
      active = false
    }
  }, [toastError])

  const addItem = () => setItems((current) => [...current, newItem()])

  const removeItem = (index: number) => {
    setItems((current) => current.length > 1 ? current.filter((_, i) => i !== index) : current)
  }

  const updateItem = (index: number, field: keyof PurchaseItemForm, value: string) => {
    setItems((current) => current.map((item, i) => (
      i === index ? { ...item, [field]: value } : item
    )))
  }

  const totalBelanja = items.reduce(
    (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0),
    0
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!location) {
      toastError('Pilih gedung/lokasi transaksi.')
      return
    }
    const invalidItem = items.find((item) =>
      !item.name.trim() ||
      !item.category ||
      !Number.isFinite(Number(item.qty)) ||
      Number(item.qty) <= 0 ||
      item.price === '' ||
      !Number.isFinite(Number(item.price)) ||
      Number(item.price) < 0
    )
    if (invalidItem) {
      toastError('Isi nama barang, kategori, qty lebih dari 0, dan harga dengan benar.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          loc: location,
          desc: '',
          items: items.map((item) => ({
            name: item.name.trim(),
            cat: item.category,
            qty: Number(item.qty),
            unit: item.unit.trim() || 'pcs',
            price: Number(item.price),
          })),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Gagal menyimpan pembelian.')

      success(`Transaksi ${result.no} berhasil disimpan.`)
      setItems([newItem()])
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Gagal menyimpan pembelian.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-4xl flex-col">
        <div className="mb-5">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-on-surface md:text-display-lg">
            <span className="ms text-primary text-[28px] md:text-[32px]">add_shopping_cart</span>
            Tambah Pembelian
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant md:text-body-md">
            Catat pembelian beserta rincian barang dan harga.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pb-4">
          <section className="space-y-4 rounded-2xl border border-[#E2E8F0] bg-surface-container-lowest p-4 shadow-level-1 sm:p-6">
            <h2 className="text-headline-sm font-semibold text-on-surface">Informasi Transaksi</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="purchase-date" className="mb-1 block text-label-md font-semibold text-on-surface">
                  Tanggal Transaksi <span className="text-error">*</span>
                </label>
                <input
                  id="purchase-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-surface-container-low px-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>
              <div>
                <label htmlFor="purchase-location" className="mb-1 block text-label-md font-semibold text-on-surface">
                  Gedung / Lokasi <span className="text-error">*</span>
                </label>
                <select
                  id="purchase-location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  required
                  disabled={locationsLoading || locations.length === 0}
                  className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-surface-container-low px-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container disabled:opacity-60"
                >
                  <option value="">{locationsLoading ? 'Memuat gedung...' : 'Pilih gedung/lokasi'}</option>
                  {locations.map((option) => (
                    <option key={option.code} value={option.code}>{option.name}</option>
                  ))}
                </select>
              </div>
            </div>

          </section>

          <section className="space-y-4 rounded-2xl border border-[#E2E8F0] bg-surface-container-lowest p-4 shadow-level-1 sm:p-6">
            <h2 className="text-headline-sm font-semibold text-on-surface">Rincian Barang</h2>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 gap-3 rounded-xl border border-[#E2E8F0] bg-surface-container-low/60 p-3 sm:grid-cols-[minmax(0,1fr)_6rem_7rem_10rem_9rem_auto] sm:items-end"
                >
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor={`item-name-${index}`} className="mb-1 block text-label-sm font-medium text-on-surface-variant">
                      Nama Barang #{index + 1}
                    </label>
                    <input
                      id={`item-name-${index}`}
                      type="text"
                      placeholder="Nama barang..."
                      value={item.name}
                      onChange={(event) => updateItem(index, 'name', event.target.value)}
                      required
                      className="h-12 w-full rounded-lg border border-[#E2E8F0] bg-surface-container-lowest px-3 text-body-sm text-on-surface"
                    />
                  </div>
                  <div>
                    <label htmlFor={`item-qty-${index}`} className="mb-1 block text-label-sm font-medium text-on-surface-variant">
                      Qty
                    </label>
                    <input
                      id={`item-qty-${index}`}
                      type="number"
                      min="0.01"
                      step="any"
                      inputMode="decimal"
                      value={item.qty}
                      onChange={(event) => updateItem(index, 'qty', event.target.value)}
                      required
                      className="h-12 w-full rounded-lg border border-[#E2E8F0] bg-surface-container-lowest px-2 text-center text-body-sm text-on-surface"
                    />
                  </div>
                  <div>
                    <label htmlFor={`item-unit-${index}`} className="mb-1 block text-label-sm font-medium text-on-surface-variant">
                      Satuan
                    </label>
                    <input
                      id={`item-unit-${index}`}
                      type="text"
                      placeholder="pcs"
                      value={item.unit}
                      onChange={(event) => updateItem(index, 'unit', event.target.value)}
                      className="h-12 w-full rounded-lg border border-[#E2E8F0] bg-surface-container-lowest px-2 text-center text-body-sm text-on-surface"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor={`item-category-${index}`} className="mb-1 block text-label-sm font-medium text-on-surface-variant">
                      Kategori
                    </label>
                    <select
                      id={`item-category-${index}`}
                      value={item.category}
                      onChange={(event) => updateItem(index, 'category', event.target.value)}
                      required
                      disabled={categoriesLoading || categories.length === 0}
                      className="h-12 w-full rounded-lg border border-[#E2E8F0] bg-surface-container-lowest px-3 text-body-sm text-on-surface disabled:opacity-60"
                    >
                      <option value="">
                        {categoriesLoading ? 'Memuat kategori...' : 'Pilih kategori'}
                      </option>
                      {categories.map((category) => (
                        <option key={category.name} value={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor={`item-price-${index}`} className="mb-1 block text-label-sm font-medium text-on-surface-variant">
                      Harga Satuan (Rp)
                    </label>
                    <input
                      id={`item-price-${index}`}
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      placeholder="0"
                      value={item.price}
                      onChange={(event) => updateItem(index, 'price', event.target.value)}
                      required
                      className="h-12 w-full rounded-lg border border-[#E2E8F0] bg-surface-container-lowest px-3 text-right font-mono text-body-sm text-on-surface"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    aria-label={`Hapus barang ${index + 1}`}
                    className="col-span-2 flex min-h-11 items-center justify-center gap-2 rounded-lg text-label-sm font-medium text-error hover:bg-error-container disabled:opacity-40 sm:col-span-1 sm:w-11"
                  >
                    <span className="ms text-[18px]">delete</span>
                    <span className="sm:hidden">Hapus item</span>
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-surface-container-high px-4 py-2 text-label-md font-semibold text-primary hover:bg-primary-fixed/40 sm:w-auto"
            >
              <span className="ms text-[18px]">add</span>
              Tambah Item
            </button>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] pt-4">
              <span className="text-body-md font-semibold text-on-surface">Total Estimasi</span>
              <span className="font-mono text-xl font-bold text-primary sm:text-2xl">
                Rp{totalBelanja.toLocaleString('id-ID')}
              </span>
            </div>
          </section>

          <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-[#E2E8F0] bg-surface/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
            <button
              type="submit"
              disabled={submitting || locationsLoading || locations.length === 0 || categoriesLoading || categories.length === 0}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-container px-6 py-3 font-semibold text-on-primary shadow-level-2 transition-all hover:bg-[#E66700] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {submitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              {submitting ? 'Menyimpan...' : 'Simpan Pembelian'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
