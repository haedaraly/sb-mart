'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const callbackUrl = searchParams.get('next') || '/pembelian'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data?.error || 'Username atau password salah.')
        return
      }

      const destination = callbackUrl.startsWith('/') ? callbackUrl : '/pembelian'
      router.replace(destination)
      router.refresh()
    } catch {
      setError('Tidak dapat terhubung ke server. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f6efe9] via-[#f8f5f2] to-[#efe5de] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-[#e7d7ce] bg-white/90 shadow-[0_18px_50px_rgba(109,57,22,0.12)] backdrop-blur-sm">
          <div className="border-b border-[#f0e5df] bg-[#fffaf6] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#9d4400] text-lg font-bold text-white shadow-sm">
                LPI
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9d4400]">
                  Sistem Pembelian
                </p>
                <h1 className="text-xl font-bold text-[#1f2937]">Masuk ke Aplikasi</h1>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-[#374151]">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full rounded-xl border border-[#e5d7cf] bg-[#fffdfc] px-3.5 py-2.5 text-sm text-[#111827] shadow-sm transition focus:border-[#9d4400] focus:outline-none focus:ring-2 focus:ring-[#f5d8c7]"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#374151]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full rounded-xl border border-[#e5d7cf] bg-[#fffdfc] px-3.5 py-2.5 text-sm text-[#111827] shadow-sm transition focus:border-[#9d4400] focus:outline-none focus:ring-2 focus:ring-[#f5d8c7]"
              />
            </div>

            {error ? (
              <div className="rounded-lg border border-[#f7c9c0] bg-[#fff2f0] px-3 py-2 text-sm text-[#a12717]">
                {error}
              </div>
            ) : null}

            <div className="rounded-xl border border-dashed border-[#edd5c8] bg-[#fffaf7] px-3 py-2 text-xs text-[#6b7280]">
              Demo login: <span className="font-semibold text-[#4b5563]">super / super123</span>
            </div>

            <Button
              type="submit"
              className="w-full justify-center rounded-xl bg-[#9d4400] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#7d3400]"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
