/**
 * useUpsell — Frontend-only complementary product recommendation engine.
 *
 * Priority order for suggestion data:
 *   1. product.related_ids  (field from API response, if present)
 *   2. product.category     (same-category fallback)
 *
 * Returns up to `maxResults` products NOT already in cart,
 * ranked by how often they appear across all related_ids mappings
 * of items currently in the cart.
 */
import { useMemo } from 'react'

export default function useUpsell(cartItems = {}, products = [], maxResults = 3) {
  return useMemo(() => {
    const cartIds = Object.keys(cartItems).filter(id => cartItems[id] > 0)
    if (!cartIds.length || !products.length) return []

    // Score candidates by relevance frequency
    const scores = {}

    cartIds.forEach(cartId => {
      const cartProduct = products.find(p => String(p.id) === cartId)
      if (!cartProduct) return

      // Build candidate list: related_ids first, else same-category peers
      let candidates = []

      if (Array.isArray(cartProduct.related_ids) && cartProduct.related_ids.length) {
        candidates = cartProduct.related_ids.map(String)
      } else {
        // Fallback: products in same category, excluding self
        candidates = products
          .filter(p => p.category === cartProduct.category && String(p.id) !== cartId)
          .map(p => String(p.id))
      }

      candidates.forEach(cid => {
        // Skip items already in cart
        if (cartItems[cid] > 0) return
        scores[cid] = (scores[cid] || 0) + 1
      })
    })

    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])            // highest score first
      .slice(0, maxResults)
      .map(([id]) => products.find(p => String(p.id) === id))
      .filter(Boolean)
  }, [cartItems, products, maxResults])
}
