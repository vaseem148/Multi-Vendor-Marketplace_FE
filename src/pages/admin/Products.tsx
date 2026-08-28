import { ExternalLink, Package, Search, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { adminApi } from '@/api/endpoints'
import type { Product } from '@/api/types'
import { PageHeader } from '@/components/layout'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  Pagination,
  Spinner,
  Tabs,
} from '@/components/ui'
import { STATUS_TONE } from '@/lib/constants'
import { apiError, money } from '@/lib/utils'
import { toast } from '@/store/ui'

const TABS = [
  { label: 'All', value: '' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Drafts', value: 'DRAFT' },
  { label: 'Archived', value: 'ARCHIVED' },
]

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ count: 0, numPages: 1 })
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const [busy, setBusy] = useState(false)

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
      .products({ status, search: query, page, page_size: 12 })
      .then(({ data }) => {
        setProducts(data.results)
        setMeta({ count: data.count, numPages: data.num_pages })
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }

  useEffect(load, [status, query, page])

  async function toggleFeatured(product: Product) {
    try {
      const { data } = await adminApi.toggleFeatured(product.id)
      setProducts((list) =>
        list.map((p) => (p.id === product.id ? { ...p, is_featured: data.is_featured } : p)),
      )
      toast.success(data.is_featured ? 'Added to featured' : 'Removed from featured')
    } catch (error) {
      toast.error(apiError(error))
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    setBusy(true)
    try {
      await adminApi.deleteProduct(deleting.id)
      toast.success('Product removed')
      setDeleting(null)
      load()
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${meta.count} listings across all sellers`}
        action={
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--text-subtle)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Product, seller or SKU"
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
      ) : products.length === 0 ? (
        <EmptyState icon={<Package className="size-7" />} title="No products found" />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                  <tr className="text-left text-[11px] font-bold tracking-wider text-muted uppercase">
                    <th className="px-5 py-3">Product</th>
                    <th className="px-3 py-3">Seller</th>
                    <th className="px-3 py-3">Price</th>
                    <th className="px-3 py-3">Stock</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {products.map((product) => (
                    <tr key={product.id} className="transition-colors hover:bg-[var(--surface-2)]">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="size-11 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-2)]">
                            <img src={product.image_display} alt="" className="size-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 max-w-52 truncate font-semibold">
                              {product.title}
                              {product.is_featured && (
                                <Sparkles className="size-3.5 shrink-0 text-[var(--primary)]" />
                              )}
                            </p>
                            <p className="text-xs text-subtle">
                              {product.category_name ?? 'Uncategorised'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <Link
                          to={`/shop/${product.vendor_slug}`}
                          className="text-[13px] font-medium hover:text-[var(--primary)]"
                        >
                          {product.vendor_name}
                        </Link>
                      </td>
                      <td className="px-3 py-3.5 font-semibold">{money(product.price)}</td>
                      <td className="px-3 py-3.5">
                        <span
                          className={
                            product.stock === 0 ? 'font-bold text-[var(--danger)]' : 'font-semibold'
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <Badge tone={STATUS_TONE[product.status ?? 'DRAFT'] ?? 'neutral'}>
                          {product.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Toggle featured"
                            onClick={() => toggleFeatured(product)}
                          >
                            <Sparkles
                              className={
                                product.is_featured
                                  ? 'size-4 fill-[var(--primary)] text-[var(--primary)]'
                                  : 'size-4'
                              }
                            />
                          </Button>
                          <Link to={`/product/${product.slug}`}>
                            <Button size="icon" variant="ghost" aria-label="View">
                              <ExternalLink className="size-4" />
                            </Button>
                          </Link>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Delete"
                            onClick={() => setDeleting(product)}
                          >
                            <Trash2 className="size-4 text-[var(--danger)]" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Pagination page={page} numPages={meta.numPages} onChange={setPage} />
        </>
      )}

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Remove this listing?"
        description={deleting?.title}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={busy} onClick={confirmDelete}>
              Remove listing
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          This takes the product off the marketplace. Past orders keep their own snapshot of it.
        </p>
      </Modal>
    </div>
  )
}
