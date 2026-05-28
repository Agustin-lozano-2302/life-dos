import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
