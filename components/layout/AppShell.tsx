'use client'

import { useState, useCallback, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [roleLoaded, setRoleLoaded] = useState(false)

  const openSidebar = useCallback(() => setSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const isOperator = role === 'Operator'
  const hasSidebar = roleLoaded && !isOperator

  useEffect(() => {
    let active = true
    fetch('/api/me', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Gagal memuat profil pengguna')
        return response.json()
      })
      .then((user: { role: string }) => {
        if (active) setRole(user.role)
      })
      .catch((error) => {
        console.error('Gagal memuat role layout:', error)
      })
      .finally(() => {
        if (active) setRoleLoaded(true)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      {/* Mobile sidebar overlay */}
      {hasSidebar && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: fixed on desktop, drawer on mobile */}
      {hasSidebar && <Sidebar role={role} open={sidebarOpen} onClose={closeSidebar} />}

      {/* Main area: offset by sidebar width on desktop */}
      <div className={`${hasSidebar ? 'lg:pl-72' : ''} flex min-h-screen flex-col`}>
        <Header
          hasSidebar={hasSidebar}
          onMenuClick={openSidebar}
        />
        <main
          id="main-content"
          className="relative min-h-screen w-full bg-surface px-4 pb-6 pt-24 md:px-6 md:pb-8 md:pt-24 xl:px-space-xl xl:pb-space-xl xl:pt-28"
        >
          {children}
        </main>
      </div>
    </>
  )
}
