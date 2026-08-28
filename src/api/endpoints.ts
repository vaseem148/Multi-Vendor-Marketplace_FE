import { api, cleanParams } from './client'
import type {
  AdminStats,
  Address,
  Cart,
  Category,
  Earnings,
  Facets,
  Order,
  Paginated,
  Product,
  Review,
  User,
  Vendor,
  VendorOrderItem,
  VendorStats,
  WishlistEntry,
} from './types'

type Params = Record<string, unknown>

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access: string; refresh: string; user: User }>('/auth/login/', { email, password }),
  register: (payload: {
    email: string
    full_name: string
    phone?: string
    password: string
    password2: string
  }) => api.post<{ access: string; refresh: string; user: User }>('/auth/register/', payload),
  me: () => api.get<User>('/auth/me/'),
  updateMe: (payload: Partial<User>) => api.patch<User>('/auth/me/', payload),
  changePassword: (old_password: string, new_password: string) =>
    api.post('/auth/change-password/', { old_password, new_password }),
  addresses: () => api.get<Address[]>('/auth/addresses/'),
  createAddress: (payload: Partial<Address>) => api.post<Address>('/auth/addresses/', payload),
  updateAddress: (id: number, payload: Partial<Address>) =>
    api.patch<Address>(`/auth/addresses/${id}/`, payload),
  deleteAddress: (id: number) => api.delete(`/auth/addresses/${id}/`),
}

export const catalogApi = {
  products: (params: Params = {}) =>
    api.get<Paginated<Product>>('/catalog/products/', { params: cleanParams(params) }),
  product: (slug: string) => api.get<Product>(`/catalog/products/${slug}/`),
  related: (slug: string) => api.get<Product[]>(`/catalog/products/${slug}/related/`),
  featured: () => api.get<Product[]>('/catalog/products/featured/'),
  trending: () => api.get<Product[]>('/catalog/products/trending/'),
  facets: (params: Params = {}) =>
    api.get<Facets>('/catalog/products/facets/', { params: cleanParams(params) }),
  categories: () => api.get<Category[]>('/catalog/categories/'),
  wishlist: () => api.get<WishlistEntry[]>('/catalog/wishlist/'),
  toggleWishlist: (product: number) =>
    api.post<{ wishlisted: boolean }>('/catalog/wishlist/toggle/', { product }),
  removeWishlist: (id: number) => api.delete(`/catalog/wishlist/${id}/`),
}

export const vendorApi = {
  list: (params: Params = {}) =>
    api.get<Paginated<Vendor>>('/vendors/', { params: cleanParams(params) }),
  detail: (slug: string) => api.get<Vendor>(`/vendors/${slug}/`),
  apply: (payload: Partial<Vendor>) => api.post<Vendor>('/vendors/apply/', payload),
  myShop: () => api.get<Vendor>('/vendors/me/shop/'),
  updateShop: (payload: Partial<Vendor>) => api.patch<Vendor>('/vendors/me/shop/', payload),
  stats: () => api.get<VendorStats>('/vendors/me/stats/'),
  earnings: () => api.get<Earnings>('/vendor/earnings/'),

  products: (params: Params = {}) =>
    api.get<Paginated<Product>>('/catalog/vendor/products/', { params: cleanParams(params) }),
  product: (id: number) => api.get<Product>(`/catalog/vendor/products/${id}/`),
  createProduct: (payload: Partial<Product>) =>
    api.post<Product>('/catalog/vendor/products/', payload),
  updateProduct: (id: number, payload: Partial<Product>) =>
    api.patch<Product>(`/catalog/vendor/products/${id}/`, payload),
  deleteProduct: (id: number) => api.delete(`/catalog/vendor/products/${id}/`),
  toggleProductStatus: (id: number) =>
    api.post<Product>(`/catalog/vendor/products/${id}/toggle_status/`),

  orders: (params: Params = {}) =>
    api.get<Paginated<VendorOrderItem>>('/vendor/orders/', { params: cleanParams(params) }),
  setOrderStatus: (id: number, status: string) =>
    api.post<VendorOrderItem>(`/vendor/orders/${id}/set_status/`, { status }),
}

export const cartApi = {
  get: () => api.get<Cart>('/cart/'),
  add: (product: number, quantity = 1) => api.post<Cart>('/cart/items/', { product, quantity }),
  setQuantity: (itemId: number, quantity: number) =>
    api.patch<Cart>(`/cart/items/${itemId}/`, { quantity }),
  remove: (itemId: number) => api.delete<Cart>(`/cart/items/${itemId}/`),
  clear: () => api.delete('/cart/'),
}

export const orderApi = {
  checkout: (payload: Params) => api.post<Order>('/checkout/', payload),
  list: (params: Params = {}) =>
    api.get<Paginated<Order>>('/orders/', { params: cleanParams(params) }),
  detail: (orderNumber: string) => api.get<Order>(`/orders/${orderNumber}/`),
  cancel: (orderNumber: string) => api.post<Order>(`/orders/${orderNumber}/cancel/`),
}

export const reviewApi = {
  list: (params: Params = {}) =>
    api.get<Paginated<Review>>('/reviews/', { params: cleanParams(params) }),
  create: (payload: { product: number; rating: number; title?: string; comment?: string }) =>
    api.post<Review>('/reviews/', payload),
  update: (id: number, payload: Partial<Review>) => api.patch<Review>(`/reviews/${id}/`, payload),
  remove: (id: number) => api.delete(`/reviews/${id}/`),
}

export const adminApi = {
  stats: () => api.get<AdminStats>('/vendors/admin/stats/'),
  shops: (params: Params = {}) =>
    api.get<Paginated<Vendor>>('/vendors/admin/shops/', { params: cleanParams(params) }),
  approveShop: (id: number) => api.post<Vendor>(`/vendors/admin/shops/${id}/approve/`),
  rejectShop: (id: number, reason: string) =>
    api.post<Vendor>(`/vendors/admin/shops/${id}/reject/`, { reason }),
  suspendShop: (id: number, reason: string) =>
    api.post<Vendor>(`/vendors/admin/shops/${id}/suspend/`, { reason }),
  updateShop: (id: number, payload: Partial<Vendor>) =>
    api.patch<Vendor>(`/vendors/admin/shops/${id}/`, payload),

  products: (params: Params = {}) =>
    api.get<Paginated<Product>>('/catalog/admin/products/', { params: cleanParams(params) }),
  toggleFeatured: (id: number) =>
    api.post<{ is_featured: boolean }>(`/catalog/admin/products/${id}/toggle_featured/`),
  deleteProduct: (id: number) => api.delete(`/catalog/admin/products/${id}/`),

  categories: () => api.get<Category[]>('/catalog/admin/categories/'),
  createCategory: (payload: Partial<Category>) =>
    api.post<Category>('/catalog/admin/categories/', payload),
  updateCategory: (id: number, payload: Partial<Category>) =>
    api.patch<Category>(`/catalog/admin/categories/${id}/`, payload),
  deleteCategory: (id: number) => api.delete(`/catalog/admin/categories/${id}/`),

  orders: (params: Params = {}) =>
    api.get<Paginated<Order>>('/admin/orders/', { params: cleanParams(params) }),
  setOrderStatus: (orderNumber: string, status: string) =>
    api.post<Order>(`/admin/orders/${orderNumber}/set_status/`, { status }),
}

export const statsApi = {
  storefront: () =>
    api.get<{ products: number; vendors: number; orders: number; categories: number }>('/stats/'),
}
