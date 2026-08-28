import {
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Store,
  Sun,
  User as UserIcon,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'

import type { Category } from '@/api/types'
import { catalogApi } from '@/api/endpoints'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { isAdmin, isVendor, useAuth } from '@/store/auth'
import { useCart } from '@/store/cart'
import { useUi } from '@/store/ui'

export function Navbar() {
  const { user, logout } = useAuth()
  const { cart, wishlist, clear } = useCart()
  const { theme, toggleTheme } = useUi()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [categories, setCategories] = useState<Category[]>([])
  const [query, setQuery] = useState(params.get('search') ?? '')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    catalogApi.categories().then(({ data }) => setCategories(data.slice(0, 6))).catch(() => {})
  }, [])

  // Close the account dropdown on any outside click.
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate(query.trim() ? `/shop?search=${encodeURIComponent(query.trim())}` : '/shop')
    setMobileOpen(false)
  }

  function onLogout() {
    logout()
    clear()
    setMenuOpen(false)
    navigate('/')
  }

  const cartCount = cart?.item_count ?? 0

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] glass">
      {/* announcement strip */}
      <div className="bg-[var(--primary)] py-2 text-center text-[13px] font-medium text-[var(--primary-fg)]">
        Free delivery on orders over ₹999 · Shop from 6 independent Indian sellers
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-5 lg:px-8">
        <button
          className="-ml-1 rounded-lg p-2 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--primary-fg)]">
            <ShoppingBag className="size-5" />
          </span>
          <span className="hidden text-lg font-extrabold tracking-tight sm:block">
            MVM<span className="text-[var(--primary)]">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {[
            { to: '/shop', label: 'Shop' },
            { to: '/vendors', label: 'Sellers' },
          ].map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                  isActive
                    ? 'text-[var(--primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={onSearch} className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands and sellers"
            className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] pr-3 pl-10 text-sm transition-all placeholder:text-[var(--text-subtle)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:ring-4 focus:ring-[var(--primary)]/10 focus:outline-none"
          />
        </form>

        <div className="ml-auto flex items-center gap-0.5">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          {user && (
            <Link
              to="/wishlist"
              className="relative hidden rounded-lg p-2.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)] sm:block"
              aria-label="Wishlist"
            >
              <Heart className="size-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 size-2 rounded-full bg-[var(--danger)]" />
              )}
            </Link>
          )}

          <Link
            to="/cart"
            className="relative rounded-lg p-2.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            aria-label="Cart"
          >
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[11px] font-bold text-[var(--primary-fg)]">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative ml-1" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex size-9 items-center justify-center rounded-full bg-[var(--primary)] text-[13px] font-bold text-[var(--primary-fg)] transition-transform hover:scale-105"
              >
                {user.initials}
              </button>

              {menuOpen && (
                <div className="animate-[scale-in_0.15s_ease] absolute right-0 mt-2 w-60 origin-top-right overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lift)]">
                  <div className="border-b border-[var(--border)] p-3.5">
                    <p className="truncate text-sm font-bold">{user.display_name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    {[
                      { to: '/account', icon: UserIcon, label: 'My account' },
                      { to: '/orders', icon: Package, label: 'My orders' },
                      { to: '/wishlist', icon: Heart, label: 'Wishlist' },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                      >
                        <item.icon className="size-4" />
                        {item.label}
                      </Link>
                    ))}

                    {isVendor(user) ? (
                      <Link
                        to="/vendor"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary-soft)]"
                      >
                        <LayoutDashboard className="size-4" />
                        Vendor dashboard
                      </Link>
                    ) : (
                      !user.vendor_id && (
                        <Link
                          to="/sell"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary-soft)]"
                        >
                          <Store className="size-4" />
                          Start selling
                        </Link>
                      )
                    )}

                    {isAdmin(user) && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary-soft)]"
                      >
                        <Shield className="size-4" />
                        Admin console
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-[var(--border)] p-1.5">
                    <button
                      onClick={onLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)]"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="ml-1.5 flex items-center gap-2">
              <Link to="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* category rail */}
      <div className="hidden border-t border-[var(--border)] lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 lg:px-8">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/shop?category=${c.slug}`}
              className="px-3 py-2.5 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]"
            >
              {c.name}
            </Link>
          ))}
          <Link
            to="/sell"
            className="ml-auto px-3 py-2.5 text-[13px] font-bold text-[var(--primary)] transition-opacity hover:opacity-80"
          >
            Sell on MVM →
          </Link>
        </div>
      </div>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="animate-[fade-in_0.2s_ease] border-t border-[var(--border)] bg-[var(--surface)] p-4 lg:hidden">
          <form onSubmit={onSearch} className="relative mb-4 md:hidden">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--text-subtle)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] pr-3 pl-10 text-sm focus:outline-none"
            />
          </form>
          <div className="grid grid-cols-2 gap-1.5">
            {[{ to: '/shop', label: 'All products' }, { to: '/vendors', label: 'Sellers' }]
              .concat(categories.map((c) => ({ to: `/shop?category=${c.slug}`, label: c.name })))
              .map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
                >
                  {link.label}
                </Link>
              ))}
          </div>
        </div>
      )}
    </header>
  )
}
