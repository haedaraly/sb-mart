'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import AppShell from '@/components/layout/AppShell'
import UserFormModal from '@/components/pengguna/UserFormModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Skeleton from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

interface UserItem {
  id: number
  username: string
  name: string
  email?: string
  role: string
  isActive: boolean
  createdAt?: string
}

const ROLE_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  'Super Admin': {
    bg: 'bg-error-container',
    text: 'text-error',
    icon: 'shield_person',
  },
  Admin: {
    bg: 'bg-primary-fixed/50',
    text: 'text-primary',
    icon: 'admin_panel_settings',
  },
  Operator: {
    bg: 'bg-secondary-fixed/50',
    text: 'text-secondary',
    icon: 'person',
  },
}

export default function PenggunaPage() {
  const { success, error: toastError } = useToast()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Form modal state
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)

  // Confirm dialogs
  const [confirmToggle, setConfirmToggle] = useState<{
    user: UserItem
    nextActive: boolean
  } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<UserItem | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('Gagal memuat daftar pengguna')
      const data = await res.json()
      setUsers(data)
    } catch (err: any) {
      toastError(err.message || 'Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }, [toastError])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Toggle user active status
  const handleToggleConfirm = async () => {
    if (!confirmToggle) return
    try {
      setActionLoading(true)
      const { user, nextActive } = confirmToggle
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          role: user.role,
          on: nextActive,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal mengubah status pengguna')
      }
      success(`Akun "${user.name}" berhasil diubah menjadi ${nextActive ? 'Aktif' : 'Nonaktif'}.`)
      setConfirmToggle(null)
      fetchUsers()
    } catch (err: any) {
      toastError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Delete user
  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return
    try {
      setActionLoading(true)
      const res = await fetch(`/api/users/${confirmDelete.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal menghapus pengguna')
      }
      success(`Pengguna "${confirmDelete.name}" berhasil dihapus.`)
      setConfirmDelete(null)
      fetchUsers()
    } catch (err: any) {
      toastError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter === 'active' && !u.isActive) return false
      if (statusFilter === 'inactive' && u.isActive) return false
      if (roleFilter !== 'all' && u.role !== roleFilter) return false

      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q))
      )
    })
  }, [users, search, statusFilter, roleFilter])

  return (
    <AppShell>
      <div className="flex flex-col w-full">
        {/* ── Page Header ─────────────────────────────── */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg mb-space-xl">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-sm mb-1">
              <span className="text-label-sm font-label-sm uppercase tracking-wider text-primary font-semibold px-2 py-0.5 rounded-full bg-primary-fixed/50">
                Hak Akses &amp; Akun
              </span>
              <span className="text-on-surface-variant text-label-sm font-label-sm">
                • Administrasi Sistem LPI
              </span>
            </div>
            <h1 className="text-display-lg font-display-lg text-on-surface tracking-tight flex items-center gap-3">
              <span className="ms text-primary text-[32px]">manage_accounts</span>
              Manajemen Pengguna
            </h1>
            <p className="text-body-md font-body-md text-on-surface-variant mt-1 max-w-3xl">
              Kelola akun staf, petugas operasional, dan tingkat hak akses (Super Admin, Admin, Operator).
            </p>
          </div>

          {/* Action button */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              onClick={() => {
                setEditingUser(null)
                setFormOpen(true)
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary text-headline-sm font-headline-sm shadow-level-2 hover:bg-[#E66700] hover:shadow-level-3 transition-all active:scale-[0.99]"
              type="button"
            >
              <span className="ms text-[20px]">person_add</span>
              <span>+ Tambah Pengguna</span>
            </button>
          </div>
        </div>

        {/* ── Filter Toolbar ──────────────────────────── */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-level-1 border border-[#E2E8F0] mb-space-lg flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:max-w-md">
            <span className="ms absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, username, atau email..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-container-low text-body-sm font-body-sm text-on-surface placeholder:text-on-surface-variant border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-container focus:bg-surface-container-lowest transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Filter Role */}
            <div className="flex items-center gap-1.5">
              <span className="text-body-sm text-on-surface-variant font-medium">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-9 px-3 rounded-xl bg-surface-container-low text-body-sm font-body-sm text-on-surface border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-primary-container"
              >
                <option value="all">Semua Role</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Operator">Operator</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="inline-flex rounded-xl bg-surface-container-low p-1 border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={cn(
                  'px-3 py-1 rounded-lg text-body-sm font-medium transition-all',
                  statusFilter === 'all'
                    ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={cn(
                  'px-3 py-1 rounded-lg text-body-sm font-medium transition-all',
                  statusFilter === 'active'
                    ? 'bg-surface-container-lowest text-secondary shadow-xs font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                Aktif
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('inactive')}
                className={cn(
                  'px-3 py-1 rounded-lg text-body-sm font-medium transition-all',
                  statusFilter === 'inactive'
                    ? 'bg-surface-container-lowest text-on-surface-variant shadow-xs font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                Nonaktif
              </button>
            </div>
          </div>
        </div>

        {/* ── Users Table ─────────────────────────────── */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-surface-container-low/50 text-label-md font-label-md text-on-surface-variant">
                  <th className="py-3.5 px-4 text-center w-12">No</th>
                  <th className="py-3.5 px-4">Nama Lengkap &amp; Email</th>
                  <th className="py-3.5 px-4 w-40">Username</th>
                  <th className="py-3.5 px-4 w-44">Tingkat Akses (Role)</th>
                  <th className="py-3.5 px-4 text-center w-28">Status</th>
                  <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-body-md font-body-md text-on-surface">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4 text-center"><Skeleton className="w-5 h-4 mx-auto" /></td>
                      <td className="py-4 px-4"><Skeleton className="w-48 h-5 mb-1" /><Skeleton className="w-32 h-3" /></td>
                      <td className="py-4 px-4"><Skeleton className="w-24 h-4" /></td>
                      <td className="py-4 px-4"><Skeleton className="w-28 h-6 rounded-full" /></td>
                      <td className="py-4 px-4 text-center"><Skeleton className="w-16 h-6 mx-auto rounded-full" /></td>
                      <td className="py-4 px-4 text-center"><Skeleton className="w-14 h-8 mx-auto rounded-lg" /></td>
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="ms text-[40px] text-on-surface-variant/40">group_off</span>
                        <p className="text-body-lg font-body-lg font-medium text-on-surface">Tidak ada pengguna ditemukan</p>
                        <p className="text-body-sm font-body-sm text-on-surface-variant">
                          {search ? `Tidak ada hasil pencarian untuk "${search}".` : 'Belum ada pengguna terdaftar.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, idx) => {
                    const rStyle = ROLE_STYLES[u.role] || ROLE_STYLES.Operator
                    const initials = u.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                    return (
                      <tr
                        key={u.id}
                        className={cn(
                          'hover:bg-surface-container-low/60 transition-colors',
                          !u.isActive && 'bg-surface-container-low/20 opacity-75'
                        )}
                      >
                        <td className="py-3.5 px-4 text-center text-body-sm text-on-surface-variant">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-semibold text-label-md">
                              {initials}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-on-surface">{u.name}</span>
                              <span className="text-body-sm text-on-surface-variant">{u.email || '—'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-table-cell-mono text-table-cell-mono font-medium text-primary">
                            @{u.username}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-semibold',
                              rStyle.bg,
                              rStyle.text
                            )}
                          >
                            <span className="ms text-[14px]">{rStyle.icon}</span>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmToggle({
                                user: u,
                                nextActive: !u.isActive,
                              })
                            }
                            className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer',
                              u.isActive
                                ? 'bg-secondary-fixed/50 text-secondary border border-secondary/20'
                                : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
                            )}
                            title={`Klik untuk ${u.isActive ? 'menonaktifkan' : 'mengaktifkan'}`}
                          >
                            <span className="ms text-[14px]">
                              {u.isActive ? 'check_circle' : 'cancel'}
                            </span>
                            {u.isActive ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUser(u)
                                setFormOpen(true)
                              }}
                              title="Ubah data pengguna"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                            >
                              <span className="ms text-[18px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(u)}
                              title="Hapus pengguna"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                            >
                              <span className="ms text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── User Form Modal ─────────────────────────── */}
      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          setFormOpen(false)
          fetchUsers()
        }}
        initialData={editingUser}
      />

      {/* ── Confirm Status Toggle Dialog ────────────── */}
      <ConfirmDialog
        open={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        onConfirm={handleToggleConfirm}
        loading={actionLoading}
        title={
          confirmToggle?.nextActive
            ? 'Aktifkan Akun Pengguna?'
            : 'Nonaktifkan Akun Pengguna?'
        }
        message={`Apakah Anda yakin ingin ${
          confirmToggle?.nextActive ? 'mengaktifkan' : 'menonaktifkan'
        } akun pengguna "${confirmToggle?.user.name}"? Pengguna nonaktif tidak dapat masuk ke sistem.`}
        confirmLabel={confirmToggle?.nextActive ? 'Ya, Aktifkan' : 'Ya, Nonaktifkan'}
        variant={confirmToggle?.nextActive ? 'info' : 'warning'}
      />

      {/* ── Confirm Delete Dialog ───────────────────── */}
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
        title="Hapus Pengguna?"
        message={`Apakah Anda yakin ingin menghapus akun pengguna "${confirmDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Pengguna"
        cancelLabel="Batal"
        variant="danger"
      />
    </AppShell>
  )
}
