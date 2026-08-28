import { ArrowRight, Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { orderApi } from '@/api/endpoints'
import type { Order } from '@/api/types'
import { PageHeader } from '@/components/layout'
import { Badge, Button, Card, EmptyState, Pagination, Spinner, Tabs } from '@/components/ui'
import { STATUS_TONE } from '@/lib/constants'
import { formatDate, money } from '@/lib/utils'

const TABS = [
  { label: 'All', value: '' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ count: 0, numPages: 1 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    orderApi
      .list({ status, page, page_size: 8 })
      .then(({ data }) => {
        setOrders(data.results)
        setMeta({ count: data.count, numPages: data.num_pages })
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [status, page])

  return (
    <div className="mx-auto max-w-5xl px-4 py-9 lg:px-8">
      <PageHeader title="My orders" description={`${meta.count} orders placed`} />

      <Tabs
        tabs={TABS}
        value={status}
        onChange={(v) => {
          setStatus(v)
          setPage(1)
        }}
        className="mb-7"
      />

      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Package className="size-7" />}
          title="No orders here yet"
          description={status ? 'Nothing with this status.' : 'Your orders will show up here.'}
          action={
            <Link to="/shop">
              <Button>Start shopping</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} hover className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-4 border-b border-[var(--border)] bg-[var(--surface-2)] px-5 py-3.5">
                <div>
                  <p className="font-mono text-sm font-bold">{order.order_number}</p>
                  <p className="text-xs text-muted">{formatDate(order.created_at, true)}</p>
                </div>
                <div className="ml-auto flex flex-wrap items-center gap-2.5">
                  <Badge tone={STATUS_TONE[order.status] ?? 'neutral'} dot>
                    {order.status}
                  </Badge>
                  <Badge tone={STATUS_TONE[order.payment_status] ?? 'neutral'}>
                    {order.payment_status}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5 p-5">
                <div className="flex -space-x-3">
                  {order.items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="size-14 overflow-hidden rounded-xl border-2 border-[var(--surface)] bg-[var(--surface-2)]"
                    >
                      <img src={item.image_url} alt="" className="size-full object-cover" />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="flex size-14 items-center justify-center rounded-xl border-2 border-[var(--surface)] bg-[var(--surface-3)] text-xs font-bold">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {order.items[0]?.title}
                    {order.items.length > 1 && (
                      <span className="text-muted"> and {order.items.length - 1} more</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {order.item_count} items · {order.payment_method}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-extrabold tracking-tight">{money(order.total, true)}</p>
                </div>

                <Link to={`/orders/${order.order_number}`}>
                  <Button variant="outline" size="sm" icon={<ArrowRight className="size-4" />}>
                    Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}

          <Pagination page={page} numPages={meta.numPages} onChange={setPage} />
        </div>
      )}
    </div>
  )
}
