import AppShell from '@/components/layout/AppShell'

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="ms text-[64px] text-primary/30">grid_view</span>
        <h1 className="text-headline-lg font-headline-lg text-on-surface">Dashboard</h1>
        <p className="text-body-md font-body-md text-on-surface-variant">Halaman ini sedang dalam pengembangan.</p>
      </div>
    </AppShell>
  )
}
