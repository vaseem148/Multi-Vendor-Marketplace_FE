import { Eye, EyeOff, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { vendorApi } from '@/api/endpoints'
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
import { apiError, formatDate, money } from '@/lib/utils'
import { toast } from '@/store/ui'

const TABS = [
  { label: 'All', value: '' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Drafts', value: 'DRAFT' },
]

export function VendorProducts() {
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
    vendorApi
      .products({ status, search: query, page, page_size: 10 })
      .then(({ data }) => {
        setProducts(data.results)
        setMeta({ count: data.count, numPages: data.num_pages })
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }

  useEffect(load, [status, query, page])

  async function toggleStatus(product: Product) {
    try {
      const { data } = await vendorApi.toggleProductStatus(product.id)
      setProducts((list) => list.map((p) => (p.id === data.id ? data : p)))
      toast.success(data.status === 'PUBLISHED' ? 'Product published' : 'Moved to drafts')
    } catch (error) {
      toast.error(apiError(error))
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    setBusy(true)
    try {
      await vendorApi.deleteProduct(deleting.id)
      toast.success('Product deleted')
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
        description={`${meta.count} products in your shop`}
        action={
          <Link to="/vendor/products/new">
            <Button icon={<Plus className="size-4" />}>Add product</Button>
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Tabs
          tabs={TABS}
          value={status}
          onChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
          className="flex-1 border-none"
        />
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your products"
            className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pr-3 pl-10 text-sm focus:border-[var(--primary)] focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="size-7" />}
          title="No products yet"
          description="List your first product and it goes live immediately."
          action={
            <Link to="/vendor/products/new">
              <Button icon={<Plus className="size-4" />}>Add your first product</Button>
            </Link>
          }
        />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                  <tr className="text-left text-[11px] font-bold tracking-wider text-muted uppercase">
                    <th className="px-5 py-3">Product</th>
                    <th className="px-3 py-3">Price</th>
                    <th className="px-3 py-3">Stock</th>
                    <th className="px-3 py-3">Sold</th>
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
                            <img
                              src={product.image_display}
                              alt=""
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-56 truncate font-semibold">{product.title}</p>
                            <p className="text-xs text-subtle">
                              {product.category_name ?? 'Uncategorised'} ·{' '}
                              {formatDate(product.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 font-semibold">{money(product.price)}</td>
                      <td className="px-3 py-3.5">
                        <span
                          className={
                            product.stock === 0
                              ? 'font-bold text-[var(--danger)]'
                              : product.stock <= 5
                                ? 'font-bold text-[var(--warning)]'
                                : 'font-semibold'
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-muted">{product.sold_count}</td>
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
                            aria-label="Toggle published"
                            onClick={() => toggleStatus(product)}
                          >
                            {product.status === 'PUBLISHED' ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </Button>
                          <Link to={`/vendor/products/${product.id}/edit`}>
                            <Button size="icon" variant="ghost" aria-label="Edit">
                              <Pencil className="size-4" />
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
        title="Delete this product?"
        description={deleting?.title}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={busy} onClick={confirmDelete}>
              Delete product
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          This removes the listing from the marketplace. Past orders keep their own copy of the
          product details.
        </p>
      </Modal>
    </div>
  )
}
