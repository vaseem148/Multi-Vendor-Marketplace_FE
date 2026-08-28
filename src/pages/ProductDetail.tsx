import {
  BadgeCheck,
  Heart,
  Minus,
  Package,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { catalogApi, reviewApi } from '@/api/endpoints'
import type { Product, Review } from '@/api/types'
import { Breadcrumbs } from '@/components/layout'
import { ProductGrid } from '@/components/product/ProductCard'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Rating,
  Skeleton,
  Textarea,
} from '@/components/ui'
import { apiError, cn, formatDate, money } from '@/lib/utils'
import { useAuth } from '@/store/auth'
import { useCart } from '@/store/cart'
import { toast } from '@/store/ui'

export function ProductDetail() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { add, pendingProduct, toggleWishlist, isWishlisted } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [reviewOpen, setReviewOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    setQuantity(1)
    setActiveImage(0)
    catalogApi
      .product(slug)
      .then(({ data }) => {
        setProduct(data)
        return Promise.all([
          catalogApi.related(slug),
          reviewApi.list({ product: data.id, page_size: 20 }),
        ])
      })
      .then(([rel, rev]) => {
        setRelated(rel.data)
        setReviews(rev.data.results)
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <ProductSkeleton />

  if (!product) {
    return (
      <EmptyState
        icon={<Package className="size-7" />}
        title="Product not found"
        description="It may have been removed by the seller."
        action={
          <Link to="/shop">
            <Button>Back to shop</Button>
          </Link>
        }
      />
    )
  }

  const gallery = [
    product.image_display,
    ...(product.images ?? []).map((i) => i.image_display),
  ].filter((src, i, arr) => src && arr.indexOf(src) === i)

  const saved = isWishlisted(product.id)

  function onAdd(buyNow = false) {
    if (!user) return navigate(`/login?next=/product/${slug}`)
    add(product!.id, quantity, product!.title).then((ok) => {
      if (ok && buyNow) navigate('/checkout')
    })
  }

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          ...(product.category_name
            ? [{ label: product.category_name, to: `/shop?category=${product.category_slug}` }]
            : []),
          { label: product.title },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        {/* gallery */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]">
            <img
              src={gallery[activeImage]}
              alt={product.title}
              className="aspect-square w-full object-cover"
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-3">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'size-20 overflow-hidden rounded-xl border-2 transition-all',
                    i === activeImage
                      ? 'border-[var(--primary)]'
                      : 'border-[var(--border)] opacity-60 hover:opacity-100',
                  )}
                >
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* buy box */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.is_featured && <Badge tone="brand">Featured</Badge>}
            {product.discount_percent > 0 && (
              <Badge tone="danger">-{product.discount_percent}% off</Badge>
            )}
            {product.brand && <Badge tone="neutral">{product.brand}</Badge>}
          </div>

          <h1 className="mt-3.5 text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">
            {product.title}
          </h1>

          <div className="mt-3.5 flex flex-wrap items-center gap-4">
            <Rating value={product.rating_avg} count={product.rating_count} size={16} />
            {product.sold_count > 0 && (
              <span className="text-sm text-muted">{product.sold_count} sold</span>
            )}
          </div>

          <Link
            to={`/shop/${product.vendor_slug}`}
            className="mt-4 inline-flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 transition-colors hover:border-[var(--primary)]"
          >
            <Store className="size-4 text-[var(--primary)]" />
            <span className="text-sm font-semibold">{product.vendor_name}</span>
            <BadgeCheck className="size-4 text-[var(--primary)]" />
            <span className="text-xs text-muted">Visit shop →</span>
          </Link>

          <div className="mt-6 flex items-end gap-3">
            <span className="text-4xl font-extrabold tracking-tight">{money(product.price)}</span>
            {product.compare_at_price && product.discount_percent > 0 && (
              <>
                <span className="pb-1.5 text-lg text-subtle line-through">
                  {money(product.compare_at_price)}
                </span>
                <span className="pb-2 text-sm font-bold text-[var(--success)]">
                  Save {money(Number(product.compare_at_price) - Number(product.price))}
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-[13px] text-subtle">Inclusive of all taxes</p>

          {product.short_description && (
            <p className="mt-5 leading-relaxed text-muted">{product.short_description}</p>
          )}

          <div className="mt-6 flex items-center gap-3">
            {product.in_stock ? (
              <Badge tone="success" dot>
                In stock
              </Badge>
            ) : (
              <Badge tone="danger" dot>
                Out of stock
              </Badge>
            )}
            {product.in_stock && product.stock <= 10 && (
              <span className="text-sm font-semibold text-[var(--warning)]">
                Only {product.stock} left
              </span>
            )}
          </div>

          {product.in_stock && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex h-12 items-center rounded-xl border border-[var(--border-strong)]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex size-12 items-center justify-center text-[var(--text-muted)] transition-colors hover:text-[var(--text)] disabled:opacity-40"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="flex size-12 items-center justify-center text-[var(--text-muted)] transition-colors hover:text-[var(--text)] disabled:opacity-40"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <Button
                size="lg"
                className="flex-1"
                loading={pendingProduct === product.id}
                onClick={() => onAdd(false)}
                icon={<ShoppingCart className="size-4.5" />}
              >
                Add to cart
              </Button>
              <Button size="lg" variant="secondary" onClick={() => onAdd(true)}>
                Buy now
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-13 w-13"
                aria-label="Save to wishlist"
                onClick={() =>
                  user
                    ? toggleWishlist(product.id, product.title)
                    : navigate(`/login?next=/product/${slug}`)
                }
              >
                <Heart className={cn('size-5', saved && 'fill-[var(--danger)] text-[var(--danger)]')} />
              </Button>
            </div>
          )}

          <div className="mt-7 grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: 'Free over ₹999' },
              { icon: RotateCcw, label: '7-day returns' },
              { icon: ShieldCheck, label: 'Buyer protection' },
            ].map((perk) => (
              <div
                key={perk.label}
                className="flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] p-3.5 text-center"
              >
                <perk.icon className="size-5 text-[var(--primary)]" />
                <span className="text-[11px] font-semibold text-muted">{perk.label}</span>
              </div>
            ))}
          </div>

          {product.description && (
            <div className="mt-8 border-t border-[var(--border)] pt-7">
              <h2 className="mb-3 text-lg font-bold">About this product</h2>
              <p className="leading-relaxed whitespace-pre-line text-muted">{product.description}</p>
              {product.sku && (
                <p className="mt-4 text-[13px] text-subtle">
                  SKU <span className="font-mono">{product.sku}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* reviews */}
      <section className="mt-16 border-t border-[var(--border)] pt-12">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Reviews <span className="text-muted">({product.rating_count})</span>
          </h2>
          {user && (
            <Button variant="outline" onClick={() => setReviewOpen(true)}>
              Write a review
            </Button>
          )}
        </div>

        {reviews.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="font-semibold">No reviews yet</p>
            <p className="mt-1.5 text-sm text-muted">Be the first to review this product.</p>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <Card className="h-fit p-6">
              <div className="text-center">
                <p className="text-5xl font-extrabold tracking-tight">
                  {Number(product.rating_avg).toFixed(1)}
                </p>
                <Rating value={product.rating_avg} showValue={false} size={18} className="mt-2.5 justify-center" />
                <p className="mt-2 text-sm text-muted">{product.rating_count} reviews</p>
              </div>
              <div className="mt-6 space-y-2">
                {ratingBreakdown.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2.5">
                    <span className="w-3 text-xs font-semibold">{star}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-3)]">
                      <div
                        className="h-full rounded-full bg-[var(--star)] transition-all"
                        style={{
                          width: `${reviews.length ? (count / reviews.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs text-subtle">{count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="p-5">
                  <div className="flex items-start gap-3.5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[13px] font-bold text-[var(--primary)]">
                      {review.user_initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold">{review.user_name}</span>
                        {review.is_verified_purchase && (
                          <Badge tone="success">Verified purchase</Badge>
                        )}
                        <span className="ml-auto text-xs text-subtle">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      <Rating value={review.rating} showValue={false} size={13} className="mt-1.5" />
                      {review.title && <p className="mt-2.5 font-semibold">{review.title}</p>}
                      {review.comment && (
                        <p className="mt-1 text-sm leading-relaxed text-muted">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-16 border-t border-[var(--border)] pt-12">
          <h2 className="mb-7 text-2xl font-bold tracking-tight">You might also like</h2>
          <ProductGrid products={related} />
        </section>
      )}

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        productId={product.id}
        onCreated={(review) => {
          setReviews((r) => [review, ...r])
          catalogApi.product(slug).then(({ data }) => setProduct(data))
        }}
      />
    </div>
  )
}

function ReviewModal({
  open,
  onClose,
  productId,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  productId: number
  onCreated: (review: Review) => void
}) {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit() {
    setSaving(true)
    try {
      const { data } = await reviewApi.create({ product: productId, rating, title, comment })
      onCreated(data)
      toast.success('Thanks for the review')
      onClose()
      setTitle('')
      setComment('')
    } catch (error) {
      toast.error(apiError(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Write a review"
      description="Tell other shoppers what you thought."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={submit}>
            Post review
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <span className="mb-2 block text-[13px] font-semibold">Your rating</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
                aria-label={`${star} stars`}
              >
                <Rating value={star <= rating ? 5 : 0} showValue={false} size={26} className="[&>span]:gap-0" />
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted">{rating} out of 5</p>
        </div>
        <Input
          label="Title"
          placeholder="Sum it up in a few words"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          label="Your review"
          placeholder="What did you like or not like about it?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
    </Modal>
  )
}

function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-9 lg:px-8">
      <Skeleton className="mb-6 h-4 w-64" />
      <div className="grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-12 w-52" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-13 w-full" />
        </div>
      </div>
    </div>
  )
}
