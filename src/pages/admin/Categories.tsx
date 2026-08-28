import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { adminApi } from '@/api/endpoints'
import type { Category } from '@/api/types'
import { PageHeader } from '@/components/layout'
import { Badge, Button, Card, EmptyState, Input, Modal, Spinner } from '@/components/ui'
import { apiError } from '@/lib/utils'
import { toast } from '@/store/ui'

const BLANK = { name: '', description: '', icon: '', image_url: '', sort_order: '0' }

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Category | null>(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [busy, setBusy] = useState(false)

  function load() {
    setLoading(true)
    adminApi
      .categories()
      .then(({ data }) => setCategories(data))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function startCreate() {
    setEditing(null)
    setForm(BLANK)
    setOpen(true)
  }

  function startEdit(category: Category) {
    setEditing(category)
    setForm({
      name: category.name,
      description: category.description ?? '',
      icon: category.icon ?? '',
      image_url: category.image_url ?? '',
      sort_order: String(category.sort_order ?? 0),
    })
    setOpen(true)
  }

  function set(key: keyof typeof BLANK) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function save() {
    setBusy(true)
    const payload = { ...form, sort_order: Number(form.sort_order) || 0 }
    try {
      if (editing) {
        await adminApi.updateCategory(editing.id, payload)
        toast.success('Category updated')
      } else {
        await adminApi.createCategory(payload)
        toast.success('Category created')
      }
      setOpen(false)
      load()
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setBusy(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    setBusy(true)
    try {
      await adminApi.deleteCategory(deleting.id)
      toast.success('Category deleted')
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
        title="Categories"
        description={`${categories.length} departments on the marketplace`}
        action={
          <Button icon={<Plus className="size-4" />} onClick={startCreate}>
            New category
          </Button>
        }
      />

      {loading ? (
        <Spinner />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<FolderTree className="size-7" />}
          title="No categories yet"
          action={<Button onClick={startCreate}>Create the first one</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <div className="relative h-28 bg-[var(--surface-2)]">
                {category.image_url && (
                  <img src={category.image_url} alt="" className="size-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3.5">
                  <p className="font-bold text-white">{category.name}</p>
                  {!category.is_active && <Badge tone="neutral">Hidden</Badge>}
                </div>
              </div>

              <div className="p-4">
                <p className="line-clamp-2 min-h-9 text-[13px] text-muted">
                  {category.description || 'No description'}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
                  <span className="text-[13px] font-semibold text-muted">
                    {category.product_count} products
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Edit"
                      onClick={() => startEdit(category)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Delete"
                      onClick={() => setDeleting(category)}
                    >
                      <Trash2 className="size-4 text-[var(--danger)]" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit category' : 'New category'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={busy} onClick={save}>
              {editing ? 'Save changes' : 'Create category'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name" required value={form.name} onChange={set('name')} />
          <Input
            label="Description"
            placeholder="One line shown on the category card"
            value={form.description}
            onChange={set('description')}
          />
          <Input
            label="Image URL"
            placeholder="https://…"
            value={form.image_url}
            onChange={set('image_url')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Icon"
              placeholder="e.g. Laptop"
              value={form.icon}
              onChange={set('icon')}
              hint="lucide-react icon name"
            />
            <Input
              label="Sort order"
              type="number"
              value={form.sort_order}
              onChange={set('sort_order')}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete this category?"
        description={deleting?.name}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={busy} onClick={confirmDelete}>
              Delete category
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Products in this category are not deleted — they become uncategorised.
        </p>
      </Modal>
    </div>
  )
}
