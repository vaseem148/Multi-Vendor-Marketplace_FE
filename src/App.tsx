import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import {
  AdminLayout,
  RequireAdmin,
  RequireAuth,
  RequireVendor,
  ShopLayout,
  VendorLayout,
} from '@/components/layout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from '@/components/ui'
import { useAuth } from '@/store/auth'
import { useCart } from '@/store/cart'
import { useUi } from '@/store/ui'

import { AdminCategories } from '@/pages/admin/Categories'
import { AdminCustomers } from '@/pages/admin/Customers'
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { AdminOrders } from '@/pages/admin/Orders'
import { AdminProducts } from '@/pages/admin/Products'
import { AdminVendors } from '@/pages/admin/Vendors'
import { Account } from '@/pages/Account'
import { Cart } from '@/pages/Cart'
import { Checkout } from '@/pages/Checkout'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { NotFound } from '@/pages/NotFound'
import { OrderDetail } from '@/pages/OrderDetail'
import { Orders } from '@/pages/Orders'
import { ProductDetail } from '@/pages/ProductDetail'
import { Register } from '@/pages/Register'
import { Sell } from '@/pages/Sell'
import { Shop } from '@/pages/Shop'
import { VendorEarnings } from '@/pages/vendor/Earnings'
import { VendorOrders } from '@/pages/vendor/Orders'
import { VendorOverview } from '@/pages/vendor/Overview'
import { VendorProductForm } from '@/pages/vendor/ProductForm'
import { VendorProducts } from '@/pages/vendor/Products'
import { VendorShopSettings } from '@/pages/vendor/ShopSettings'
import { VendorShop } from '@/pages/VendorShop'
import { Vendors } from '@/pages/Vendors'
import { Wishlist } from '@/pages/Wishlist'

/** Every navigation starts at the top of the new page. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    // Block body on purpose: a concise arrow would hand scrollTo's return
    // value back to React as the cleanup function.
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

export function App() {
  const { user, hydrate } = useAuth()
  const { fetch: fetchCart, fetchWishlist, clear } = useCart()
  const initTheme = useUi((s) => s.initTheme)

  useEffect(() => {
    initTheme()
    hydrate()
  }, [hydrate, initTheme])

  // Cart and wishlist live server-side, so they follow the signed-in user.
  useEffect(() => {
    if (user) {
      fetchCart()
      fetchWishlist()
    } else {
      clear()
    }
  }, [user, fetchCart, fetchWishlist, clear])

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Toaster />
      <Routes>
        <Route element={<ShopLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="shop/:slug" element={<VendorShop />} />
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="sell" element={<Sell />} />

          <Route element={<RequireAuth />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderNumber" element={<OrderDetail />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="account" element={<Account />} />
          </Route>
        </Route>

        <Route path="/vendor" element={<RequireVendor />}>
          <Route element={<VendorLayout />}>
            <Route index element={<VendorOverview />} />
            <Route path="products" element={<VendorProducts />} />
            <Route path="products/new" element={<VendorProductForm />} />
            <Route path="products/:id/edit" element={<VendorProductForm />} />
            <Route path="orders" element={<VendorOrders />} />
            <Route path="earnings" element={<VendorEarnings />} />
            <Route path="shop" element={<VendorShopSettings />} />
          </Route>
        </Route>

        <Route path="/admin" element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="customers" element={<AdminCustomers />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  )
}
