import { Heart, Loader2, ShoppingCart, Store } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import type { Product } from '@/api/types'
import { Badge, ProductCardSkeleton, Rating } from '@/components/ui'
import { cn, money } from '@/lib/utils'
import { useAuth } from '@/store/auth'
import { useCart } from '@/store/cart'

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth()
  const { add, pendingProduct, toggleWishlist, isWishlisted } = useCart()
  const navigate = useNavigate()

  const adding = pendingProduct === product.id
  const saved = isWishlisted(product.id)

  function onAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return navigate('/login?next=/shop')
    add(product.id, 1, product.title)
  }

  function onWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return navigate('/login?next=/shop')
    toggleWishlist(product.id, product.title)
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group card flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--surface-2)]">
        <img
          src={product.image_display}
          alt={product.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.discount_percent > 0 && (
            <Badge tone="danger">-{product.discount_percent}%</Badge>
          )}
          {product.is_featured && <Badge tone="brand">Featured</Badge>}
        </div>

        <button
          onClick={onWishlist}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          className={cn(
            'absolute top-3 right-3 flex size-9 items-center justify-center rounded-full',
            'bg-[var(--surface)]/90 backdrop-blur transition-all duration-200 hover:scale-110',
            saved ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]',
          )}
        >
          <Heart className={cn('size-4.5', saved && 'fill-current')} />
        </button>

        {!product.in_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--overlay)]">
            <Badge tone="neutral" className="bg-[var(--surface)] text-[var(--text)]">
              Out of stock
            </Badge>
          </div>
        )}

        {product.in_stock && (
          <button
            onClick={onAdd}
            disabled={adding}
            className={cn(
              'absolute inset-x-3 bottom-3 flex h-10 items-center justify-center gap-2 rounded-xl',
              'bg-[var(--primary)] text-[13px] font-bold text-[var(--primary-fg)]',
              'translate-y-[130%] opacity-0 transition-all duration-300',
              'group-hover:translate-y-0 group-hover:opacity-100',
              'focus-visible:translate-y-0 focus-visible:opacity-100 disabled:opacity-70',
            )}
          >
            {adding ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShoppingCart className="size-4" />
            )}
            Add to cart
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-[var(--text-subtle)] uppercase">
          <Store className="size-3" />
          <span className="truncate">{product.vendor_name}</span>
        </span>

        <h3 className="mt-1.5 line-clamp-2 text-sm leading-snug font-semibold transition-colors group-hover:text-[var(--primary)]">
          {product.title}
        </h3>

        {product.rating_count > 0 && (
          <Rating value={product.rating_avg} count={product.rating_count} className="mt-2" size={12} />
        )}

        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-lg font-bold tracking-tight">{money(product.price)}</span>
          {product.compare_at_price && product.discount_percent > 0 && (
            <span className="text-[13px] text-subtle line-through">
              {money(product.compare_at_price)}
            </span>
          )}
        </div>

        {product.in_stock && product.stock <= 5 && (
          <p className="mt-1.5 text-xs font-semibold text-[var(--warning)]">
            Only {product.stock} left
          </p>
        )}
      </div>
    </Link>
  )
}

export function ProductGrid({
  products,
  loading,
  skeletonCount = 8,
  className,
}: {
  products: Product[]
  loading?: boolean
  skeletonCount?: number
  className?: string
}) {
  if (loading) {
    return (
      <div
        className={cn(
          'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4',
          className,
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4', className)}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
