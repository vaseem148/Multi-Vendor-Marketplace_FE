import { MapPin, Receipt, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import { vendorApi } from '@/api/endpoints'
import type { VendorOrderItem } from '@/api/types'
import { PageHeader } from '@/components/layout'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Pagination,
  Spinner,
  Tabs,
} from '@/components/ui'
import { NEXT_STATUS, STATUS_TONE } from '@/lib/constants'
import { apiError, formatDate, money } from '@/lib/utils'
import { toast } from '@/store/ui'

const TABS = [
  { label: 'All', value: '' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export function VendorOrders() {
  const [lines, setLines] = useState<VendorOrderItem[]>([])
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ count: 0, numPages: 1 })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setLoading(true)
    vendorApi
      .orders({ status, search: query, page, page_size: 10 })
      .then(({ data }) => {
        setLines(data.results)
        setMeta({ count: data.count, numPages: data.num_pages })
      })
      .catch(() => setLines([]))
      .finally(() => setLoading(false))
  }, [status, query, page])

  async function advance(line: VendorOrderItem, next: string) {
    setUpdating(line.id)
    try {
      const { data } = await vendorApi.setOrderStatus(line.id, next)
      setLines((list) => list.map((l) => (l.id === data.id ? data : l)))
      toast.success(`Marked as ${next.toLowerCase()}`)
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        description={`${meta.count} order lines to fulfil`}
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
      ) : lines.length === 0 ? (
        <EmptyState
          icon={<Receipt className="size-7" />}
          title="No orders here"
          description={status ? 'Nothing with this status yet.' : 'Orders will appear as they come in.'}
        />
      ) : (
        <>
          <div className="space-y-4">
            {lines.map((line) => {
              const options = NEXT_STATUS[line.status] ?? []
              return (
                <Card key={line.id} className="overflow-hidden">
                  <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-2)] px-5 py-3">
                    <span className="font-mono text-sm font-bold">{line.order_number}</span>
                    <span className="text-xs text-muted">{formatDate(line.placed_at, true)}</span>
                    <Badge tone={STATUS_TONE[line.status] ?? 'neutral'} dot className="ml-auto">
                      {line.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-start gap-5 p-5">
                    <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)]">
                      <img src={line.image_url} alt="" className="size-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{line.title}</p>
                      <p className="mt-1 text-sm text-muted">
                        {money(line.unit_price)} × {line.quantity} ={' '}
                        <span className="font-semibold text-[var(--text)]">
                          {money(line.line_total)}
                        </span>
                      </p>
                      <p className="mt-2.5 flex items-start gap-1.5 text-[13px] text-muted">
                        <MapPin className="mt-0.5 size-3.5 shrink-0" />
                        <span>
                          <span className="font-semibold text-[var(--text)]">
                            {line.customer_name}
                          </span>{' '}
                          — {line.ship_to}
                        </span>
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">
                        You earn
                      </p>
                      <p className="text-xl font-extrabold tracking-tight text-[var(--success)]">
                        {money(line.vendor_earning, true)}
                      </p>
                      <p className="mt-0.5 text-xs text-subtle">
                        after {line.commission_rate}% ({money(line.commission_amount, true)})
                      </p>
                    </div>
                  </div>

                  {options.length > 0 && (
                    <div className="flex flex-wrap gap-2 border-t border-[var(--border)] px-5 py-3.5">
                      {options.map((next) => (
                        <Button
                          key={next}
                          size="sm"
                          variant={next === 'CANCELLED' ? 'outline' : 'primary'}
                          loading={updating === line.id}
                          onClick={() => advance(line, next)}
                        >
                          Mark {next.toLowerCase()}
                        </Button>
                      ))}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
          <Pagination page={page} numPages={meta.numPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
