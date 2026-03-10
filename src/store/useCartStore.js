import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  items: {},      // { [productId]: quantity }

  add(id) {
    set(s => ({ items: { ...s.items, [id]: (s.items[id] || 0) + 1 } }))
  },

  remove(id) {
    const items = { ...get().items }
    if (!items[id]) return
    if (items[id] <= 1) delete items[id]
    else items[id]--
    set({ items })
  },

  clear() {
    set({ items: {} })
  },

  get count() {
    return Object.values(get().items).reduce((a, b) => a + b, 0)
  },

  total(products = []) {
    return Object.entries(get().items).reduce((sum, [id, qty]) => {
      const p = products.find(x => String(x.id) === String(id))
      return sum + (p ? parseFloat(p.price) * qty : 0)
    }, 0)
  },
}))

export default useCartStore
