import { ExternalLink, Save, Store } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { vendorApi } from '@/api/endpoints'
import type { Vendor } from '@/api/types'
import { PageHeader } from '@/components/layout'
import { Badge, Button, Card, Input, Select, Spinner, Textarea } from '@/components/ui'
import { INDIAN_STATES, STATUS_TONE } from '@/lib/constants'
import { apiError, money } from '@/lib/utils'
import { toast } from '@/store/ui'

export function VendorShopSettings() {
  const [shop, setShop] = useState<Vendor | null>(null)
  const [form, setForm] = useState({
    shop_name: '',
    tagline: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    city: '',
    state: 'Tamil Nadu',
    logo_url: '',
    banner_url: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    vendorApi
      .myShop()
      .then(({ data }) => {
        setShop(data)
        setForm({
          shop_name: data.shop_name,
          tagline: data.tagline ?? '',
          description: data.description ?? '',
          contact_email: data.contact_email ?? '',
          contact_phone: data.contact_phone ?? '',
          city: data.city ?? '',
          state: data.state || 'Tamil Nadu',
          logo_url: data.logo_display ?? '',
          banner_url: data.banner_display ?? '',
        })
      })
      .catch(() => toast.error('Could not load your shop'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setSaving(true)
    try {
      const { data } = await vendorApi.updateShop(form)
      setShop(data)
      toast.success('Shop updated')
    } catch (error: any) {
      const fields = error?.response?.data
      if (fields && typeof fields === 'object') {
        setErrors(
          Object.fromEntries(
            Object.entries(fields).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)]),
          ),
        )
      }
      toast.error(apiError(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Shop settings"
        description="How your shop appears across the marketplace."
        action={
          shop && (
            <Link to={`/shop/${shop.slug}`}>
              <Button variant="outline" icon={<ExternalLink className="size-4" />}>
                View public shop
              </Button>
            </Link>
          )
        }
      />

      <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card className="space-y-4 p-6">
            <h2 className="font-bold">Shop profile</h2>
            <Input
              label="Shop name"
              required
              value={form.shop_name}
              onChange={set('shop_name')}
              error={errors.shop_name}
            />
            <Input
              label="Tagline"
              value={form.tagline}
              onChange={set('tagline')}
              hint="One line shown under your shop name."
            />
            <Textarea
              label="About your shop"
              rows={5}
              value={form.description}
              onChange={set('description')}
            />
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-bold">Contact and location</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Contact email"
                type="email"
                value={form.contact_email}
                onChange={set('contact_email')}
              />
              <Input
                label="Contact phone"
                type="tel"
                value={form.contact_phone}
                onChange={set('contact_phone')}
              />
              <Input label="City" value={form.city} onChange={set('city')} />
              <Select
                label="State"
                options={INDIAN_STATES.map((s) => ({ label: s, value: s }))}
                value={form.state}
                onChange={set('state')}
              />
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-bold">Branding</h2>
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
          </Card>
        </div>

        <div className="space-y-5 lg:sticky lg:top-32 lg:self-start">
          <Card className="overflow-hidden">
            <div className="relative h-20 bg-[var(--surface-2)]">
              {form.banner_url && (
                <img src={form.banner_url} alt="" className="size-full object-cover opacity-70" />
              )}
            </div>
            <div className="px-5 pb-5">
              <div className="-mt-8 mb-3 size-16 overflow-hidden rounded-2xl border-4 border-[var(--surface)] bg-[var(--surface-2)]">
                {form.logo_url ? (
                  <img src={form.logo_url} alt="" className="size-full object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center bg-[var(--primary)] font-bold text-[var(--primary-fg)]">
                    {form.shop_name[0] ?? 'S'}
                  </span>
                )}
              </div>
              <p className="font-bold">{form.shop_name || 'Your shop'}</p>
              <p className="mt-0.5 line-clamp-2 text-[13px] text-muted">{form.tagline}</p>
            </div>
          </Card>

          <Card className="space-y-3.5 p-5">
            <h2 className="font-bold">Shop status</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Status</span>
              <Badge tone={STATUS_TONE[shop?.status ?? 'PENDING'] ?? 'neutral'} dot>
                {shop?.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Commission</span>
              <span className="font-bold">{shop?.commission_rate}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Lifetime sales</span>
              <span className="font-bold">{money(shop?.total_sales)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Products</span>
              <span className="font-bold">{shop?.product_count}</span>
            </div>
            <p className="border-t border-[var(--border)] pt-3.5 text-xs leading-relaxed text-subtle">
              Your commission rate is set by the marketplace admin.
            </p>
          </Card>

          <Button type="submit" loading={saving} className="w-full" icon={<Save className="size-4" />}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  )
}

export { Store }
