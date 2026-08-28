import { ArrowRight, Lock, Mail, Phone, User } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'

import { Button, Input } from '@/components/ui'
import { apiError } from '@/lib/utils'
import { useAuth } from '@/store/auth'
import { toast } from '@/store/ui'

import { AuthShell } from './Login'

export function Register() {
  const { register, loading, user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    password2: '',
  })
  const [error, setError] = useState('')

  if (user) return <Navigate to={next} replace />

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.password2) {
      setError('Passwords do not match.')
      return
    }
    try {
      const created = await register(form)
      toast.success(`Account created. Welcome, ${created.display_name}`)
      navigate(next, { replace: true })
    } catch (err) {
      setError(apiError(err, 'Could not create your account.'))
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="One account for shopping, orders and opening your own shop."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to={`/login?next=${encodeURIComponent(next)}`}
            className="font-semibold text-[var(--primary)] hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Full name"
          required
          autoComplete="name"
          placeholder="Your name"
          leading={<User className="size-4" />}
          value={form.full_name}
          onChange={set('full_name')}
        />
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          leading={<Mail className="size-4" />}
          value={form.email}
          onChange={set('email')}
        />
        <Input
          label="Phone"
          type="tel"
          autoComplete="tel"
          placeholder="+91 90000 00000"
          leading={<Phone className="size-4" />}
          value={form.phone}
          onChange={set('phone')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            leading={<Lock className="size-4" />}
            value={form.password}
            onChange={set('password')}
          />
          <Input
            label="Confirm"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Repeat password"
            leading={<Lock className="size-4" />}
            value={form.password2}
            onChange={set('password2')}
            error={error}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="w-full"
          icon={<ArrowRight className="size-4.5" />}
        >
          Create account
        </Button>
        <p className="text-center text-xs leading-relaxed text-subtle">
          By signing up you agree to the marketplace terms and privacy policy.
        </p>
      </form>
    </AuthShell>
  )
}
