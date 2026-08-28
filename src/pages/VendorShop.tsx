import { BadgeCheck, Mail, MapPin, Package, Phone, Store } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { catalogApi, vendorApi } from '@/api/endpoints'
import type { Product, Vendor } from '@/api/types'
import { Breadcrumbs } from '@/components/layout'
import { ProductGrid } from '@/components/product/ProductCard'
import { Button, EmptyState, Pagination, Rating, Select, Skeleton } from '@/components/ui'
import { SORT_OPTIONS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

export function VendorShop() {
  const { slug = '' } = useParams()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [ordering, setOrdering] = useState('-created_at')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ count: 0, numPages: 1 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vendorApi
      .detail(slug)
      .then(({ data }) => setVendor(data))
      .catch(() => setVendor(null))
  }, [slug])

  useEffect(() => {
    setLoading(true)
    catalogApi
      .products({ vendor: slug, ordering, page, page_size: 12 })
      .then(({ data }) => {
        setProducts(data.results)
        setMeta({ count: data.count, numPages: data.num_pages })
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [slug, ordering, page])

  if (!vendor) {
    return loading ? (
      <div className="mx-auto max-w-7xl px-4 py-9 lg:px-8">
        <Skeleton className="h-52 rounded-2xl" />
      </div>
    ) : (
      <EmptyState
        icon={<Store className="size-7" />}
        title="Shop not found"
        description="This seller may no longer be active on the marketplace."
        action={
          <Link to="/vendors">
            <Button>All sellers</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div>
      {/* banner */}
      <div className="relative h-44 bg-[var(--surface-2)] sm:h-60">
        {vendor.banner_display && (
          <img src={vendor.banner_display} alt="" className="size-full object-cover opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--page)] to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="-mt-16 flex flex-col gap-5 sm:flex-row sm:items-end">
          <div className="size-28 shrink-0 overflow-hidden rounded-3xl border-4 border-[var(--surface)] bg-[var(--surface-2)] shadow-[var(--shadow-lift)]">
            {vendor.logo_display ? (
              <img src={vendor.logo_display} alt={vendor.shop_name} className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center bg-[var(--primary)] text-3xl font-bold text-[var(--primary-fg)]">
                {vendor.shop_name[0]}
              </span>
            )}
          </div>

          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {vendor.shop_name}
              </h1>
              <BadgeCheck className="size-6 shrink-0 text-[var(--primary)]" />
            </div>
            {vendor.tagline && <p className="mt-1 text-muted">{vendor.tagline}</p>}

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted">
              <Rating value={vendor.rating_avg} count={vendor.rating_count} size={13} />
              <span className="flex items-center gap-1.5">
                <Package className="size-3.5" />
                {vendor.product_count} products
              </span>
              {(vendor.city || vendor.state) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {[vendor.city, vendor.state].filter(Boolean).join(', ')}
                </span>
              )}
              {vendor.created_at && <span>Selling since {formatDate(vendor.created_at)}</span>}
            </div>
          </div>
        </div>

        {vendor.description && (
          <p className="mt-7 max-w-3xl leading-relaxed text-muted">{vendor.description}</p>
        )}

        {(vendor.contact_email || vendor.contact_phone) && (
          <div className="mt-4 flex flex-wrap gap-4 text-[13px]">
            {vendor.contact_email && (
              <a
                href={`mailto:${vendor.contact_email}`}
                className="flex items-center gap-1.5 text-muted hover:text-[var(--primary)]"
              >
                <Mail className="size-3.5" />
                {vendor.contact_email}
              </a>
            )}
            {vendor.contact_phone && (
              <span className="flex items-center gap-1.5 text-muted">
                <Phone className="size-3.5" />
                {vendor.contact_phone}
              </span>
            )}
          </div>
        )}

        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Sellers', to: '/vendors' },
            { label: vendor.shop_name },
          ]}
        />

        <div className="mt-4 mb-7 flex flex-wrap items-end justify-between gap-4 border-t border-[var(--border)] pt-7">
          <h2 className="text-xl font-bold tracking-tight">
            Products <span className="text-muted">({meta.count})</span>
          </h2>
          <Select
            className="h-9 w-48"
            options={SORT_OPTIONS}
            value={ordering}
            onChange={(e) => {
              setOrdering(e.target.value)
              setPage(1)
            }}
          />
        </div>

        {!loading && products.length === 0 ? (
          <EmptyState
            icon={<Package className="size-7" />}
            title="No products listed yet"
            description="This seller has not published anything so far."
          />
        ) : (
          <div className="pb-4">
            <ProductGrid products={products} loading={loading} skeletonCount={8} />
            <Pagination page={page} numPages={meta.numPages} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  )
}
