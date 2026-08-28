import { ArrowRight, Minus, Plus, ShoppingCart, Store, Trash2, Truck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/layout'
import { Button, Card, EmptyState, Spinner } from '@/components/ui'
import { money } from '@/lib/utils'
import { useAuth } from '@/store/auth'
import { useCart } from '@/store/cart'

export function Cart() {
  const { user, ready } = useAuth()
  const { cart, loading, setQuantity, remove } = useCart()
  const navigate = useNavigate()

  // /cart sits outside RequireAuth, so wait for hydrate() before deciding the
  // user is signed out — otherwise a reload flashes the sign-in screen.
  if (!ready) return <Spinner />

  if (!user) {
    return (
      <EmptyState
        icon={<ShoppingCart className="size-7" />}
        title="Sign in to see your cart"
        description="Your cart is saved to your account, so it follows you across devices."
        action={
          <Link to="/login?next=/cart">
            <Button size="lg">Sign in</Button>
          </Link>
        }
      />
    )
  }

  if (loading && !cart) return <Spinner />

  const items = cart?.items ?? []

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart className="size-7" />}
        title="Your cart is empty"
        description="Browse the marketplace and add something you like."
        action={
          <Link to="/shop">
            <Button size="lg" icon={<ArrowRight className="size-4.5" />}>
              Start shopping
            </Button>
          </Link>
        }
      />
    )
  }

  const totals = cart!.totals
  const threshold = Number(totals.free_shipping_threshold)
  const subtotal = Number(totals.subtotal)
  const remaining = Math.max(0, threshold - subtotal)

  // Group lines by seller — a multi-vendor cart should look like one.
  const byVendor = items.reduce<Record<string, typeof items>>((acc, item) => {
    const key = item.product_detail.vendor_name
    ;(acc[key] ??= []).push(item)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-7xl px-4 py-9 lg:px-8">
      <PageHeader
        title="Your cart"
        description={`${cart!.item_count} item${cart!.item_count === 1 ? '' : 's'} from ${
          Object.keys(byVendor).length
        } seller${Object.keys(byVendor).length === 1 ? '' : 's'}`}
      />

      {remaining > 0 && (
        <Card className="mb-6 flex items-center gap-3.5 border-[var(--primary)]/30 bg-[var(--primary-soft)] p-4">
          <Truck className="size-5 shrink-0 text-[var(--primary)]" />
          <p className="text-sm font-medium text-[var(--primary)]">
            Add {money(remaining)} more to unlock free delivery.
          </p>
        </Card>
      )}

      <div className="grid gap-7 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {Object.entries(byVendor).map(([vendorName, vendorItems]) => (
            <Card key={vendorName} className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-2)] px-5 py-3">
                <Store className="size-4 text-[var(--primary)]" />
                <Link
                  to={`/shop/${vendorItems[0].product_detail.vendor_slug}`}
                  className="text-sm font-bold transition-colors hover:text-[var(--primary)]"
                >
                  {vendorName}
                </Link>
                <span className="ml-auto text-xs text-muted">
                  {vendorItems.length} item{vendorItems.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="divide-y divide-[var(--border)]">
                {vendorItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-5">
                    <Link
                      to={`/product/${item.product_detail.slug}`}
                      className="size-24 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)]"
                    >
                      <img
                        src={item.product_detail.image_display}
                        alt={item.product_detail.title}
                        className="size-full object-cover"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link
                        to={`/product/${item.product_detail.slug}`}
                        className="line-clamp-2 font-semibold transition-colors hover:text-[var(--primary)]"
                      >
                        {item.product_detail.title}
                      </Link>
                      <p className="mt-1 text-sm text-muted">
                        {money(item.product_detail.price)} each
                      </p>
                      {item.product_detail.stock <= 5 && (
                        <p className="mt-1 text-xs font-semibold text-[var(--warning)]">
                          Only {item.product_detail.stock} left
                        </p>
                      )}

                      <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
                        <div className="flex h-9 items-center rounded-lg border border-[var(--border-strong)]">
                          <button
                            onClick={() => setQuantity(item.id, item.quantity - 1)}
                            className="flex size-9 items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)]"
                            aria-label="Decrease"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <button
                            onClick={() => setQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product_detail.stock}
                            className="flex size-9 items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-40"
                            aria-label="Increase"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => remove(item.id)}
                          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--danger)]"
                        >
                          <Trash2 className="size-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>

                    <span className="shrink-0 text-lg font-bold tracking-tight">
                      {money(item.line_total)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* summary */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Card className="p-6">
            <h2 className="text-lg font-bold">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <Row label={`Subtotal (${cart!.item_count} items)`} value={money(totals.subtotal)} />
              <Row
                label="Delivery"
                value={
                  Number(totals.shipping_fee) === 0 ? (
                    <span className="font-bold text-[var(--success)]">Free</span>
                  ) : (
                    money(totals.shipping_fee)
                  )
                }
              />
              <Row label="GST (5%)" value={money(totals.tax, true)} />
              <div className="border-t border-[var(--border)] pt-3">
                <div className="flex items-baseline justify-between">
                  <dt className="font-bold">Total</dt>
                  <dd className="text-2xl font-extrabold tracking-tight">
                    {money(totals.total, true)}
                  </dd>
                </div>
              </div>
            </dl>

            <Button
              size="lg"
              className="mt-6 w-full"
              onClick={() => navigate('/checkout')}
              icon={<ArrowRight className="size-4.5" />}
            >
              Proceed to checkout
            </Button>
            <Link to="/shop" className="mt-3 block">
              <Button variant="ghost" className="w-full">
                Continue shopping
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}
