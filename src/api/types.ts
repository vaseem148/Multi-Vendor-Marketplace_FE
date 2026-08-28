export type Role = 'CUSTOMER' | 'VENDOR' | 'ADMIN'
export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface User {
  id: number
  email: string
  full_name: string
  display_name: string
  initials: string
  role: Role
  phone: string
  avatar: string | null
  is_staff: boolean
  created_at: string
  vendor_id: number | null
  vendor_status: VendorStatus | null
  vendor_slug: string | null
}

export interface Address {
  id: number
  label: string
  full_name: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  one_line: string
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  parent: number | null
  image_url: string
  icon: string
  is_active: boolean
  sort_order: number
  product_count: number
}

export interface Vendor {
  id: number
  shop_name: string
  slug: string
  tagline: string
  logo_display: string
  banner_display: string
  city: string
  state: string
  rating_avg: string
  rating_count: number
  product_count: number
  status: VendorStatus
  description?: string
  contact_email?: string
  contact_phone?: string
  commission_rate?: string
  total_sales?: string
  created_at?: string
}

export interface ProductImage {
  id: number
  image_display: string
  image_url: string
  alt: string
  sort_order: number
}

export interface Product {
  id: number
  title: string
  slug: string
  short_description: string
  brand: string
  price: string
  compare_at_price: string | null
  discount_percent: number
  stock: number
  in_stock: boolean
  image_display: string
  is_featured: boolean
  rating_avg: string
  rating_count: number
  sold_count: number
  vendor: number
  vendor_name: string
  vendor_slug: string
  category: number | null
  category_name: string | null
  category_slug: string | null
  created_at: string
  // detail-only
  description?: string
  sku?: string
  image_url?: string
  status?: ProductStatus
  is_active?: boolean
  view_count?: number
  images?: ProductImage[]
  vendor_detail?: Vendor
  is_wishlisted?: boolean
  updated_at?: string
}

export interface CartTotals {
  subtotal: string
  shipping_fee: string
  tax: string
  total: string
  free_shipping_threshold: string
}

export interface CartItem {
  id: number
  product: number
  product_detail: Product
  quantity: number
  line_total: string
  added_at: string
}

export interface Cart {
  id: number
  items: CartItem[]
  subtotal: string
  item_count: number
  totals: CartTotals
  updated_at: string
}

export interface OrderItem {
  id: number
  product: number | null
  product_slug: string | null
  title: string
  image_url: string
  unit_price: string
  quantity: number
  line_total: string
  status: string
  vendor: number | null
  vendor_name: string | null
  vendor_slug: string | null
}

export interface VendorOrderItem extends OrderItem {
  order: number
  order_number: string
  order_status: string
  placed_at: string
  customer_name: string
  ship_to: string
  commission_rate: string
  commission_amount: string
  vendor_earning: string
}

export interface Order {
  id: number
  order_number: string
  status: string
  payment_status: string
  payment_method: string
  subtotal: string
  shipping_fee: string
  tax: string
  total: string
  items: OrderItem[]
  item_count: number
  ship_full_name: string
  ship_phone: string
  ship_line1: string
  ship_line2: string
  ship_city: string
  ship_state: string
  ship_postal_code: string
  ship_country: string
  ship_address_line: string
  note: string
  customer_email: string
  created_at: string
  updated_at: string
}

export interface Review {
  id: number
  product: number
  product_title: string
  rating: number
  title: string
  comment: string
  is_verified_purchase: boolean
  user: number
  user_name: string
  user_initials: string
  created_at: string
  updated_at: string
}

export interface WishlistEntry {
  id: number
  product: number
  product_detail: Product
  created_at: string
}

export interface Paginated<T> {
  count: number
  num_pages: number
  page: number
  page_size: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface VendorStats {
  products_total: number
  products_published: number
  products_out_of_stock: number
  orders_total: number
  orders_pending: number
  units_sold: number
  earnings_total: string
  commission_paid: string
  earnings_this_month: string
  rating_avg: string
  commission_rate: string
  status: VendorStatus
}

export interface AdminStats {
  gmv: string
  platform_revenue: string
  orders_total: number
  customers_total: number
  products_total: number
  vendors_total: number
  vendors_pending: number
  vendors_approved: number
  vendors_rejected: number
  vendors_suspended: number
  orders_by_status: Record<string, number>
  top_vendors: { shop_name: string; revenue: string; units: number }[]
}

export interface Earnings {
  earnings_total: string
  commission_paid: string
  units_sold: number
  settled: string
  pending: string
  by_month: { month: string; amount: number }[]
}

export interface Facets {
  brands: { name: string; count: number }[]
  price_min: string
  price_max: string
  total: number
}
