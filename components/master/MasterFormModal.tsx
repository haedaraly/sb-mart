'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

export type MasterKey = 'locations' | 'categories' | 'units' | 'products'

interface MasterItem {
  id?: number
  name: string
  code?: string
  description?: string
  symbol?: string
  category?: string
  unit?: string
  price?: number | string
  isActive?: boolean
}

interface MasterFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  masterKey: MasterKey
  initialData?: MasterItem | null
  /** Daftar kategori untuk pilihan pada produk */
  categories?: string[]
}

const MASTER_LABELS: Record<MasterKey, { title: string; namePlaceholder: string }> = {
  locations: { title: 'Lokasi / Gedung', namePlaceholder: 'Contoh: Gedung Al-Amin' },
  categories: { title: 'Kategori', namePlaceholder: 'Contoh: Alat Tulis Kantor' },
  units: { title: 'Satuan', namePlaceholder: 'Contoh: Rim' },
  products: { title: 'Barang', namePlaceholder: 'Contoh: Kertas HVS A4' },
}

interface FieldProps {
  label: string
  id: string
  required?: boolean
  children: React.ReactNode
  error?: string
}

function Field({ label, id, required, children, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label-md font-label-md font-semibold text-on-surface">
        {label}
        {required && <span className="text-error ml-0.5" aria-label="wajib diisi">*</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-body-sm font-body-sm text-error flex items-center gap-1">
          <span className="ms text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  )
}

const inputClass =
  'w-full h-10 px-3 rounded-xl bg-surface-container-low text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-container focus:bg-surface-container-lowest transition-all'

const selectClass =
  'w-full h-10 px-3 rounded-xl bg-surface-container-low text-body-md font-body-md text-on-surface border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-container focus:bg-surface-container-lowest transition-all cursor-pointer appearance-none'

export default function MasterFormModal({
  open,
  onClose,
  onSuccess,
  masterKey,
  initialData,
  categories = [],
}: MasterFormModalProps) {
  const { success, error: toastError } = useToast()
  const isEdit = !!initialData?.id

  const [form, setForm] = useState<MasterItem>({
    name: '',
    code: '',
    description: '',
    symbol: '',
    category: '',
    unit: '',
    price: '',
    isActive: true,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof MasterItem, string>>>({})
  const [loading, setLoading] = useState(false)

  // Populate form when editing
  useEffect(() => {
    if (open && initialData) {
      setForm({
        name: initialData.name ?? '',
        code: initialData.code ?? '',
        description: initialData.description ?? '',
        symbol: initialData.symbol ?? '',
        category: initialData.category ?? '',
        unit: initialData.unit ?? '',
        price: initialData.price ?? '',
        isActive: initialData.isActive ?? true,
      })
      setErrors({})
    } else if (open && !initialData) {
      setForm({ name: '', code: '', description: '', symbol: '', category: '', unit: '', price: '', isActive: true })
      setErrors({})
    }
  }, [open, initialData])

  function set(k: keyof MasterItem, v: any) {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof MasterItem, string>> = {}
    if (!form.name?.trim()) errs.name = 'Nama wajib diisi'
    if (masterKey === 'products') {
      if (!form.category) errs.category = 'Kategori wajib dipilih'
      if (!form.unit?.trim()) errs.unit = 'Satuan wajib diisi'
    }
    if (masterKey === 'units' && !form.symbol?.trim()) errs.symbol = 'Simbol wajib diisi'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const url = isEdit
        ? `/api/master/${masterKey}/${initialData!.id}`
        : `/api/master/${masterKey}`
      const method = isEdit ? 'PUT' : 'POST'
      const body: any = {
        name: form.name!.trim(),
        on: form.isActive,
      }
      if (masterKey === 'locations') {
        body.code = form.code?.trim() || ''
        body.description = form.description?.trim() || ''
      }
      if (masterKey === 'categories') {
        body.description = form.description?.trim() || ''
      }
      if (masterKey === 'units') {
        body.symbol = form.symbol?.trim() || ''
      }
      if (masterKey === 'products') {
        body.code = form.code?.trim() || ''
        body.category = form.category
        body.unit = form.unit?.trim()
        body.price = form.price !== '' ? Number(form.price) : undefined
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        toastError(data.error ?? 'Terjadi kesalahan. Coba lagi.')
        return
      }

      success(isEdit ? `Data ${MASTER_LABELS[masterKey].title} berhasil diperbarui.` : `Data ${MASTER_LABELS[masterKey].title} berhasil ditambahkan.`)
      onSuccess()
      onClose()
    } catch {
      toastError('Gagal terhubung ke server. Periksa koneksi jaringan Anda.')
    } finally {
      setLoading(false)
    }
  }

  const cfg = MASTER_LABELS[masterKey]
  const titleModal = `${isEdit ? 'Edit' : 'Tambah'} ${cfg.title}`

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={titleModal}
      description={isEdit ? `Ubah data ${cfg.title.toLowerCase()} yang sudah ada.` : `Isi form untuk menambahkan ${cfg.title.toLowerCase()} baru.`}
      size="md"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Name (all) */}
        <Field label="Nama" id="master-name" required error={errors.name}>
          <input
            id="master-name"
            type="text"
            autoComplete="off"
            placeholder={cfg.namePlaceholder}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'master-name-err' : undefined}
            className={cn(inputClass, errors.name && 'ring-2 ring-error')}
          />
        </Field>

        {/* Code (locations, products) */}
        {(masterKey === 'locations' || masterKey === 'products') && (
          <Field label="Kode" id="master-code">
            <input
              id="master-code"
              type="text"
              autoComplete="off"
              placeholder="Contoh: GDG-001"
              value={form.code}
              onChange={(e) => set('code', e.target.value)}
              className={inputClass}
            />
          </Field>
        )}

        {/* Symbol (units) */}
        {masterKey === 'units' && (
          <Field label="Simbol" id="master-symbol" required error={errors.symbol}>
            <input
              id="master-symbol"
              type="text"
              autoComplete="off"
              placeholder="Contoh: Rim"
              value={form.symbol}
              onChange={(e) => set('symbol', e.target.value)}
              aria-invalid={!!errors.symbol}
              className={cn(inputClass, errors.symbol && 'ring-2 ring-error')}
            />
          </Field>
        )}

        {/* Description (locations, categories) */}
        {(masterKey === 'locations' || masterKey === 'categories') && (
          <Field label="Keterangan" id="master-desc">
            <textarea
              id="master-desc"
              rows={3}
              placeholder="Keterangan opsional..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-container focus:bg-surface-container-lowest transition-all resize-none"
            />
          </Field>
        )}

        {/* Products: category + unit + price */}
        {masterKey === 'products' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Kategori" id="master-category" required error={errors.category}>
                <div className="relative">
                  <select
                    id="master-category"
                    value={form.category}
                    onChange={(e) => set('category', e.target.value)}
                    aria-invalid={!!errors.category}
                    className={cn(selectClass, errors.category && 'ring-2 ring-error')}
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="ms text-[16px] text-on-surface-variant absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                </div>
              </Field>
              <Field label="Satuan" id="master-unit" required error={errors.unit}>
                <input
                  id="master-unit"
                  type="text"
                  autoComplete="off"
                  placeholder="Contoh: pcs, rim, dus"
                  value={form.unit}
                  onChange={(e) => set('unit', e.target.value)}
                  aria-invalid={!!errors.unit}
                  className={cn(inputClass, errors.unit && 'ring-2 ring-error')}
                />
              </Field>
            </div>
            <Field label="Harga Default (Rp)" id="master-price">
              <input
                id="master-price"
                type="number"
                min="0"
                step="100"
                placeholder="0"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                className={inputClass}
              />
            </Field>
          </>
        )}

        {/* Status toggle */}
        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-surface-container-low">
          <label htmlFor="master-active" className="text-body-md font-body-md text-on-surface cursor-pointer select-none">
            Status Aktif
          </label>
          <button
            id="master-active"
            type="button"
            role="switch"
            aria-checked={form.isActive}
            onClick={() => set('isActive', !form.isActive)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container',
              form.isActive ? 'bg-primary-container' : 'bg-surface-container-highest',
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 rounded-full bg-white shadow-level-1 transition-transform',
                form.isActive ? 'translate-x-6' : 'translate-x-1',
              )}
            />
            <span className="sr-only">{form.isActive ? 'Aktif' : 'Nonaktif'}</span>
          </button>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-body-md font-body-md text-on-surface hover:bg-surface-container-low transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-primary-container text-on-primary text-body-md font-body-md font-semibold hover:bg-[#E66700] transition-all shadow-level-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            )}
            {isEdit ? 'Simpan Perubahan' : 'Tambah Data'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
