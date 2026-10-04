'use client'

import { useState, useCallback } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const openSidebar = useCallback(() => setSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: fixed on desktop, drawer on mobile */}
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      {/* Main area: offset by sidebar width on desktop */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <Header onMenuClick={openSidebar} />
        <main
          id="main-content"
          className="relative pt-16 min-h-screen bg-surface w-full px-4 py-6 md:px-6 md:py-8 xl:px-space-xl xl:py-space-xl"
        >
          {children}
        </main>
      </div>
    </>
  )
}
