import {
  AlertTriangle,
  ArrowRight,
  IndianRupee,
  Package,
  Plus,
  Receipt,
  Star,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { vendorApi } from '@/api/endpoints'
import type { VendorOrderItem, VendorStats } from '@/api/types'
import { PageHeader } from '@/components/layout'
import { Badge, Button, Card, Spinner, StatTile } from '@/components/ui'
import { STATUS_TONE } from '@/lib/constants'
import { formatDate, money } from '@/lib/utils'
import { useAuth } from '@/store/auth'

export function VendorOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState<VendorStats | null>(null)
  const [recent, setRecent] = useState<VendorOrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([vendorApi.stats(), vendorApi.orders({ page_size: 6 })])
      .then(([s, o]) => {
        setStats(s.data)
        setRecent(o.data.results)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.display_name}`}
        description="Here is how your shop is doing."
        action={
          <Link to="/vendor/products/new">
            <Button icon={<Plus className="size-4" />}>Add product</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Total earnings"
          value={money(stats?.earnings_total)}
          hint={`After ${stats?.commission_rate}% commission`}
          icon={<IndianRupee className="size-5" />}
          tone="success"
        />
        <StatTile
          label="This month"
          value={money(stats?.earnings_this_month)}
          hint={`${stats?.units_sold ?? 0} units sold lifetime`}
          icon={<TrendingUp className="size-5" />}
          tone="info"
        />
        <StatTile
          label="Orders"
          value={stats?.orders_total ?? 0}
          hint={`${stats?.orders_pending ?? 0} awaiting action`}
          icon={<Receipt className="size-5" />}
          tone="warning"
        />
        <StatTile
          label="Products live"
          value={`${stats?.products_published ?? 0}/${stats?.products_total ?? 0}`}
          hint={`${stats?.products_out_of_stock ?? 0} out of stock`}
          icon={<Package className="size-5" />}
          tone="brand"
        />
      </div>

      {!!stats?.products_out_of_stock && (
        <Card className="mt-5 flex items-center gap-3.5 border-[var(--warning)]/30 bg-[var(--warning-soft)] p-4">
          <AlertTriangle className="size-5 shrink-0 text-[var(--warning)]" />
          <p className="flex-1 text-sm font-medium text-[var(--warning)]">
            {stats.products_out_of_stock} product
            {stats.products_out_of_stock === 1 ? ' is' : 's are'} out of stock and cannot be bought.
          </p>
          <Link to="/vendor/products?in_stock=false">
            <Button size="sm" variant="outline">
              Restock
            </Button>
          </Link>
        </Card>
      )}

      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_300px]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <h2 className="font-bold">Recent orders</h2>
            <Link
              to="/vendor/orders"
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--primary)] hover:underline"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted">No orders yet.</p>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {recent.map((line) => (
                <div key={line.id} className="flex items-center gap-4 p-4">
                  <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-2)]">
                    <img src={line.image_url} alt="" className="size-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{line.title}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {line.order_number} · {line.customer_name} · {formatDate(line.placed_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{money(line.vendor_earning)}</p>
                    <Badge tone={STATUS_TONE[line.status] ?? 'neutral'} className="mt-1">
                      {line.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="font-bold">Shop rating</h2>
            <div className="mt-3.5 flex items-baseline gap-2">
              <Star className="size-6 fill-[var(--star)] text-[var(--star)]" />
              <span className="text-3xl font-extrabold tracking-tight">
                {Number(stats?.rating_avg ?? 0).toFixed(1)}
              </span>
              <span className="text-sm text-muted">/ 5</span>
            </div>
            <p className="mt-2 text-[13px] text-muted">Averaged across your product reviews.</p>
          </Card>

          <Card className="p-5">
            <h2 className="font-bold">Commission</h2>
            <p className="mt-3.5 text-3xl font-extrabold tracking-tight">
              {stats?.commission_rate}%
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Charged on each sale. You have paid {money(stats?.commission_paid)} in total.
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="font-bold">Quick actions</h2>
            <div className="mt-3.5 space-y-2">
              <Link to="/vendor/products/new" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  Add a product
                </Button>
              </Link>
              <Link to="/vendor/orders" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  Fulfil orders
                </Button>
              </Link>
              <Link to="/vendor/shop" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  Edit shop profile
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
