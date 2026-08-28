import { ArrowLeft, MapPin, Package, Receipt, Store, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { orderApi } from '@/api/endpoints'
import type { Order } from '@/api/types'
import { Breadcrumbs } from '@/components/layout'
import { Badge, Button, Card, EmptyState, Modal, Spinner } from '@/components/ui'
import { ORDER_STATUSES, STATUS_TONE } from '@/lib/constants'
import { apiError, cn, formatDate, money } from '@/lib/utils'
import { toast } from '@/store/ui'

const TRACK = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export function OrderDetail() {
  const { orderNumber = '' } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    setLoading(true)
    orderApi
      .detail(orderNumber)
      .then(({ data }) => setOrder(data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [orderNumber])

  if (loading) return <Spinner />
  if (!order) {
    return (
      <EmptyState
        icon={<Receipt className="size-7" />}
        title="Order not found"
        action={
          <Link to="/orders">
            <Button>Back to orders</Button>
          </Link>
        }
      />
    )
  }

  const cancellable = !['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status)
  const stepIndex = TRACK.indexOf(order.status)
  const cancelled = order.status === 'CANCELLED'

  async function cancel() {
    setCancelling(true)
    try {
      const { data } = await orderApi.cancel(orderNumber)
      setOrder(data)
      toast.success('Order cancelled')
      setCancelOpen(false)
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setCancelling(false)
    }
  }

  // Lines are grouped by seller — each fulfils their own part.
  const byVendor = order.items.reduce<Record<string, typeof order.items>>((acc, item) => {
    const key = item.vendor_name ?? 'Removed seller'
    ;(acc[key] ??= []).push(item)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-5xl px-4 py-9 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Orders', to: '/orders' },
          { label: order.order_number },
        ]}
      />

      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/orders"
            className="mb-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-[var(--primary)]"
          >
            <ArrowLeft className="size-4" />
            All orders
          </Link>
          <h1 className="font-mono text-2xl font-extrabold tracking-tight">{order.order_number}</h1>
          <p className="mt-1.5 text-sm text-muted">Placed {formatDate(order.created_at, true)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge tone={STATUS_TONE[order.status] ?? 'neutral'} dot>
            {order.status}
          </Badge>
          <Badge tone={STATUS_TONE[order.payment_status] ?? 'neutral'}>
            {order.payment_status}
          </Badge>
          {cancellable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelOpen(true)}
              icon={<XCircle className="size-4" />}
            >
              Cancel order
            </Button>
          )}
        </div>
      </div>

      {/* tracker */}
      {!cancelled && (
        <Card className="mb-6 p-6">
          <div className="flex items-center">
            {TRACK.map((step, i) => (
              <div key={step} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <span
                    className={cn(
                      'flex size-9 items-center justify-center rounded-full text-xs font-bold transition-colors',
                      i <= stepIndex
                        ? 'bg-[var(--primary)] text-[var(--primary-fg)]'
                        : 'bg-[var(--surface-3)] text-[var(--text-subtle)]',
                    )}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      'text-[11px] font-bold tracking-wide uppercase',
                      i <= stepIndex ? 'text-[var(--text)]' : 'text-[var(--text-subtle)]',
                    )}
                  >
                    {step}
                  </span>
                </div>
                {i < TRACK.length - 1 && (
                  <div
                    className={cn(
                      'mx-2 -mt-6 h-0.5 flex-1 rounded-full transition-colors',
                      i < stepIndex ? 'bg-[var(--primary)]' : 'bg-[var(--surface-3)]',
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {Object.entries(byVendor).map(([vendorName, lines]) => (
            <Card key={vendorName} className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-2)] px-5 py-3">
                <Store className="size-4 text-[var(--primary)]" />
                {lines[0].vendor_slug ? (
                  <Link
                    to={`/shop/${lines[0].vendor_slug}`}
                    className="text-sm font-bold hover:text-[var(--primary)]"
                  >
                    {vendorName}
                  </Link>
                ) : (
                  <span className="text-sm font-bold">{vendorName}</span>
                )}
                <Badge tone={STATUS_TONE[lines[0].status] ?? 'neutral'} className="ml-auto">
                  {lines[0].status}
                </Badge>
              </div>

              <div className="divide-y divide-[var(--border)]">
                {lines.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-5">
                    <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)]">
                      <img src={item.image_url} alt="" className="size-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      {item.product_slug ? (
                        <Link
                          to={`/product/${item.product_slug}`}
                          className="line-clamp-2 font-semibold hover:text-[var(--primary)]"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <p className="line-clamp-2 font-semibold">{item.title}</p>
                      )}
                      <p className="mt-1 text-sm text-muted">
                        {money(item.unit_price)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold">{money(item.line_total)}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-bold">
              <MapPin className="size-4 text-[var(--primary)]" />
              Delivery address
            </h2>
            <div className="mt-3.5 space-y-1 text-sm">
              <p className="font-semibold">{order.ship_full_name}</p>
              <p className="leading-relaxed text-muted">{order.ship_address_line}</p>
              <p className="text-muted">{order.ship_phone}</p>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-bold">
              <Package className="size-4 text-[var(--primary)]" />
              Payment summary
            </h2>
            <dl className="mt-3.5 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-semibold">{money(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="font-semibold">
                  {Number(order.shipping_fee) === 0 ? (
                    <span className="text-[var(--success)]">Free</span>
                  ) : (
                    money(order.shipping_fee)
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">GST</dt>
                <dd className="font-semibold">{money(order.tax, true)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-[var(--border)] pt-2.5">
                <dt className="font-bold">Total</dt>
                <dd className="text-xl font-extrabold">{money(order.total, true)}</dd>
              </div>
              <div className="flex justify-between pt-1">
                <dt className="text-muted">Paid via</dt>
                <dd className="font-semibold">{order.payment_method}</dd>
              </div>
            </dl>
          </Card>

          {order.note && (
            <Card className="p-5">
              <h2 className="font-bold">Your note</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{order.note}</p>
            </Card>
          )}
        </div>
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel this order?"
        description="Stock goes back to the sellers and this cannot be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              Keep order
            </Button>
            <Button variant="danger" loading={cancelling} onClick={cancel}>
              Yes, cancel it
            </Button>
          </>
        }
      />
    </div>
  )
}

export { ORDER_STATUSES }
