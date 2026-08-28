import { Ban, Check, ExternalLink, Percent, Search, Store, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { adminApi } from '@/api/endpoints'
import type { Vendor } from '@/api/types'
import { PageHeader } from '@/components/layout'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Pagination,
  Spinner,
  Tabs,
} from '@/components/ui'
import { STATUS_TONE } from '@/lib/constants'
import { apiError, formatDate, money } from '@/lib/utils'
import { toast } from '@/store/ui'

const TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Suspended', value: 'SUSPENDED' },
]

export function AdminVendors() {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') ?? ''

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ count: 0, numPages: 1 })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const [rejecting, setRejecting] = useState<Vendor | null>(null)
  const [reason, setReason] = useState('')
  const [commissionFor, setCommissionFor] = useState<Vendor | null>(null)
  const [rate, setRate] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  function load() {
    setLoading(true)
    adminApi
      .shops({ status, search: query, page, page_size: 10 })
      .then(({ data }) => {
        setVendors(data.results)
        setMeta({ count: data.count, numPages: data.num_pages })
      })
      .catch(() => setVendors([]))
      .finally(() => setLoading(false))
  }

  useEffect(load, [status, query, page])

  function replace(updated: Vendor) {
    setVendors((list) => list.map((v) => (v.id === updated.id ? updated : v)))
  }

  async function approve(vendor: Vendor) {
    setBusy(true)
    try {
      const { data } = await adminApi.approveShop(vendor.id)
      replace(data)
      toast.success(`${vendor.shop_name} approved`)
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setBusy(false)
    }
  }

  async function reject(suspend: boolean) {
    if (!rejecting) return
    setBusy(true)
    try {
      const { data } = suspend
        ? await adminApi.suspendShop(rejecting.id, reason)
        : await adminApi.rejectShop(rejecting.id, reason)
      replace(data)
      toast.success(`${rejecting.shop_name} ${suspend ? 'suspended' : 'rejected'}`)
      setRejecting(null)
      setReason('')
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setBusy(false)
    }
  }

  async function saveCommission() {
    if (!commissionFor) return
    setBusy(true)
    try {
      const { data } = await adminApi.updateShop(commissionFor.id, { commission_rate: rate })
      replace(data)
      toast.success('Commission updated')
      setCommissionFor(null)
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Sellers"
        description={`${meta.count} shops on the marketplace`}
        action={
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--text-subtle)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Shop name or owner email"
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pr-3 pl-10 text-sm focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
        }
      />

      <Tabs
        tabs={TABS}
        value={status}
        onChange={(v) => {
          const next = new URLSearchParams(params)
          if (v) next.set('status', v)
          else next.delete('status')
          setParams(next)
          setPage(1)
        }}
        className="mb-6"
      />

      {loading ? (
        <Spinner />
      ) : vendors.length === 0 ? (
        <EmptyState icon={<Store className="size-7" />} title="No shops found" />
      ) : (
        <>
          <div className="space-y-4">
            {vendors.map((vendor) => (
              <Card key={vendor.id} className="p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-lg font-bold text-[var(--primary)]">
                    {vendor.shop_name[0]}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{vendor.shop_name}</h3>
                      <Badge tone={STATUS_TONE[vendor.status] ?? 'neutral'} dot>
                        {vendor.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[13px] text-muted">
                      {(vendor as any).owner_email} ·{' '}
                      {[vendor.city, vendor.state].filter(Boolean).join(', ') || 'No location'} ·
                      joined {formatDate(vendor.created_at)}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
                      <span className="text-muted">
                        Products <span className="font-bold text-[var(--text)]">{vendor.product_count}</span>
                      </span>
                      <span className="text-muted">
                        Sales{' '}
                        <span className="font-bold text-[var(--text)]">
                          {money(vendor.total_sales)}
                        </span>
                      </span>
                      <span className="text-muted">
                        Commission{' '}
                        <span className="font-bold text-[var(--text)]">
                          {vendor.commission_rate}%
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {vendor.status === 'APPROVED' && (
                      <Link to={`/shop/${vendor.slug}`}>
                        <Button size="sm" variant="ghost" icon={<ExternalLink className="size-4" />}>
                          View
                        </Button>
                      </Link>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<Percent className="size-4" />}
                      onClick={() => {
                        setCommissionFor(vendor)
                        setRate(String(vendor.commission_rate ?? '10'))
                      }}
                    >
                      Rate
                    </Button>
                    {vendor.status !== 'APPROVED' && (
                      <Button
                        size="sm"
                        variant="success"
                        loading={busy}
                        icon={<Check className="size-4" />}
                        onClick={() => approve(vendor)}
                      >
                        Approve
                      </Button>
                    )}
                    {vendor.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<X className="size-4" />}
                        onClick={() => setRejecting(vendor)}
                      >
                        Reject
                      </Button>
                    )}
                    {vendor.status === 'APPROVED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Ban className="size-4" />}
                        onClick={() => setRejecting(vendor)}
                      >
                        Suspend
                      </Button>
                    )}
                  </div>
                </div>

                {vendor.status === 'REJECTED' && (vendor as any).rejection_reason && (
                  <p className="mt-3.5 rounded-lg bg-[var(--danger-soft)] p-3 text-[13px] text-[var(--danger)]">
                    Reason: {(vendor as any).rejection_reason}
                  </p>
                )}
              </Card>
            ))}
          </div>
          <Pagination page={page} numPages={meta.numPages} onChange={setPage} />
        </>
      )}

      <Modal
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        title={rejecting?.status === 'APPROVED' ? 'Suspend this shop?' : 'Reject this application?'}
        description={rejecting?.shop_name}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={busy}
              onClick={() => reject(rejecting?.status === 'APPROVED')}
            >
              {rejecting?.status === 'APPROVED' ? 'Suspend shop' : 'Reject application'}
            </Button>
          </>
        }
      >
        <Input
          label="Reason"
          placeholder="Shown to the seller"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>

      <Modal
        open={!!commissionFor}
        onClose={() => setCommissionFor(null)}
        title="Commission rate"
        description={commissionFor?.shop_name}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCommissionFor(null)}>
              Cancel
            </Button>
            <Button loading={busy} onClick={saveCommission}>
              Save rate
            </Button>
          </>
        }
      >
        <Input
          label="Rate (%)"
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          hint="Applies to future sales only — past order lines keep their original split."
        />
      </Modal>
    </div>
  )
}
