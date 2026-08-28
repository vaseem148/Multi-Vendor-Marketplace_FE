import { ArrowRight, Lock, Mail, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'

import { Button, Card, Input } from '@/components/ui'
import { apiError } from '@/lib/utils'
import { useAuth } from '@/store/auth'
import { toast } from '@/store/ui'

const DEMO_ACCOUNTS = [
  { label: 'Customer', email: 'customer@mvm.com', password: 'customer123' },
  { label: 'Vendor', email: 'vendor@mvm.com', password: 'vendor123' },
  { label: 'Admin', email: 'admin@mvm.com', password: 'admin123' },
]

export function Login() {
  const { login, loading, user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) return <Navigate to={next} replace />

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const signedIn = await login(email, password)
      toast.success(`Welcome back, ${signedIn.display_name}`)
      navigate(next, { replace: true })
    } catch (err) {
      setError(apiError(err, 'Email or password is incorrect.'))
    }
  }

  function useDemo(account: (typeof DEMO_ACCOUNTS)[number]) {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={
        <>
          New to MVM?{' '}
          <Link
            to={`/register?next=${encodeURIComponent(next)}`}
            className="font-semibold text-[var(--primary)] hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          leading={<Mail className="size-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          leading={<Lock className="size-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
        />
        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="w-full"
          icon={<ArrowRight className="size-4.5" />}
        >
          Sign in
        </Button>
      </form>

      <div className="mt-7 rounded-xl border border-dashed border-[var(--border-strong)] p-4">
        <p className="text-[13px] font-bold">Demo accounts</p>
        <p className="mt-0.5 text-xs text-muted">Tap one to fill the form instantly.</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => useDemo(a)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 py-2 text-xs font-semibold transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  )
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="hero-mesh flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--primary-fg)]">
              <ShoppingBag className="size-5.5" />
            </span>
            <span className="text-xl font-extrabold tracking-tight">
              MVM<span className="text-[var(--primary)]">.</span>
            </span>
          </Link>
        </div>

        <Card className="animate-[fade-up_0.4s_cubic-bezier(0.16,1,0.3,1)] p-7 shadow-[var(--shadow-lift)]">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1.5 mb-6 text-sm text-muted">{subtitle}</p>
          {children}
        </Card>

        <p className="mt-6 text-center text-sm text-muted">{footer}</p>
      </div>
    </div>
  )
}
