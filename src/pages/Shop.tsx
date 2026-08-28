import { PackageSearch, SlidersHorizontal, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { catalogApi } from '@/api/endpoints'
import type { Category, Facets, Product } from '@/api/types'
import { PageHeader } from '@/components/layout'
import { ProductGrid } from '@/components/product/ProductCard'
import { Badge, Button, EmptyState, Pagination, Select } from '@/components/ui'
import { SORT_OPTIONS } from '@/lib/constants'
import { cn, money } from '@/lib/utils'

/** Filter state lives entirely in the URL so results stay shareable and back works. */
export function Shop() {
  const [params, setParams] = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [facets, setFacets] = useState<Facets | null>(null)
  const [meta, setMeta] = useState({ count: 0, numPages: 1 })
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const query = useMemo(
    () => ({
      search: params.get('search') ?? '',
      category: params.get('category') ?? '',
      brand: params.get('brand') ?? '',
      vendor: params.get('vendor') ?? '',
      min_price: params.get('min_price') ?? '',
      max_price: params.get('max_price') ?? '',
      min_rating: params.get('min_rating') ?? '',
      in_stock: params.get('in_stock') ?? '',
      on_sale: params.get('on_sale') ?? '',
      is_featured: params.get('is_featured') ?? '',
      ordering: params.get('ordering') ?? '-created_at',
      page: Number(params.get('page') ?? 1),
    }),
    [params],
  )

  useEffect(() => {
    catalogApi.categories().then(({ data }) => setCategories(data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const request = { ...query, page_size: 12 }
    Promise.all([catalogApi.products(request), catalogApi.facets(request)])
      .then(([list, facet]) => {
        setProducts(list.data.results)
        setMeta({ count: list.data.count, numPages: list.data.num_pages })
        setFacets(facet.data)
      })
      .catch(() => {
        setProducts([])
        setMeta({ count: 0, numPages: 1 })
      })
      .finally(() => setLoading(false))
  }, [query])

  const update = useCallback(
    (patch: Record<string, string | number>, resetPage = true) => {
      const next = new URLSearchParams(params)
      Object.entries(patch).forEach(([key, value]) => {
        if (value === '' || value === undefined) next.delete(key)
        else next.set(key, String(value))
      })
      if (resetPage) next.delete('page')
      setParams(next)
    },
    [params, setParams],
  )

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = []
    if (query.search) chips.push({ key: 'search', label: `“${query.search}”` })
    if (query.category) {
      const name = categories.find((c) => c.slug === query.category)?.name ?? query.category
      chips.push({ key: 'category', label: name })
    }
    if (query.brand) chips.push({ key: 'brand', label: query.brand })
    if (query.vendor) chips.push({ key: 'vendor', label: query.vendor })
    if (query.min_price) chips.push({ key: 'min_price', label: `Over ${money(query.min_price)}` })
    if (query.max_price) chips.push({ key: 'max_price', label: `Under ${money(query.max_price)}` })
    if (query.min_rating) chips.push({ key: 'min_rating', label: `${query.min_rating}★ & up` })
    if (query.in_stock) chips.push({ key: 'in_stock', label: 'In stock' })
    if (query.on_sale) chips.push({ key: 'on_sale', label: 'On sale' })
    if (query.is_featured) chips.push({ key: 'is_featured', label: 'Featured' })
    return chips
  }, [query, categories])

  const filters = (
    <div className="space-y-7">
      <FilterGroup title="Category">
        <div className="space-y-0.5">
          <FilterRadio
            label="All categories"
            checked={!query.category}
            onChange={() => update({ category: '' })}
          />
          {categories.map((c) => (
            <FilterRadio
              key={c.id}
              label={c.name}
              count={c.product_count}
              checked={query.category === c.slug}
              onChange={() => update({ category: c.slug })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={query.min_price}
            key={`min-${query.min_price}`}
            onBlur={(e) => update({ min_price: e.target.value })}
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm focus:border-[var(--primary)] focus:outline-none"
          />
          <span className="text-subtle">–</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={query.max_price}
            key={`max-${query.max_price}`}
            onBlur={(e) => update({ max_price: e.target.value })}
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm focus:border-[var(--primary)] focus:outline-none"
          />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {[
            { label: 'Under ₹1k', min: '', max: '1000' },
            { label: '₹1k–5k', min: '1000', max: '5000' },
            { label: '₹5k–20k', min: '5000', max: '20000' },
            { label: '₹20k+', min: '20000', max: '' },
          ].map((band) => (
            <button
              key={band.label}
              onClick={() => update({ min_price: band.min, max_price: band.max })}
              className={cn(
                'rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors',
                query.min_price === band.min && query.max_price === band.max
                  ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]',
              )}
            >
              {band.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      {!!facets?.brands.length && (
        <FilterGroup title="Brand">
          <div className="max-h-52 space-y-0.5 overflow-y-auto pr-1">
            <FilterRadio
              label="All brands"
              checked={!query.brand}
              onChange={() => update({ brand: '' })}
            />
            {facets.brands.map((b) => (
              <FilterRadio
                key={b.name}
                label={b.name}
                count={b.count}
                checked={query.brand === b.name}
                onChange={() => update({ brand: b.name })}
              />
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title="Rating">
        <div className="space-y-0.5">
          {[4, 3, 2].map((r) => (
            <FilterRadio
              key={r}
              label={`${r}★ & above`}
              checked={query.min_rating === String(r)}
              onChange={() => update({ min_rating: query.min_rating === String(r) ? '' : r })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Availability">
        <div className="space-y-0.5">
          <FilterCheck
            label="In stock only"
            checked={query.in_stock === 'true'}
            onChange={(v) => update({ in_stock: v ? 'true' : '' })}
          />
          <FilterCheck
            label="On sale"
            checked={query.on_sale === 'true'}
            onChange={(v) => update({ on_sale: v ? 'true' : '' })}
          />
          <FilterCheck
            label="Featured"
            checked={query.is_featured === 'true'}
            onChange={(v) => update({ is_featured: v ? 'true' : '' })}
          />
        </div>
      </FilterGroup>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-9 lg:px-8">
      <PageHeader
        title={query.search ? `Results for “${query.search}”` : 'All products'}
        description={loading ? 'Loading…' : `${meta.count} products from independent sellers`}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              icon={<SlidersHorizontal className="size-4" />}
              onClick={() => setFiltersOpen(true)}
            >
              Filters
            </Button>
            <Select
              className="h-9 w-48"
              options={SORT_OPTIONS}
              value={query.ordering}
              onChange={(e) => update({ ordering: e.target.value })}
            />
          </div>
        }
      />

      {activeChips.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => update({ [chip.key]: '' })}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-[13px] font-semibold text-[var(--primary)] transition-opacity hover:opacity-75"
            >
              {chip.label}
              <X className="size-3.5" />
            </button>
          ))}
          <button
            onClick={() => setParams(new URLSearchParams())}
            className="text-[13px] font-semibold text-muted underline-offset-4 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-32">{filters}</div>
        </aside>

        <div className="min-w-0 flex-1">
          {!loading && products.length === 0 ? (
            <EmptyState
              icon={<PackageSearch className="size-7" />}
              title="No products match those filters"
              description="Try widening the price range, or clearing a filter or two."
              action={
                <Button onClick={() => setParams(new URLSearchParams())}>Clear filters</Button>
              }
            />
          ) : (
            <>
              <ProductGrid products={products} loading={loading} skeletonCount={12} />
              <Pagination
                page={query.page}
                numPages={meta.numPages}
                onChange={(p) => update({ page: p }, false)}
              />
            </>
          )}
        </div>
      </div>

      {/* mobile filter sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-100 lg:hidden">
          <div
            className="animate-[fade-in_0.2s_ease] absolute inset-0 bg-[var(--overlay)]"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="animate-[fade-up_0.25s_cubic-bezier(0.16,1,0.3,1)] absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-[var(--surface)] p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} className="rounded-lg p-2">
                <X className="size-5" />
              </button>
            </div>
            {filters}
            <Button className="mt-6 w-full" size="lg" onClick={() => setFiltersOpen(false)}>
              Show {meta.count} products
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-[13px] font-bold tracking-wider uppercase">{title}</h3>
      {children}
    </div>
  )
}

function FilterRadio({
  label,
  count,
  checked,
  onChange,
}: {
  label: string
  count?: number
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      onClick={onChange}
      className={cn(
        'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
        checked
          ? 'bg-[var(--primary-soft)] font-semibold text-[var(--primary)]'
          : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]',
      )}
    >
      <span className="truncate">{label}</span>
      {count !== undefined && <span className="ml-2 shrink-0 text-xs text-subtle">{count}</span>}
    </button>
  )
}

function FilterCheck({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-[var(--border-strong)] accent-[var(--primary)]"
      />
      {label}
    </label>
  )
}

export { Badge }
