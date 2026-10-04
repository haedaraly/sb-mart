'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  onMenuClick?: () => void
}

type UserProfile = {
  id: number
  name: string
  role: string
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadUser() {
      try {
        const response = await fetch('/api/me', { cache: 'no-store' })
        if (!response.ok) return

        const data = (await response.json()) as UserProfile
        if (isMounted) setUser(data)
      } catch {
        // ignore when no session is active; the route guard will redirect to login
      }
    }

    loadUser()

    return () => {
      isMounted = false
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
  const isOperator = user?.role === 'Operator'

  async function handleLogout() {
    try {
      await fetch('/api/logout', { method: 'POST' })
    } finally {
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 lg:left-72 h-16 bg-surface-container-lowest/90 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(30,41,59,0.04)] border-b border-[#E2E8F0]"
      role="banner"
    >
      {/* Skip to main content (accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-primary-container focus:text-on-primary focus:rounded-lg focus:text-body-sm focus:font-body-sm"
      >
        Lewati ke konten utama
      </a>

      <div className="h-16 px-4 md:px-space-xl flex items-center justify-between gap-3 md:gap-space-lg">
        {/* Hamburger button — only on mobile/tablet */}
        <button
          onClick={onMenuClick}
          aria-label="Buka menu navigasi"
          aria-controls="sidebar"
          aria-haspopup="true"
          className="lg:hidden flex-shrink-0 w-10 h-10 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
        >
          <span className="ms text-[24px]" aria-hidden="true">menu</span>
        </button>

        {!isOperator && (
          <div className="flex items-center gap-space-md flex-1 max-w-lg">
            <div className="relative w-full">
              <label htmlFor="global-search" className="sr-only">
                Cari transaksi, barang, atau PO
              </label>
              <span className="ms absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" aria-hidden="true">
                search
              </span>
              <input
                id="global-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-12 rounded-xl bg-surface-container-low text-body-sm font-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all"
                placeholder="Cari kode transaksi, barang, atau no. PO..."
                type="search"
                autoComplete="off"
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-label-sm font-label-sm px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant hidden md:inline"
                aria-label="Pintasan keyboard: Ctrl+K"
              >
                ⌘K
              </span>
            </div>
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2 md:gap-space-md">
          {/* Fiscal year badge — hidden on small screens */}
          {!isOperator && (
            <div
              className="hidden lg:flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant"
              aria-label="Tahun Anggaran 2024/2025"
            >
              <span className="ms text-[16px] text-primary" aria-hidden="true">calendar_today</span>
              <span className="text-label-md font-label-md font-medium text-on-surface">
                TA 2024/2025
              </span>
            </div>
          )}

          {!isOperator && (
            <button
              className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
              aria-label="Notifikasi (ada pemberitahuan baru)"
            >
              <span className="ms text-[22px]" aria-hidden="true">notifications</span>
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-container ring-2 ring-surface-container-lowest"
                aria-hidden="true"
              />
            </button>
          )}

          {/* User profile */}
          <div className="flex min-w-0 items-center gap-2">
            {isOperator ? (
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-fixed text-label-sm font-semibold text-on-primary-fixed"
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <span className="max-w-[120px] truncate text-label-sm font-semibold text-on-surface sm:max-w-[200px] sm:text-label-md">
                  {user?.name || 'Operator'}
                </span>
              </div>
            ) : (
              <button
                className="flex items-center gap-2 pl-2 cursor-pointer select-none rounded-xl hover:bg-surface-container-low transition-colors p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
                aria-label="Menu akun pengguna"
                aria-haspopup="menu"
                type="button"
              >
                <div
                  className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-semibold text-label-sm font-label-sm flex-shrink-0"
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-label-md font-label-md font-semibold text-on-surface leading-tight">
                    {user?.name || 'Pengguna'}
                  </span>
                  <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">
                    {user?.role || 'User'}
                  </span>
                </div>
                <span className="ms text-[18px] text-on-surface-variant hidden sm:inline" aria-hidden="true">
                  keyboard_arrow_down
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-2.5 py-2 text-sm font-medium text-[#334155] transition hover:bg-[#f8fafc] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
              aria-label="Keluar dari aplikasi"
            >
              <span className="ms text-[18px]" aria-hidden="true">logout</span>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
