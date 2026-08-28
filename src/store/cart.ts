import { create } from 'zustand'

import { cartApi, catalogApi } from '@/api/endpoints'
import type { Cart, WishlistEntry } from '@/api/types'
import { apiError } from '@/lib/utils'

import { toast } from './ui'

interface CartState {
  cart: Cart | null
  loading: boolean
  /** id of the product currently being added — drives the per-button spinner */
  pendingProduct: number | null
  wishlist: WishlistEntry[]

  fetch: () => Promise<void>
  add: (productId: number, quantity?: number, title?: string) => Promise<boolean>
  setQuantity: (itemId: number, quantity: number) => Promise<void>
  remove: (itemId: number) => Promise<void>
  clear: () => void

  fetchWishlist: () => Promise<void>
  toggleWishlist: (productId: number, title?: string) => Promise<boolean>
  isWishlisted: (productId: number) => boolean
}

export const useCart = create<CartState>((set, get) => ({
  cart: null,
  loading: false,
  pendingProduct: null,
  wishlist: [],

  async fetch() {
    set({ loading: true })
    try {
      const { data } = await cartApi.get()
      set({ cart: data })
    } catch {
      set({ cart: null })
    } finally {
      set({ loading: false })
    }
  },

  async add(productId, quantity = 1, title) {
    set({ pendingProduct: productId })
    try {
      const { data } = await cartApi.add(productId, quantity)
      set({ cart: data })
      toast.success(title ? `${title} added to cart` : 'Added to cart')
      return true
    } catch (error) {
      toast.error(apiError(error, 'Could not add to cart'))
      return false
    } finally {
      set({ pendingProduct: null })
    }
  },

  async setQuantity(itemId, quantity) {
    if (quantity < 1) return get().remove(itemId)
    const previous = get().cart
    try {
      const { data } = await cartApi.setQuantity(itemId, quantity)
      set({ cart: data })
    } catch (error) {
      set({ cart: previous })
      toast.error(apiError(error, 'Could not update quantity'))
    }
  },

  async remove(itemId) {
    try {
      const { data } = await cartApi.remove(itemId)
      set({ cart: data })
      toast.success('Removed from cart')
    } catch (error) {
      toast.error(apiError(error))
    }
  },

  clear: () => set({ cart: null, wishlist: [] }),

  async fetchWishlist() {
    try {
      const { data } = await catalogApi.wishlist()
      set({ wishlist: data })
    } catch {
      set({ wishlist: [] })
    }
  },

  async toggleWishlist(productId, title) {
    try {
      const { data } = await catalogApi.toggleWishlist(productId)
      await get().fetchWishlist()
      toast.success(
        data.wishlisted
          ? `${title ?? 'Item'} saved to wishlist`
          : `${title ?? 'Item'} removed from wishlist`,
      )
      return data.wishlisted
    } catch (error) {
      toast.error(apiError(error))
      return false
    }
  },

  isWishlisted: (productId) => get().wishlist.some((w) => w.product === productId),
}))
