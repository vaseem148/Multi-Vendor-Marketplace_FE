import {
  BarChart3,
  CheckCircle2,
  Clock,
  Package,
  Store,
  Wallet,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { authApi, vendorApi } from '@/api/endpoints'
import { Button, Card, Input, Select, Textarea } from '@/components/ui'
import { INDIAN_STATES } from '@/lib/constants'
import { apiError } from '@/lib/utils'
import { useAuth } from '@/store/auth'
import { toast } from '@/store/ui'

const BENEFITS = [
  { icon: Package, title: 'List in minutes', body: 'Add products, set your price, publish. No approval queue per item.' },
  { icon: BarChart3, title: 'Your own dashboard', body: 'Track orders, stock and revenue without leaving the site.' },
  { icon: Wallet, title: 'Commission on sales only', body: 'You keep the rest. No listing fee, no monthly subscription.' },
]

export function Sell() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    shop_name: '',
    tagline: '',
    description: '',
    contact_phone: '',
    city: '',
    state: 'Tamil Nadu',
    logo_url: '',
    banner_url: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Someone who already has a shop sees its status instead of the form.
  if (user?.vendor_id) {
    const status = user.vendor_status
    const states = {
      APPROVED: {
        icon: CheckCircle2,
        tone: 'text-[var(--success)]',
        title: 'Your shop is live',
        body: 'Head to your dashboard to manage products and orders.',
        cta: <Link to="/vendor"><Button size="lg">Open dashboard</Button></Link>,
      },
      PENDING: {
        icon: Clock,
        tone: 'text-[var(--warning)]',
        title: 'Application under review',
        body: 'An admin is reviewing your shop. You will be able to list products once it is approved.',
        cta: <Link to="/shop"><Button size="lg" variant="outline">Keep browsing</Button></Link>,
      },
      REJECTED: {
        icon: XCircle,
        tone: 'text-[var(--danger)]',
        title: 'Application not approved',
        body: 'Your shop application was rejected. Get in touch with support to find out more.',
        cta: <Link to="/"><Button size="lg" variant="outline">Back home</Button></Link>,
      },
      SUSPENDED: {
        icon: XCircle,
        tone: 'text-[var(--danger)]',
        title: 'Shop suspended',
        body: 'Your shop has been suspended. Contact support to resolve it.',
        cta: <Link to="/"><Button size="lg" variant="outline">Back home</Button></Link>,
      },
    }
    const view = states[status ?? 'PENDING'] ?? states.PENDING
    const Icon = view.icon

    return (
      <div className="hero-mesh flex min-h-[60vh] items-center justify-center px-4 py-20">
        <Card className="max-w-md p-9 text-center shadow-[var(--shadow-lift)]">
          <Icon className={`mx-auto size-14 ${view.tone}`} />
          <h1 className="mt-5 text-2xl font-bold tracking-tight">{view.title}</h1>
          <p className="mt-3 leading-relaxed text-muted">{view.body}</p>
          <div className="mt-7">{view.cta}</div>
        </Card>
      </div>
    )
  }

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function apply(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return navigate('/login?next=/sell')
    setErrors({})
    setSaving(true)
    try {
      await vendorApi.apply(form)
      const { data } = await authApi.me()
      setUser(data)
      toast.success('Application submitted — an admin will review it shortly.')
    } catch (error: any) {
      const fields = error?.response?.data
      if (fields && typeof fields === 'object') {
        setErrors(
          Object.fromEntries(
            Object.entries(fields).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)]),
          ),
        )
      }
      toast.error(apiError(error, 'Could not submit your application.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <section className="hero-mesh border-b border-[var(--border)] px-4 py-16 text-center lg:py-20">
        <span className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-[var(--primary-fg)]">
          <Store className="size-7" />
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          Open your shop on MVM
        </h1>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-muted">
          Join {' '}independent sellers reaching customers across India. Set up in a few minutes and
          start listing today.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:grid-cols-3 lg:px-8">
        {BENEFITS.map((b) => (
          <Card key={b.title} className="p-6">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <b.icon className="size-5.5" />
            </span>
            <h3 className="mt-4 font-bold">{b.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{b.body}</p>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-20 lg:px-8">
        <Card className="p-7">
          <h2 className="text-xl font-bold tracking-tight">Shop details</h2>
          <p className="mt-1.5 mb-6 text-sm text-muted">
            {user
              ? 'Tell us about your shop. An admin reviews every application before it goes live.'
              : 'Sign in first, then fill this in to apply.'}
          </p>

          <form onSubmit={apply} className="space-y-4">
            <Input
              label="Shop name"
              required
              placeholder="e.g. Spice Route Organics"
              value={form.shop_name}
              onChange={set('shop_name')}
              error={errors.shop_name}
            />
            <Input
              label="Tagline"
              placeholder="One line about what you sell"
              value={form.tagline}
              onChange={set('tagline')}
              hint="Shown under your shop name across the marketplace."
            />
            <Textarea
              label="About your shop"
              placeholder="What do you sell, and what makes it worth buying from you?"
              value={form.description}
              onChange={set('description')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Contact phone"
                type="tel"
                placeholder="+91 90000 00000"
                value={form.contact_phone}
                onChange={set('contact_phone')}
              />
              <Input label="City" placeholder="Chennai" value={form.city} onChange={set('city')} />
            </div>
            <Select
              label="State"
              options={INDIAN_STATES.map((s) => ({ label: s, value: s }))}
              value={form.state}
              onChange={set('state')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Logo URL"
                placeholder="https://…"
                value={form.logo_url}
                onChange={set('logo_url')}
              />
              <Input
                label="Banner URL"
                placeholder="https://…"
                value={form.banner_url}
                onChange={set('banner_url')}
              />
            </div>

            {user ? (
              <Button type="submit" size="lg" loading={saving} className="w-full">
                Submit application
              </Button>
            ) : (
              <Link to="/login?next=/sell" className="block">
                <Button type="button" size="lg" className="w-full">
                  Sign in to apply
                </Button>
              </Link>
            )}
          </form>
        </Card>
      </section>
    </div>
  )
}
