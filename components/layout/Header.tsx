'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  hasSidebar: boolean
  onMenuClick?: () => void
}

type UserProfile = {
  id: number
  name: string
  username: string
  email: string | null
  role: string
}

export default function Header({ hasSidebar, onMenuClick }: HeaderProps) {
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadUser() {
      try {
        const response = await fetch('/api/me', { cache: 'no-store' })
        if (!response.ok) throw new Error('Gagal memuat profil pengguna')
        const data = (await response.json()) as UserProfile
        if (isMounted) setUser(data)
      } catch (error) {
        console.error('Gagal memuat profil header:', error)
      }
    }

    loadUser()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setProfileOpen(false)
        setPasswordOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('')
        .slice(0, 2)
    : 'U'

  async function handleLogout() {
    try {
      await fetch('/api/logout', { method: 'POST' })
    } finally {
      router.push('/login')
      router.refresh()
    }
  }

  async function handlePasswordChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password baru tidak sama.')
      return
    }

    setSavingPassword(true)
    try {
      const response = await fetch('/api/me/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Gagal mengubah password.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess('Password berhasil diperbarui.')
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Gagal mengubah password.')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 right-0 z-40 h-16 border-b border-[#E2E8F0] bg-surface-container-lowest/90 shadow-[0_1px_8px_rgba(30,41,59,0.04)] backdrop-blur-xl ${hasSidebar ? 'left-0 lg:left-72' : 'left-0'}`}
        role="banner"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-primary-container focus:px-3 focus:py-1.5 focus:text-body-sm focus:text-on-primary"
        >
          Lewati ke konten utama
        </a>

        <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-space-xl">
          {hasSidebar && (
            <button
              onClick={onMenuClick}
              aria-label="Buka menu navigasi"
              aria-controls="sidebar"
              aria-haspopup="true"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container lg:hidden"
            >
              <span className="ms text-[24px]" aria-hidden="true">menu</span>
            </button>
          )}

          <div className="relative ml-auto flex items-center gap-2 md:gap-space-md" ref={menuRef}>
            {user && (
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Buka menu profil pengguna"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex max-w-[min(65vw,280px)] items-center gap-2 rounded-xl p-1.5 text-left transition-colors hover:bg-surface-container-low focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-fixed text-label-sm font-semibold text-on-primary-fixed">
                  {initials}
                </span>
                <span className="hidden min-w-0 flex-col text-left sm:flex">
                  <span className="truncate text-label-md font-semibold leading-tight text-on-surface">
                    {user.name}
                  </span>
                  <span className="text-label-sm font-medium text-on-surface-variant">{user.role}</span>
                </span>
                <span className="ms hidden text-[18px] text-on-surface-variant sm:inline" aria-hidden="true">
                  keyboard_arrow_down
                </span>
              </button>
            )}

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-[#E2E8F0] bg-surface-container-lowest py-1 shadow-level-3"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    setProfileOpen(true)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-body-sm text-on-surface hover:bg-surface-container-low"
                >
                  <span className="ms text-[20px] text-on-surface-variant">person</span>
                  Profil Saya
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    setPasswordError('')
                    setPasswordSuccess('')
                    setPasswordOpen(true)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-body-sm text-on-surface hover:bg-surface-container-low"
                >
                  <span className="ms text-[20px] text-on-surface-variant">lock</span>
                  Pengaturan (Password)
                </button>
                <div className="my-1 border-t border-[#E2E8F0]" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-body-sm font-medium text-error hover:bg-error-container/40"
                >
                  <span className="ms text-[20px]">logout</span>
                  Sign-Out / Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {profileOpen && user && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onMouseDown={() => setProfileOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-level-3"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 id="profile-dialog-title" className="text-headline-sm font-semibold text-on-surface">Profil Saya</h2>
              <button type="button" onClick={() => setProfileOpen(false)} aria-label="Tutup profil" className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low">
                <span className="ms">close</span>
              </button>
            </div>
            <dl className="space-y-4">
              <div>
                <dt className="text-label-sm text-on-surface-variant">Nama</dt>
                <dd className="mt-1 text-body-md font-medium text-on-surface">{user.name}</dd>
              </div>
              <div>
                <dt className="text-label-sm text-on-surface-variant">Username</dt>
                <dd className="mt-1 text-body-md font-medium text-on-surface">{user.username}</dd>
              </div>
              <div>
                <dt className="text-label-sm text-on-surface-variant">Email</dt>
                <dd className="mt-1 text-body-md font-medium text-on-surface">{user.email || '—'}</dd>
              </div>
              <div>
                <dt className="text-label-sm text-on-surface-variant">Role</dt>
                <dd className="mt-1 text-body-md font-medium text-on-surface">{user.role}</dd>
              </div>
            </dl>
          </section>
        </div>
      )}

      {passwordOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onMouseDown={() => setPasswordOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-level-3"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 id="password-dialog-title" className="text-headline-sm font-semibold text-on-surface">Pengaturan Password</h2>
              <button type="button" onClick={() => setPasswordOpen(false)} aria-label="Tutup pengaturan password" className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low">
                <span className="ms">close</span>
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <label className="block text-label-md font-semibold text-on-surface">
                Password saat ini
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-surface-container-low px-3 font-normal"
                />
              </label>
              <label className="block text-label-md font-semibold text-on-surface">
                Password baru
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-surface-container-low px-3 font-normal"
                />
              </label>
              <label className="block text-label-md font-semibold text-on-surface">
                Konfirmasi password baru
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-surface-container-low px-3 font-normal"
                />
              </label>
              {passwordError && <p role="alert" className="text-body-sm text-error">{passwordError}</p>}
              {passwordSuccess && <p role="status" className="text-body-sm text-secondary">{passwordSuccess}</p>}
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-container px-4 py-2 font-semibold text-on-primary disabled:opacity-60"
              >
                {savingPassword ? 'Menyimpan...' : 'Simpan Password'}
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  )
}
