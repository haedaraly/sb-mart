'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

const ROLES = ['Super Admin', 'Admin', 'Operator'] as const
type Role = (typeof ROLES)[number]

interface UserItem {
  id?: number
  username?: string
  name: string
  email?: string
  role: Role | ''
  isActive?: boolean
}

interface UserFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: (Omit<UserItem, 'role'> & { role: string }) | null
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

const ROLE_BADGE: Record<Role, string> = {
  'Super Admin': 'bg-error-container text-error',
  Admin: 'bg-primary-fixed/40 text-primary',
  Operator: 'bg-secondary-fixed/50 text-secondary',
}

export default function UserFormModal({
  open,
  onClose,
  onSuccess,
  initialData,
}: UserFormModalProps) {
  const { success, error: toastError } = useToast()
  const isEdit = !!initialData?.id

  const [form, setForm] = useState<UserItem>({
    username: '',
    name: '',
    email: '',
    role: '',
    isActive: true,
  })
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && initialData) {
      setForm({
        username: initialData.username ?? '',
        name: initialData.name ?? '',
        email: initialData.email ?? '',
        role: ROLES.includes(initialData.role as Role) ? initialData.role as Role : '',
        isActive: initialData.isActive ?? true,
      })
      setPassword('')
      setErrors({})
    } else if (open && !initialData) {
      setForm({ username: '', name: '', email: '', role: '', isActive: true })
      setPassword('')
      setErrors({})
    }
    setShowPassword(false)
  }, [open, initialData])

  function set(k: keyof UserItem, v: any) {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.name?.trim()) errs.name = 'Nama lengkap wajib diisi'
    if (!isEdit && !form.username?.trim()) errs.username = 'Username wajib diisi'
    if (!form.role) errs.role = 'Role wajib dipilih'
    if (!isEdit) {
      if (!password) errs.password = 'Password wajib diisi'
      else if (password.length < 6) errs.password = 'Password minimal 6 karakter'
    } else if (password && password.length < 6) {
      errs.password = 'Password baru minimal 6 karakter'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const url = isEdit ? `/api/users/${initialData!.id}` : '/api/users'
      const method = isEdit ? 'PUT' : 'POST'
      const body: any = {
        name: form.name!.trim(),
        email: form.email?.trim() || null,
        role: form.role,
        on: form.isActive,
      }
      if (!isEdit) body.username = form.username!.trim()
      if (password) body.password = password

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

      success(isEdit ? 'Data pengguna berhasil diperbarui.' : 'Pengguna baru berhasil ditambahkan.')
      onSuccess()
      onClose()
    } catch {
      toastError('Gagal terhubung ke server. Periksa koneksi jaringan Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Pengguna' : 'Tambah Pengguna'}
      description={isEdit ? 'Ubah data pengguna yang sudah ada.' : 'Isi form untuk menambahkan akun pengguna baru.'}
      size="md"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Username (only on create) */}
        {!isEdit && (
          <Field label="Username" id="user-username" required error={errors.username}>
            <input
              id="user-username"
              type="text"
              autoComplete="username"
              placeholder="Contoh: sarah.f"
              value={form.username}
              onChange={(e) => set('username', e.target.value)}
              aria-invalid={!!errors.username}
              className={cn(inputClass, errors.username && 'ring-2 ring-error')}
            />
          </Field>
        )}

        {/* Name */}
        <Field label="Nama Lengkap" id="user-name" required error={errors.name}>
          <input
            id="user-name"
            type="text"
            autoComplete="name"
            placeholder="Contoh: Ustadzah Sarah Fatimah"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            aria-invalid={!!errors.name}
            className={cn(inputClass, errors.name && 'ring-2 ring-error')}
          />
        </Field>

        {/* Email */}
        <Field label="Email" id="user-email">
          <input
            id="user-email"
            type="email"
            autoComplete="email"
            placeholder="Contoh: sarah@lpi.sch.id"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            className={inputClass}
          />
        </Field>

        {/* Role */}
        <Field label="Role / Jabatan" id="user-role" required error={errors.role}>
          <div className="relative">
            <select
              id="user-role"
              value={form.role}
              onChange={(e) => set('role', e.target.value as Role)}
              aria-invalid={!!errors.role}
              className={cn(selectClass, errors.role && 'ring-2 ring-error')}
            >
              <option value="">Pilih role</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <span className="ms text-[16px] text-on-surface-variant absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
          </div>
          {/* Role badge preview */}
          {form.role && (
            <div className="mt-1 flex items-center gap-1.5">
              <span className={cn('px-2 py-0.5 rounded-full text-label-sm font-label-sm font-semibold', ROLE_BADGE[form.role as Role])}>
                {form.role}
              </span>
              <span className="text-body-sm font-body-sm text-on-surface-variant">
                {form.role === 'Super Admin' && '— Akses penuh ke semua fitur'}
                {form.role === 'Admin' && '— Kelola transaksi & master data'}
                {form.role === 'Operator' && '— Hanya input pembelian'}
              </span>
            </div>
          )}
        </Field>

        {/* Password */}
        <Field
          label={isEdit ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}
          id="user-password"
          required={!isEdit}
          error={errors.password}
        >
          <div className="relative">
            <input
              id="user-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isEdit ? 'new-password' : 'new-password'}
              placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((e) => ({ ...e, password: undefined })) }}
              aria-invalid={!!errors.password}
              className={cn(inputClass, 'pr-10', errors.password && 'ring-2 ring-error')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="ms text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </Field>

        {/* Status toggle */}
        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-surface-container-low">
          <label htmlFor="user-active" className="text-body-md font-body-md text-on-surface cursor-pointer select-none">
            Akun Aktif
          </label>
          <button
            id="user-active"
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
            <span className="sr-only">{form.isActive ? 'Akun aktif' : 'Akun nonaktif'}</span>
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
            {isEdit ? 'Simpan Perubahan' : 'Tambah Pengguna'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
