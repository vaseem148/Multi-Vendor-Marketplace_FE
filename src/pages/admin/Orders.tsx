import { ChevronDown, Receipt, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import { adminApi } from '@/api/endpoints'
import type { Order } from '@/api/types'
import { PageHeader } from '@/components/layout'
import {
  Badge,
  Card,
  EmptyState,
  Pagination,
  Select,
  Spinner,
  Tabs,
} from '@/components/ui'
import { ORDER_STATUSES, STATUS_TONE } from '@/lib/constants'
import { apiError, cn, formatDate, money } from '@/lib/utils'
import { toast } from '@/store/ui'

const TABS = [
  { label: 'All', value: '' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ count: 0, numPages: 1 })
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setLoading(true)
    adminApi
      .orders({ status, search: query, page, page_size: 10 })
      .then(({ data }) => {
        setOrders(data.results)
        setMeta({ count: data.count, numPages: data.num_pages })
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [status, query, page])

  async function setOrderStatus(order: Order, next: string) {
    try {
      const { data } = await adminApi.setOrderStatus(order.order_number, next)
      setOrders((list) => list.map((o) => (o.id === data.id ? data : o)))
      toast.success(`${order.order_number} set to ${next.toLowerCase()}`)
    } catch (error) {
      toast.error(apiError(error))
    }
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        description={`${meta.count} orders placed on the marketplace`}
        action={
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--text-subtle)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Order number or customer"
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pr-3 pl-10 text-sm focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
        }
      />

      <Tabs
        tabs={TABS}
        value={status}
        onChange={(v) => {
          setStatus(v)
          setPage(1)
        }}
        className="mb-6"
      />

      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <EmptyState icon={<Receipt className="size-7" />} title="No orders found" />
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  className="flex w-full flex-wrap items-center gap-4 p-4 text-left transition-colors hover:bg-[var(--surface-2)]"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-bold">{order.order_number}</p>
                    <p className="text-xs text-muted">
                      {order.customer_email} · {formatDate(order.created_at, true)}
                    </p>
                  </div>

                  <div className="ml-auto flex flex-wrap items-center gap-2.5">
                    <Badge tone={STATUS_TONE[order.payment_status] ?? 'neutral'}>
                      {order.payment_status}
                    </Badge>
                    <Badge tone={STATUS_TONE[order.status] ?? 'neutral'} dot>
                      {order.status}
                    </Badge>
                    <span className="w-24 text-right font-bold">{money(order.total, true)}</span>
                    <ChevronDown
                      className={cn(
                        'size-4 text-[var(--text-subtle)] transition-transform',
                        expanded === order.id && 'rotate-180',
                      )}
                    />
                  </div>
                </button>

                {expanded === order.id && (
                  <div className="animate-[fade-in_0.2s_ease] border-t border-[var(--border)] p-5">
                    <div className="grid gap-6 sm:grid-cols-[1fr_260px]">
                      <div>
                        <h3 className="mb-3 text-[13px] font-bold tracking-wider uppercase">
                          Items ({order.item_count})
                        </h3>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="size-11 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-2)]">
                                <img src={item.image_url} alt="" className="size-full object-cover" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-semibold">{item.title}</p>
                                <p className="text-xs text-muted">
                                  {item.vendor_name} · {money(item.unit_price)} × {item.quantity}
                                </p>
                              </div>
                              <Badge tone={STATUS_TONE[item.status] ?? 'neutral'}>
                                {item.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="mb-2 text-[13px] font-bold tracking-wider uppercase">
                            Ships to
                          </h3>
                          <p className="text-[13px] font-semibold">{order.ship_full_name}</p>
                          <p className="text-[13px] leading-relaxed text-muted">
                            {order.ship_address_line}
                          </p>
                          <p className="text-[13px] text-muted">{order.ship_phone}</p>
                        </div>

                        <div>
                          <h3 className="mb-2 text-[13px] font-bold tracking-wider uppercase">
                            Override status
                          </h3>
                          <Select
                            className="h-9"
                            options={ORDER_STATUSES.map((s) => ({ label: s, value: s }))}
                            value={order.status}
                            onChange={(e) => setOrderStatus(order, e.target.value)}
                          />
                          <p className="mt-1.5 text-xs text-subtle">
                            Applies to every line in this order.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
          <Pagination page={page} numPages={meta.numPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
