import { Clock, IndianRupee, Package, Percent, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'

import { vendorApi } from '@/api/endpoints'
import type { Earnings as EarningsData, VendorStats } from '@/api/types'
import { PageHeader } from '@/components/layout'
import { Card, EmptyState, Spinner, StatTile } from '@/components/ui'
import { money } from '@/lib/utils'

export function VendorEarnings() {
  const [data, setData] = useState<EarningsData | null>(null)
  const [stats, setStats] = useState<VendorStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([vendorApi.earnings(), vendorApi.stats()])
      .then(([e, s]) => {
        setData(e.data)
        setStats(s.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (!data) {
    return <EmptyState icon={<Wallet className="size-7" />} title="Earnings unavailable" />
  }

  const peak = Math.max(...data.by_month.map((m) => m.amount), 1)

  return (
    <div>
      <PageHeader
        title="Earnings"
        description="What you have made after platform commission."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Total earned"
          value={money(data.earnings_total)}
          hint={`${data.units_sold} units sold`}
          icon={<IndianRupee className="size-5" />}
          tone="success"
        />
        <StatTile
          label="Settled"
          value={money(data.settled)}
          hint="From delivered orders"
          icon={<Wallet className="size-5" />}
          tone="info"
        />
        <StatTile
          label="Pending"
          value={money(data.pending)}
          hint="Releases once delivered"
          icon={<Clock className="size-5" />}
          tone="warning"
        />
        <StatTile
          label="Commission paid"
          value={money(data.commission_paid)}
          hint={`At ${stats?.commission_rate ?? 10}% per sale`}
          icon={<Percent className="size-5" />}
          tone="neutral"
        />
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-bold">Earnings by month</h2>
        <p className="mt-1 text-sm text-muted">Net of commission, based on when the order was placed.</p>

        {data.by_month.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">No sales recorded yet.</p>
        ) : (
          <div className="mt-7 space-y-3.5">
            {data.by_month.map((row) => (
              <div key={row.month} className="flex items-center gap-4">
                <span className="w-20 shrink-0 text-[13px] font-semibold text-muted">
                  {new Date(`${row.month}-01`).toLocaleDateString('en-IN', {
                    month: 'short',
                    year: '2-digit',
                  })}
                </span>
                <div className="h-7 flex-1 overflow-hidden rounded-lg bg-[var(--surface-2)]">
                  <div
                    className="flex h-full items-center justify-end rounded-lg bg-[var(--primary)] px-2.5 transition-all duration-500"
                    style={{ width: `${Math.max((row.amount / peak) * 100, 12)}%` }}
                  >
                    <span className="text-[11px] font-bold text-[var(--primary-fg)]">
                      {money(row.amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mt-5 flex items-start gap-3.5 p-5">
        <Package className="mt-0.5 size-5 shrink-0 text-[var(--primary)]" />
        <div>
          <h3 className="font-bold">How payouts work</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Each order line records your earning at the moment of sale, so a later change to your
            commission rate never rewrites past orders. Earnings move from pending to settled once
            you mark the line delivered.
          </p>
        </div>
      </Card>
    </div>
  )
}
