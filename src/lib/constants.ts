export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

/** How each order status is coloured across the app. */
export const STATUS_TONE: Record<string, 'neutral' | 'info' | 'warning' | 'success' | 'danger'> = {
  PENDING: 'neutral',
  CONFIRMED: 'info',
  PROCESSING: 'warning',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  UNPAID: 'warning',
  PAID: 'success',
  REFUNDED: 'neutral',
  APPROVED: 'success',
  REJECTED: 'danger',
  SUSPENDED: 'danger',
  PUBLISHED: 'success',
  DRAFT: 'neutral',
  ARCHIVED: 'neutral',
}

/** The next status a vendor can legitimately move a line to. */
export const NEXT_STATUS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

export const SORT_OPTIONS = [
  { label: 'Newest first', value: '-created_at' },
  { label: 'Price: low to high', value: 'price' },
  { label: 'Price: high to low', value: '-price' },
  { label: 'Top rated', value: '-rating_avg' },
  { label: 'Best selling', value: '-sold_count' },
  { label: 'Name A–Z', value: 'title' },
]

export const PAYMENT_METHODS = [
  { value: 'COD', label: 'Cash on delivery', hint: 'Pay when it arrives' },
  { value: 'UPI', label: 'UPI', hint: 'GPay, PhonePe, Paytm' },
  { value: 'CARD', label: 'Card', hint: 'Credit or debit' },
  { value: 'NETBANKING', label: 'Net banking', hint: 'All major banks' },
]

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]
