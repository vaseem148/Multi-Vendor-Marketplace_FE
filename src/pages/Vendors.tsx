import { BadgeCheck, MapPin, Search, Store } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { vendorApi } from '@/api/endpoints'
import type { Vendor } from '@/api/types'
import { PageHeader } from '@/components/layout'
import { Button, Card, EmptyState, Pagination, Rating, Skeleton } from '@/components/ui'

export function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ count: 0, numPages: 1 })
  const [loading, setLoading] = useState(true)

  // Debounce the search box so we don't fire on every keystroke.
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
      .list({ search: query, page, page_size: 12 })
      .then(({ data }) => {
        setVendors(data.results)
        setMeta({ count: data.count, numPages: data.num_pages })
      })
      .catch(() => setVendors([]))
      .finally(() => setLoading(false))
  }, [query, page])

  return (
    <div className="mx-auto max-w-7xl px-4 py-9 lg:px-8">
      <PageHeader
        title="Our sellers"
        description={`${meta.count} independent shops on the marketplace`}
        action={
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--text-subtle)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sellers"
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pr-3 pl-10 text-sm focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
        }
      />

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <EmptyState
          icon={<Store className="size-7" />}
          title="No sellers found"
          description="Try a different search term."
          action={<Button onClick={() => setSearch('')}>Clear search</Button>}
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((v) => (
              <Link key={v.id} to={`/shop/${v.slug}`}>
                <Card hover className="h-full overflow-hidden">
                  <div className="relative h-28 bg-[var(--surface-2)]">
                    {v.banner_display && (
                      <img
                        src={v.banner_display}
                        alt=""
                        className="size-full object-cover opacity-60"
                      />
                    )}
                  </div>
                  <div className="px-5 pb-5">
                    <div className="-mt-9 mb-3.5 size-18 overflow-hidden rounded-2xl border-4 border-[var(--surface)] bg-[var(--surface-2)]">
                      {v.logo_display ? (
                        <img src={v.logo_display} alt={v.shop_name} className="size-full object-cover" />
                      ) : (
                        <span className="flex size-full items-center justify-center bg-[var(--primary)] text-xl font-bold text-[var(--primary-fg)]">
                          {v.shop_name[0]}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate text-lg font-bold">{v.shop_name}</h3>
                      <BadgeCheck className="size-4.5 shrink-0 text-[var(--primary)]" />
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{v.tagline}</p>

                    {(v.city || v.state) && (
                      <p className="mt-2.5 flex items-center gap-1.5 text-[13px] text-subtle">
                        <MapPin className="size-3.5" />
                        {[v.city, v.state].filter(Boolean).join(', ')}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
                      <Rating value={v.rating_avg} count={v.rating_count} size={13} />
                      <span className="text-[13px] font-semibold text-muted">
                        {v.product_count} products
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <Pagination page={page} numPages={meta.numPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
