'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  icon: string
  href?: string
  children?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'grid_view', href: '/dashboard' },
  {
    label: 'Pembelian',
    icon: 'shopping_bag',
    children: [
      { label: 'Daftar Pembelian', href: '/pembelian' },
      { label: 'Tambah Pembelian', href: '/pembelian/tambah' },
    ],
  },
  {
    label: 'Rekap',
    icon: 'analytics',
    children: [
      { label: 'Rekap Mingguan', href: '/rekap/mingguan' },
      { label: 'Rekap Bulanan', href: '/rekap/bulanan' },
    ],
  },
  {
    label: 'Master Data',
    icon: 'database',
    children: [
      { label: 'Lokasi / Gedung', href: '/master/lokasi' },
      { label: 'Barang', href: '/master/barang' },
      { label: 'Kategori', href: '/master/kategori' },
      { label: 'Satuan', href: '/master/satuan' },
    ],
  },
]

const adminItems: NavItem[] = [
  { label: 'Pengguna', icon: 'manage_accounts', href: '/pengguna' },
  { label: 'Pengaturan', icon: 'settings', href: '/pengaturan' },
]

function NavGroup({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem
  pathname: string
  onNavigate?: () => void
}) {
  const isActive = item.children?.some((c) => pathname.startsWith(c.href))
  const [open, setOpen] = useState(isActive ?? false)

  // Keep submenu open when navigating
  useEffect(() => {
    if (isActive) setOpen(true)
  }, [isActive])

  if (!item.children) {
    return (
      <Link
        href={item.href!}
        onClick={onNavigate}
        aria-current={pathname === item.href ? 'page' : undefined}
        className={cn(
          'flex items-center gap-space-sm px-space-md py-2.5 rounded-xl transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container',
          pathname === item.href
            ? 'bg-primary-container text-on-primary font-semibold shadow-level-1'
            : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
        )}
      >
        <span className="ms text-[20px]" aria-hidden="true">{item.icon}</span>
        <span className="text-body-md font-body-md">{item.label}</span>
      </Link>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={`nav-sub-${item.label}`}
        className="w-full flex items-center justify-between px-space-md py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface cursor-pointer select-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
      >
        <div className="flex items-center gap-space-sm">
          <span className="ms text-[20px]" aria-hidden="true">{item.icon}</span>
          <span className="text-body-md font-body-md">{item.label}</span>
        </div>
        <span
          aria-hidden="true"
          className={cn(
            'ms text-[18px] transition-transform duration-200',
            open && 'rotate-180',
          )}
        >
          expand_more
        </span>
      </button>
      <div
        id={`nav-sub-${item.label}`}
        className={cn(
          'pl-8 pr-space-xs overflow-hidden transition-all duration-200',
          open ? 'max-h-96 pt-1 pb-1' : 'max-h-0',
        )}
      >
        <div className="flex flex-col gap-1">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              aria-current={pathname === child.href ? 'page' : undefined}
              className={cn(
                'px-space-md py-2 rounded-lg text-body-sm font-body-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container',
                pathname === child.href
                  ? 'bg-primary-container text-on-primary font-semibold shadow-level-1'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

interface SidebarProps {
  /** Mobile: is the drawer open? */
  open?: boolean
  onClose?: () => void
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      id="sidebar"
      aria-label="Navigasi utama"
      className={cn(
        // Base styles — always rendered in DOM
        'fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex flex-col shadow-[0_1px_8px_rgba(30,41,59,0.06)] border-r border-[#E2E8F0]',
        'transition-transform duration-300 ease-in-out',
        // Mobile: hidden by default, slides in when open
        // Desktop (lg+): always visible
        'lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
    >
      {/* Logo */}
      <div className="h-16 py-space-md px-space-lg flex items-center justify-between bg-surface-container-lowest border-b border-[#E2E8F0]">
        <div className="flex items-center gap-space-sm">
          <div
            className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-bold text-lg flex-shrink-0"
            aria-hidden="true"
          >
            R
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-headline-sm font-headline-sm text-primary leading-tight truncate">
              Sistem Pembelian
            </span>
            <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider truncate">
              LPI Keuangan
            </span>
          </div>
        </div>
        {/* Close button — only visible on mobile */}
        <button
          onClick={onClose}
          aria-label="Tutup menu navigasi"
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
        >
          <span className="ms text-[20px]" aria-hidden="true">close</span>
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 px-space-md py-space-sm overflow-y-auto flex flex-col gap-space-xs"
        aria-label="Menu navigasi"
      >
        <div className="px-space-sm pt-space-xs pb-space-xs">
          <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
            Menu Utama
          </span>
        </div>

        {navItems.map((item) => (
          <NavGroup
            key={item.label}
            item={item}
            pathname={pathname}
            onNavigate={onClose}
          />
        ))}

        <div className="px-space-sm pt-space-md pb-space-xs">
          <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
            Administrasi
          </span>
        </div>

        {adminItems.map((item) => (
          <NavGroup
            key={item.label}
            item={item}
            pathname={pathname}
            onNavigate={onClose}
          />
        ))}
      </nav>

      {/* Foundation footer */}
      <div className="p-space-md border-t border-[#E2E8F0]">
        <div className="p-space-md rounded-xl bg-surface-container-low shadow-level-1 flex items-center gap-space-sm">
          <div
            className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0"
            aria-hidden="true"
          >
            <span className="ms text-[20px]">verified</span>
          </div>
          <div className="min-w-0">
            <div className="text-label-md font-label-md text-on-surface font-semibold truncate">
              Yayasan Pendidikan
            </div>
            <div className="text-label-sm font-label-sm text-on-surface-variant truncate">
              LPI Amanah Governance
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
