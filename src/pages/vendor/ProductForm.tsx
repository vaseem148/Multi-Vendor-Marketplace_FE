import { ArrowLeft, ImageIcon, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { catalogApi, vendorApi } from '@/api/endpoints'
import type { Category } from '@/api/types'
import { PageHeader } from '@/components/layout'
import { Button, Card, Input, Select, Spinner, Textarea } from '@/components/ui'
import { apiError, money } from '@/lib/utils'
import { toast } from '@/store/ui'

const BLANK = {
  title: '',
  short_description: '',
  description: '',
  brand: '',
  sku: '',
  category: '',
  price: '',
  compare_at_price: '',
  stock: '0',
  image_url: '',
  status: 'PUBLISHED',
  is_active: true,
}

export function VendorProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)

  const [form, setForm] = useState(BLANK)
  const [categories, setCategories] = useState<Category[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    catalogApi.categories().then(({ data }) => setCategories(data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!id) return
    vendorApi
      .product(Number(id))
      .then(({ data }) => {
        setForm({
          title: data.title,
          short_description: data.short_description ?? '',
          description: data.description ?? '',
          brand: data.brand ?? '',
          sku: data.sku ?? '',
          category: data.category ? String(data.category) : '',
          price: data.price,
          compare_at_price: data.compare_at_price ?? '',
          stock: String(data.stock),
          image_url: data.image_url ?? data.image_display ?? '',
          status: data.status ?? 'PUBLISHED',
          is_active: data.is_active ?? true,
        })
      })
      .catch(() => toast.error('Could not load that product'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner />

  function set(key: keyof typeof BLANK) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setSaving(true)

    const payload: Record<string, unknown> = {
      ...form,
      price: form.price || '0',
      stock: Number(form.stock) || 0,
      category: form.category ? Number(form.category) : null,
      compare_at_price: form.compare_at_price || null,
    }

    try {
      if (editing) {
        await vendorApi.updateProduct(Number(id), payload)
        toast.success('Product updated')
      } else {
        await vendorApi.createProduct(payload)
        toast.success('Product created')
      }
      navigate('/vendor/products')
    } catch (error: any) {
      const fields = error?.response?.data
      if (fields && typeof fields === 'object') {
        setErrors(
          Object.fromEntries(
            Object.entries(fields).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)]),
          ),
        )
      }
      toast.error(apiError(error, 'Could not save the product.'))
    } finally {
      setSaving(false)
    }
  }

  const discount =
    form.compare_at_price && form.price && Number(form.compare_at_price) > Number(form.price)
      ? Math.round(
          ((Number(form.compare_at_price) - Number(form.price)) / Number(form.compare_at_price)) *
            100,
        )
      : 0

  return (
    <div>
      <Link
        to="/vendor/products"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-[var(--primary)]"
      >
        <ArrowLeft className="size-4" />
        Back to products
      </Link>

      <PageHeader
        title={editing ? 'Edit product' : 'New product'}
        description={
          editing ? 'Update the details buyers see.' : 'Add a product to your shop.'
        }
      />

      <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="space-y-4 p-6">
            <h2 className="font-bold">Basics</h2>
            <Input
              label="Product title"
              required
              placeholder="e.g. Merino Crew Sweater"
              value={form.title}
              onChange={set('title')}
              error={errors.title}
            />
            <Input
              label="Short description"
              placeholder="One line shown on the product card"
              value={form.short_description}
              onChange={set('short_description')}
              error={errors.short_description}
            />
            <Textarea
              label="Full description"
              rows={6}
              placeholder="Materials, sizing, what is in the box…"
              value={form.description}
              onChange={set('description')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Brand" value={form.brand} onChange={set('brand')} />
              <Input label="SKU" value={form.sku} onChange={set('sku')} placeholder="ABC-001" />
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-bold">Pricing and stock</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Selling price"
                required
                type="number"
                min="0"
                step="0.01"
                leading={<span className="text-sm">₹</span>}
                value={form.price}
                onChange={set('price')}
                error={errors.price}
              />
              <Input
                label="Compare at (MRP)"
                type="number"
                min="0"
                step="0.01"
                leading={<span className="text-sm">₹</span>}
                value={form.compare_at_price}
                onChange={set('compare_at_price')}
                error={errors.compare_at_price}
                hint={discount > 0 ? `${discount}% off` : undefined}
              />
              <Input
                label="Stock"
                required
                type="number"
                min="0"
                value={form.stock}
                onChange={set('stock')}
                error={errors.stock}
              />
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-bold">Image</h2>
            <Input
              label="Image URL"
              placeholder="https://images.unsplash.com/…"
              leading={<ImageIcon className="size-4" />}
              value={form.image_url}
              onChange={set('image_url')}
              hint="Paste any public image URL."
            />
          </Card>
        </div>

        {/* side panel */}
        <div className="space-y-5 lg:sticky lg:top-32 lg:self-start">
          <Card className="space-y-4 p-5">
            <h2 className="font-bold">Organisation</h2>
            <Select
              label="Category"
              placeholder="Choose a category"
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
              value={form.category}
              onChange={set('category')}
              error={errors.category}
            />
            <Select
              label="Status"
              options={[
                { label: 'Published — live on the shop', value: 'PUBLISHED' },
                { label: 'Draft — hidden from buyers', value: 'DRAFT' },
                { label: 'Archived', value: 'ARCHIVED' },
              ]}
              value={form.status}
              onChange={set('status')}
            />
          </Card>

          <Card className="p-5">
            <h2 className="font-bold">Preview</h2>
            <div className="mt-3.5 overflow-hidden rounded-xl border border-[var(--border)]">
              <div className="aspect-square bg-[var(--surface-2)]">
                {form.image_url ? (
                  <img src={form.image_url} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-[var(--text-subtle)]">
                    <ImageIcon className="size-8" />
                  </div>
                )}
              </div>
              <div className="p-3.5">
                <p className="line-clamp-2 text-sm font-semibold">
                  {form.title || 'Product title'}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-bold">{money(form.price || 0)}</span>
                  {discount > 0 && (
                    <span className="text-xs text-subtle line-through">
                      {money(form.compare_at_price)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <div className="flex gap-2.5">
            <Button type="submit" loading={saving} className="flex-1" icon={<Save className="size-4" />}>
              {editing ? 'Save changes' : 'Create product'}
            </Button>
            <Link to="/vendor/products">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
