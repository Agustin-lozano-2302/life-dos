import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signInWithGoogle } from '@/lib/supabase/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/habitos', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error con Google')
      setGoogleLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'linear-gradient(150deg, #0d0c22 0%, #070710 55%, #080614 100%)' }}
    >
      {/* Ambient blobs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute rounded-full blur-[70px]" style={{ backgroundColor: '#6366f1', width: '420px', height: '420px', top: '-10%', left: '20%', opacity: '0.25' }} />
        <div className="absolute rounded-full blur-[70px]" style={{ backgroundColor: '#8b5cf6', width: '350px', height: '350px', top: '50%', left: '55%', opacity: '0.18' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <img
            src="/logos/lifedos-logo-nobg.png"
            alt="Life Do's logo"
            className="h-16 w-16 drop-shadow-[0_0_24px_rgba(99,102,241,0.5)]"
          />
          <div className="text-center">
            <h1 className="text-[28px] font-extrabold tracking-[-0.5px] text-white">Life Do's</h1>
            <p className="mt-1 text-sm text-white/40">Tu espacio de productividad personal</p>
          </div>
        </div>

        {/* Glass card */}
        <div
          className="rounded-[20px] border border-white/[0.12] p-6 backdrop-blur-2xl backdrop-saturate-[180%]"
          style={{ backgroundColor: 'rgba(255,255,255,0.07)', boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)' }}
        >
          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-[14px] border border-white/[0.15] bg-white/[0.08] py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.12] disabled:opacity-50"
          >
            {googleLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
              </svg>
            )}
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.08]" />
            <span className="text-xs text-white/30">o</span>
            <div className="h-px flex-1 bg-white/[0.08]" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-white/40">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-[12px] border border-white/[0.12] bg-white/[0.05] px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-indigo-400/40"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-white/40">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-[12px] border border-white/[0.12] bg-white/[0.05] px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-indigo-400/40"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full rounded-[14px] bg-indigo-500/30 py-2.5 text-sm font-semibold text-indigo-200 transition-colors hover:bg-indigo-500/40 disabled:opacity-50"
            >
              {loading ? 'Entrando…' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
