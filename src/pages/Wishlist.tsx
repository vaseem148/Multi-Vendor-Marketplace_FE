import { Heart } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/layout'
import { ProductGrid } from '@/components/product/ProductCard'
import { Button, EmptyState } from '@/components/ui'
import { useCart } from '@/store/cart'

export function Wishlist() {
  const { wishlist, fetchWishlist } = useCart()

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  return (
    <div className="mx-auto max-w-7xl px-4 py-9 lg:px-8">
      <PageHeader
        title="Your wishlist"
        description={`${wishlist.length} saved item${wishlist.length === 1 ? '' : 's'}`}
      />

      {wishlist.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-7" />}
          title="Nothing saved yet"
          description="Tap the heart on any product to keep it here for later."
          action={
            <Link to="/shop">
              <Button size="lg">Browse products</Button>
            </Link>
          }
        />
      ) : (
        <ProductGrid products={wishlist.map((w) => w.product_detail)} />
      )}
    </div>
  )
}
