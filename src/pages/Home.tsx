import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  Package,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { catalogApi, statsApi, vendorApi } from '@/api/endpoints'
import type { Category, Product, Vendor } from '@/api/types'
import { ProductGrid } from '@/components/product/ProductCard'
import { Badge, Button, Card, Rating } from '@/components/ui'
import { compactNumber } from '@/lib/utils'

const PERKS = [
  { icon: Truck, title: 'Free delivery over ₹999', body: 'Flat ₹49 below that. Ships across India.' },
  { icon: RotateCcw, title: '7-day easy returns', body: 'Changed your mind? Send it right back.' },
  { icon: ShieldCheck, title: 'Buyer protection', body: 'Every seller is vetted before going live.' },
  { icon: Headphones, title: 'Real human support', body: 'Talk to us, not a chatbot loop.' },
]

export function Home() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [trending, setTrending] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [stats, setStats] = useState({ products: 0, vendors: 0, orders: 0, categories: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      catalogApi.featured(),
      catalogApi.trending(),
      catalogApi.categories(),
      vendorApi.list({ page_size: 6 }),
      statsApi.storefront(),
    ])
      .then(([f, t, c, v, s]) => {
        setFeatured(f.data)
        setTrending(t.data)
        setCategories(c.data)
        setVendors(v.data.results)
        setStats(s.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* ------------------------------------------------------------ hero */}
      <section className="hero-mesh relative overflow-hidden border-b border-[var(--border)]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="animate-[fade-up_0.5s_cubic-bezier(0.16,1,0.3,1)]">
            <Badge tone="info" className="mb-5">
              <Sparkles className="size-3" />
              {stats.vendors} independent sellers, one checkout
            </Badge>

            <h1 className="text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Shop small.
              <br />
              <span className="text-[var(--primary)]">Shop everything.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              A marketplace built for independent Indian sellers — electronics, fashion, home,
              beauty and more. Every shop runs itself; you check out just once.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/shop">
                <Button size="lg" icon={<ArrowRight className="size-4.5" />}>
                  Start shopping
                </Button>
              </Link>
              <Link to="/sell">
                <Button size="lg" variant="outline" icon={<Store className="size-4.5" />}>
                  Sell on MVM
                </Button>
              </Link>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              {[
                { label: 'Products', value: stats.products },
                { label: 'Sellers', value: stats.vendors },
                { label: 'Orders shipped', value: stats.orders },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-[13px] font-medium text-muted">{stat.label}</dt>
                  <dd className="mt-1 text-2xl font-extrabold tracking-tight">
                    {compactNumber(stat.value)}+
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* collage */}
          <div className="animate-[fade-up_0.5s_cubic-bezier(0.16,1,0.3,1)_0.1s_both] relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-10">
                {featured.slice(0, 2).map((p) => (
                  <HeroTile key={p.id} product={p} />
                ))}
              </div>
              <div className="space-y-4">
                {featured.slice(2, 4).map((p) => (
                  <HeroTile key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- perk row */}
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-9 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {PERKS.map((perk) => (
            <div key={perk.title} className="flex items-start gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                <perk.icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold">{perk.title}</p>
                <p className="mt-0.5 text-[13px] text-muted">{perk.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ categories */}
      <Section
        title="Shop by category"
        description="Eight departments, stocked by sellers who actually know the product."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.slug}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border)]"
            >
              <img
                src={c.image_url}
                alt={c.name}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-sm font-bold text-white">{c.name}</p>
                <p className="text-xs text-white/70">{c.product_count} products</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* -------------------------------------------------------- featured */}
      <Section
        title="Handpicked for you"
        description="Products our sellers are most proud of right now."
        action={
          <Link to="/shop?is_featured=true">
            <Button variant="outline" size="sm" icon={<ArrowRight className="size-4" />}>
              View all
            </Button>
          </Link>
        }
      >
        <ProductGrid products={featured} loading={loading} skeletonCount={8} />
      </Section>

      {/* --------------------------------------------------------- sellers */}
      <Section
        title="Meet the sellers"
        description="Independent shops running their own storefront on MVM."
        action={
          <Link to="/vendors">
            <Button variant="outline" size="sm" icon={<ArrowRight className="size-4" />}>
              All sellers
            </Button>
          </Link>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((v) => (
            <Link key={v.id} to={`/shop/${v.slug}`}>
              <Card hover className="h-full overflow-hidden">
                <div className="relative h-24 bg-[var(--surface-2)]">
                  {v.banner_display && (
                    <img src={v.banner_display} alt="" className="size-full object-cover opacity-60" />
                  )}
                </div>
                <div className="px-5 pb-5">
                  <div className="-mt-8 mb-3 size-16 overflow-hidden rounded-2xl border-4 border-[var(--surface)] bg-[var(--surface-2)]">
                    {v.logo_display ? (
                      <img src={v.logo_display} alt={v.shop_name} className="size-full object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center bg-[var(--primary)] font-bold text-[var(--primary-fg)]">
                        {v.shop_name[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold">{v.shop_name}</h3>
                    <BadgeCheck className="size-4 shrink-0 text-[var(--primary)]" />
                  </div>
                  <p className="mt-1 line-clamp-2 text-[13px] text-muted">{v.tagline}</p>
                  <div className="mt-3.5 flex items-center justify-between">
                    <Rating value={v.rating_avg} count={v.rating_count} size={12} />
                    <span className="text-xs font-semibold text-muted">
                      {v.product_count} products
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      {/* -------------------------------------------------------- trending */}
      <Section
        title="Trending this week"
        description="What everyone else is adding to their cart."
        icon={<TrendingUp className="size-5 text-[var(--primary)]" />}
      >
        <ProductGrid products={trending} loading={loading} skeletonCount={8} />
      </Section>

      {/* ------------------------------------------------------ sell to us */}
      <section className="mx-auto max-w-7xl px-4 pb-4 lg:px-8">
        <div className="hero-mesh relative overflow-hidden rounded-3xl border border-[var(--border)] p-10 text-center sm:p-16">
          <span className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-[var(--primary-fg)]">
            <Package className="size-7" />
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
            Have something to sell?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
            Open your shop in a couple of minutes. List products, manage your own orders and track
            every rupee you earn — commission is only charged on what you actually sell.
          </p>
          <Link to="/sell" className="mt-8 inline-block">
            <Button size="lg" icon={<Store className="size-4.5" />}>
              Open your shop
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function HeroTile({ product }: { product: Product }) {
  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="aspect-square overflow-hidden bg-[var(--surface-2)]">
        <img
          src={product.image_display}
          alt={product.title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-3.5">
        <p className="truncate text-[13px] font-semibold">{product.title}</p>
        <p className="mt-0.5 text-sm font-bold text-[var(--primary)]">
          ₹{Number(product.price).toLocaleString('en-IN')}
        </p>
      </div>
    </Link>
  )
}

function Section({
  title,
  description,
  action,
  icon,
  children,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
            {icon}
            {title}
          </h2>
          {description && <p className="mt-2 text-sm text-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
