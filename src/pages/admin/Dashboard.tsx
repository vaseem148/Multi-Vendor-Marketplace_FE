import {
  Clock,
  IndianRupee,
  Package,
  Receipt,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { adminApi } from '@/api/endpoints'
import type { AdminStats } from '@/api/types'
import { PageHeader } from '@/components/layout'
import { Badge, Button, Card, Spinner, StatTile } from '@/components/ui'
import { ORDER_STATUSES, STATUS_TONE } from '@/lib/constants'
import { money } from '@/lib/utils'

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi
      .stats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (!stats) return null

  const orderTotal = Object.values(stats.orders_by_status).reduce((a, b) => a + b, 0) || 1
  const topRevenue = Math.max(...stats.top_vendors.map((v) => Number(v.revenue)), 1)

  return (
    <div>
      <PageHeader
        title="Marketplace overview"
        description="Everything happening across the platform."
        action={
          stats.vendors_pending > 0 && (
            <Link to="/admin/vendors?status=PENDING">
              <Button icon={<Clock className="size-4" />}>
                {stats.vendors_pending} shop{stats.vendors_pending === 1 ? '' : 's'} awaiting review
              </Button>
            </Link>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="GMV"
          value={money(stats.gmv)}
          hint="Gross merchandise value"
          icon={<IndianRupee className="size-5" />}
          tone="success"
        />
        <StatTile
          label="Platform revenue"
          value={money(stats.platform_revenue)}
          hint="Commission earned"
          icon={<TrendingUp className="size-5" />}
          tone="brand"
        />
        <StatTile
          label="Orders"
          value={stats.orders_total}
          hint={`${stats.products_total} products listed`}
          icon={<Receipt className="size-5" />}
          tone="info"
        />
        <StatTile
          label="Customers"
          value={stats.customers_total}
          hint={`${stats.vendors_approved} active sellers`}
          icon={<Users className="size-5" />}
          tone="warning"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-bold">Orders by status</h2>
          <div className="mt-5 space-y-3">
            {ORDER_STATUSES.filter((s) => stats.orders_by_status[s]).map((status) => {
              const count = stats.orders_by_status[status] ?? 0
              return (
                <div key={status} className="flex items-center gap-3.5">
                  <Badge tone={STATUS_TONE[status] ?? 'neutral'} className="w-28 justify-center">
                    {status}
                  </Badge>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div
                      className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
                      style={{ width: `${(count / orderTotal) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-bold">{count}</span>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Top sellers by revenue</h2>
            <Link
              to="/admin/vendors"
              className="text-[13px] font-semibold text-[var(--primary)] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {stats.top_vendors.map((vendor, i) => (
              <div key={vendor.shop_name} className="flex items-center gap-3.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[13px] font-bold">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{vendor.shop_name}</p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div
                      className="h-full rounded-full bg-[var(--success)] transition-all duration-500"
                      style={{ width: `${(Number(vendor.revenue) / topRevenue) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold">{money(vendor.revenue)}</p>
                  <p className="text-xs text-subtle">{vendor.units} units</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Approved', value: stats.vendors_approved, tone: 'success' as const },
          { label: 'Pending', value: stats.vendors_pending, tone: 'warning' as const },
          { label: 'Rejected', value: stats.vendors_rejected, tone: 'danger' as const },
          { label: 'Suspended', value: stats.vendors_suspended, tone: 'danger' as const },
        ].map((row) => (
          <Card key={row.label} className="flex items-center gap-3.5 p-5">
            <Store className="size-5 text-[var(--text-subtle)]" />
            <div>
              <p className="text-[13px] font-semibold text-muted">{row.label} shops</p>
              <p className="text-xl font-bold">{row.value}</p>
            </div>
            <Badge tone={row.tone} className="ml-auto" dot>
              {row.label}
            </Badge>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          { to: '/admin/vendors', icon: Store, label: 'Review seller applications' },
          { to: '/admin/products', icon: Package, label: 'Moderate product listings' },
          { to: '/admin/orders', icon: Receipt, label: 'Look up any order' },
        ].map((action) => (
          <Link key={action.to} to={action.to}>
            <Card hover className="flex items-center gap-3.5 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                <action.icon className="size-5" />
              </span>
              <span className="text-sm font-semibold">{action.label}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
