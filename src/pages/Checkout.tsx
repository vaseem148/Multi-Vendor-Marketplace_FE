import { Check, CreditCard, Lock, MapPin, Plus, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { authApi, orderApi } from '@/api/endpoints'
import type { Address } from '@/api/types'
import { PageHeader } from '@/components/layout'
import { Button, Card, EmptyState, Input, Select, Spinner } from '@/components/ui'
import { INDIAN_STATES, PAYMENT_METHODS } from '@/lib/constants'
import { apiError, cn, money } from '@/lib/utils'
import { useCart } from '@/store/cart'
import { toast } from '@/store/ui'

const BLANK = {
  ship_full_name: '',
  ship_phone: '',
  ship_line1: '',
  ship_line2: '',
  ship_city: '',
  ship_state: 'Tamil Nadu',
  ship_postal_code: '',
  ship_country: 'India',
}

export function Checkout() {
  const { cart, loading, fetch } = useCart()
  const navigate = useNavigate()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressId, setAddressId] = useState<number | null>(null)
  const [useNew, setUseNew] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [payment, setPayment] = useState('COD')
  const [note, setNote] = useState('')
  const [placing, setPlacing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    authApi
      .addresses()
      .then(({ data }) => {
        setAddresses(data)
        const preferred = data.find((a) => a.is_default) ?? data[0]
        if (preferred) setAddressId(preferred.id)
        else setUseNew(true)
      })
      .catch(() => setUseNew(true))
  }, [])

  if (loading && !cart) return <Spinner />

  const items = cart?.items ?? []
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart className="size-7" />}
        title="Nothing to check out"
        description="Add something to your cart first."
        action={
          <Link to="/shop">
            <Button size="lg">Browse products</Button>
          </Link>
        }
      />
    )
  }

  const totals = cart!.totals

  function set(key: keyof typeof BLANK) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function placeOrder() {
    setErrors({})
    setPlacing(true)
    try {
      const payload =
        useNew || !addressId
          ? { ...form, payment_method: payment, note }
          : { address_id: addressId, payment_method: payment, note }
      const { data } = await orderApi.checkout(payload)
      await fetch()
      toast.success(`Order ${data.order_number} placed`)
      navigate(`/orders/${data.order_number}`, { replace: true })
    } catch (error: any) {
      const fields = error?.response?.data
      if (fields && typeof fields === 'object') {
        setErrors(
          Object.fromEntries(
            Object.entries(fields).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)]),
          ),
        )
      }
      toast.error(apiError(error, 'Could not place your order.'))
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-9 lg:px-8">
      <PageHeader title="Checkout" description="Confirm where it goes and how you want to pay." />

      <div className="grid gap-7 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* address */}
          <Card className="p-6">
            <h2 className="flex items-center gap-2.5 text-lg font-bold">
              <MapPin className="size-5 text-[var(--primary)]" />
              Delivery address
            </h2>

            {addresses.length > 0 && (
              <div className="mt-5 space-y-2.5">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    onClick={() => {
                      setAddressId(address.id)
                      setUseNew(false)
                    }}
                    className={cn(
                      'flex w-full items-start gap-3.5 rounded-xl border p-4 text-left transition-all',
                      !useNew && addressId === address.id
                        ? 'border-[var(--primary)] bg-[var(--primary-soft)]'
                        : 'border-[var(--border)] hover:border-[var(--border-strong)]',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                        !useNew && addressId === address.id
                          ? 'border-[var(--primary)] bg-[var(--primary)]'
                          : 'border-[var(--border-strong)]',
                      )}
                    >
                      {!useNew && addressId === address.id && (
                        <Check className="size-3 text-[var(--primary-fg)]" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="font-bold">{address.full_name}</span>
                        <span className="rounded bg-[var(--surface-3)] px-1.5 py-0.5 text-[11px] font-bold uppercase">
                          {address.label}
                        </span>
                      </span>
                      <span className="mt-1 block text-sm text-muted">{address.one_line}</span>
                      <span className="mt-0.5 block text-sm text-muted">{address.phone}</span>
                    </span>
                  </button>
                ))}

                <button
                  onClick={() => setUseNew(true)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl border border-dashed p-4 text-sm font-semibold transition-all',
                    useNew
                      ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]'
                      : 'border-[var(--border-strong)] text-[var(--text-muted)] hover:border-[var(--primary)]',
                  )}
                >
                  <Plus className="size-4" />
                  Deliver to a new address
                </button>
              </div>
            )}

            {(useNew || addresses.length === 0) && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Input
                  label="Full name"
                  required
                  value={form.ship_full_name}
                  onChange={set('ship_full_name')}
                  error={errors.ship_full_name}
                />
                <Input
                  label="Phone"
                  required
                  type="tel"
                  value={form.ship_phone}
                  onChange={set('ship_phone')}
                  error={errors.ship_phone}
                />
                <Input
                  label="Address line 1"
                  required
                  className="sm:col-span-2"
                  placeholder="House number, street"
                  value={form.ship_line1}
                  onChange={set('ship_line1')}
                  error={errors.ship_line1}
                />
                <Input
                  label="Address line 2"
                  className="sm:col-span-2"
                  placeholder="Landmark, area (optional)"
                  value={form.ship_line2}
                  onChange={set('ship_line2')}
                />
                <Input
                  label="City"
                  required
                  value={form.ship_city}
                  onChange={set('ship_city')}
                  error={errors.ship_city}
                />
                <Select
                  label="State"
                  required
                  options={INDIAN_STATES.map((s) => ({ label: s, value: s }))}
                  value={form.ship_state}
                  onChange={set('ship_state')}
                />
                <Input
                  label="PIN code"
                  required
                  inputMode="numeric"
                  value={form.ship_postal_code}
                  onChange={set('ship_postal_code')}
                  error={errors.ship_postal_code}
                />
                <Input label="Country" value={form.ship_country} onChange={set('ship_country')} />
              </div>
            )}
          </Card>

          {/* payment */}
          <Card className="p-6">
            <h2 className="flex items-center gap-2.5 text-lg font-bold">
              <CreditCard className="size-5 text-[var(--primary)]" />
              Payment method
            </h2>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.value}
                  onClick={() => setPayment(method.value)}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border p-4 text-left transition-all',
                    payment === method.value
                      ? 'border-[var(--primary)] bg-[var(--primary-soft)]'
                      : 'border-[var(--border)] hover:border-[var(--border-strong)]',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                      payment === method.value
                        ? 'border-[var(--primary)] bg-[var(--primary)]'
                        : 'border-[var(--border-strong)]',
                    )}
                  >
                    {payment === method.value && (
                      <Check className="size-3 text-[var(--primary-fg)]" />
                    )}
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{method.label}</span>
                    <span className="mt-0.5 block text-xs text-muted">{method.hint}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-subtle">
              <Lock className="size-3.5" />
              This is a demo marketplace — no real payment is taken.
            </p>
          </Card>

          <Card className="p-6">
            <Input
              label="Order note"
              placeholder="Anything the sellers should know? (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Card>
        </div>

        {/* summary */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Card className="p-6">
            <h2 className="text-lg font-bold">Your order</h2>

            <div className="mt-5 max-h-72 space-y-3.5 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-2)]">
                    <img
                      src={item.product_detail.image_display}
                      alt=""
                      className="size-full object-cover"
                    />
                    <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[var(--primary)] text-[11px] font-bold text-[var(--primary-fg)]">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[13px] font-semibold">
                      {item.product_detail.title}
                    </p>
                    <p className="text-xs text-subtle">{item.product_detail.vendor_name}</p>
                  </div>
                  <span className="text-sm font-bold">{money(item.line_total)}</span>
                </div>
              ))}
            </div>

            <dl className="mt-5 space-y-3 border-t border-[var(--border)] pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-semibold">{money(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="font-semibold">
                  {Number(totals.shipping_fee) === 0 ? (
                    <span className="text-[var(--success)]">Free</span>
                  ) : (
                    money(totals.shipping_fee)
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">GST (5%)</dt>
                <dd className="font-semibold">{money(totals.tax, true)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-[var(--border)] pt-3">
                <dt className="font-bold">Total</dt>
                <dd className="text-2xl font-extrabold tracking-tight">
                  {money(totals.total, true)}
                </dd>
              </div>
            </dl>

            <Button size="lg" className="mt-6 w-full" loading={placing} onClick={placeOrder}>
              Place order · {money(totals.total, true)}
            </Button>
            {errors.cart && (
              <p className="mt-3 text-center text-sm font-medium text-[var(--danger)]">
                {errors.cart}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
