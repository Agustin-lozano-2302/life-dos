import { Outlet, useLocation } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { BottomNav } from './BottomNav'
import { GlassBlobs, type BlobDomain } from './GlassBlobs'

function routeToDomain(pathname: string): BlobDomain {
  if (pathname.startsWith('/habitos')) return 'habitos'
  if (pathname.startsWith('/projects')) return 'projects'
  if (pathname.startsWith('/goals')) return 'goals'
  if (pathname.startsWith('/notes')) return 'notes'
  return 'dashboard'
}

export function AppLayout() {
  const { pathname } = useLocation()
  const domain = routeToDomain(pathname)

  return (
    <div
      className="relative flex h-dvh flex-col overflow-hidden text-white"
      style={{ background: 'linear-gradient(150deg, #0d0c22 0%, #070710 55%, #080614 100%)' }}
    >
      <GlassBlobs domain={domain} />
      <AppHeader />
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
