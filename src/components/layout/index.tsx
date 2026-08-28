import {
  BarChart3,
  FolderTree,
  LayoutDashboard,
  type LucideIcon,
  Package,
  Receipt,
  Settings,
  Shield,
  ShoppingBag,
  Store,
  Users,
  Wallet,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'

import { Spinner } from '@/components/ui'
import { cn } from '@/lib/utils'
import { isAdmin, isVendor, useAuth } from '@/store/auth'

import { Navbar } from './Navbar'

/* ------------------------------------------------------------------ Footer */

export function Footer() {
  const columns = [
    {
      title: 'Shop',
      links: [
        { to: '/shop', label: 'All products' },
        { to: '/shop?on_sale=true', label: 'On sale' },
        { to: '/shop?ordering=-sold_count', label: 'Best sellers' },
        { to: '/vendors', label: 'Browse sellers' },
      ],
    },
    {
      title: 'Sell',
      links: [
        { to: '/sell', label: 'Start selling' },
        { to: '/vendor', label: 'Vendor dashboard' },
        { to: '/vendor/earnings', label: 'Payouts' },
      ],
    },
    {
      title: 'Account',
      links: [
        { to: '/account', label: 'My account' },
        { to: '/orders', label: 'Order history' },
        { to: '/wishlist', label: 'Wishlist' },
        { to: '/cart', label: 'Cart' },
      ],
    },
  ]

  return (
    <footer className="mt-24 border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--primary-fg)]">
                <ShoppingBag className="size-5" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                MVM<span className="text-[var(--primary)]">.</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              A multi-vendor marketplace where independent Indian sellers run their own shop —
              their products, their pricing, one checkout.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-bold tracking-wider uppercase">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted transition-colors hover:text-[var(--primary)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-7 sm:flex-row">
          <p className="text-[13px] text-subtle">
            © {new Date().getFullYear()} MVM Marketplace. Built as a portfolio project.
          </p>
          <p className="text-[13px] text-subtle">Django REST · React · TypeScript · Tailwind</p>
        </div>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------ Shop layout */

export function ShopLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

/* -------------------------------------------------------------- Guards */

export function RequireAuth({ children }: { children?: ReactNode }) {
  const { user, ready } = useAuth()
  const location = useLocation()

  if (!ready) return <Spinner />
  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  }
  return <>{children ?? <Outlet />}</>
}

export function RequireVendor() {
  const { user, ready } = useAuth()
  if (!ready) return <Spinner />
  if (!user) return <Navigate to="/login?next=/vendor" replace />
  if (!isVendor(user)) return <Navigate to="/sell" replace />
  return <Outlet />
}

export function RequireAdmin() {
  const { user, ready } = useAuth()
  if (!ready) return <Spinner />
  if (!user) return <Navigate to="/login?next=/admin" replace />
  if (!isAdmin(user)) return <Navigate to="/" replace />
  return <Outlet />
}

/* ------------------------------------------------------- Dashboard shell */

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const VENDOR_NAV: NavItem[] = [
  { to: '/vendor', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/vendor/products', label: 'Products', icon: Package },
  { to: '/vendor/orders', label: 'Orders', icon: Receipt },
  { to: '/vendor/earnings', label: 'Earnings', icon: Wallet },
  { to: '/vendor/shop', label: 'Shop settings', icon: Settings },
]

const ADMIN_NAV: NavItem[] = [
  { to: '/admin', label: 'Overview', icon: BarChart3, end: true },
  { to: '/admin/vendors', label: 'Sellers', icon: Store },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: Receipt },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/customers', label: 'Customers', icon: Users },
]

function DashboardShell({ items, title, badge }: { items: NavItem[]; title: string; badge: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 lg:px-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-28">
            <div className="mb-5 flex items-center gap-2.5 px-2">
              {badge}
              <span className="text-sm font-bold">{title}</span>
            </div>
            <nav className="space-y-1">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
                      isActive
                        ? 'bg-[var(--primary-soft)] text-[var(--primary)]'
                        : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
                    )
                  }
                >
                  <item.icon className="size-4.5 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* mobile nav rail */}
          <nav className="no-scrollbar -mx-4 mb-6 flex gap-1.5 overflow-x-auto px-4 lg:hidden">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all',
                    isActive
                      ? 'bg-[var(--primary)] text-[var(--primary-fg)]'
                      : 'bg-[var(--surface-2)] text-[var(--text-muted)]',
                  )
                }
              >
                <item.icon className="size-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export function VendorLayout() {
  return (
    <DashboardShell
      items={VENDOR_NAV}
      title="Seller centre"
      badge={
        <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-fg)]">
          <Store className="size-4" />
        </span>
      }
    />
  )
}

export function AdminLayout() {
  return (
    <DashboardShell
      items={ADMIN_NAV}
      title="Admin console"
      badge={
        <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--text)] text-[var(--surface)]">
          <Shield className="size-4" />
        </span>
      }
    />
  )
}

/* --------------------------------------------------------- Page furniture */

export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-7 flex flex-wrap items-end justify-between gap-4', className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-[13px]">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-subtle">/</span>}
          {item.to ? (
            <Link to={item.to} className="text-muted transition-colors hover:text-[var(--primary)]">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-[var(--text)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

export { Navbar }
