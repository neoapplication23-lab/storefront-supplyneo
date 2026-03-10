import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from './ProductCard'
import ProductModal from './ProductModal'
import useCartStore from '../../store/useCartStore'
import useUpsell from '../../hooks/useUpsell'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: .055 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: .3, ease: [.22,1,.36,1] } },
}

export default function ProductSection({ category, products, sectionId, primaryColor, allProducts = [] }) {
  const pc     = primaryColor || '#0ea5e9'
  const items  = useCartStore(s => s.items)
  const add    = useCartStore(s => s.add)
  const remove = useCartStore(s => s.remove)

  const [modalProduct, setModalProduct] = useState(null)

  const openModal  = p => setModalProduct(p)
  const closeModal = () => setModalProduct(null)

  const modalQty = modalProduct ? (items[modalProduct.id] || 0) : 0

  // Upsell suggestions scoped to the open modal product.
  // We fake a single-item cart to score suggestions relative to THAT product.
  const modalFakeCart = modalProduct ? { [String(modalProduct.id)]: 1 } : {}
  // Use allProducts for cross-category suggestions; fall back to section products
  const upsellPool = allProducts.length ? allProducts : products
  const modalUpsells = useUpsell(modalFakeCart, upsellPool, 4)
    .filter(p => !items[String(p.id)])  // exclude already in cart

  return (
    <>
      <section id={sectionId} style={{ marginBottom: 56, scrollMarginTop: 128 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingTop: 8 }}>
          <div style={{ width: 3, height: 18, borderRadius: 2, background: pc, flexShrink: 0 }} />
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
            color: 'var(--text-primary)', letterSpacing: '-.01em',
          }}>
            {category}
          </h2>
          <span style={{
            fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)',
            letterSpacing: '.06em', textTransform: 'uppercase', paddingTop: 1,
          }}>
            {products.length} item{products.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(265px, 1fr))',
            gap: 14,
          }}
        >
          {products.map(p => (
            <motion.div key={p.id} variants={item}>
              <ProductCard
                product={p}
                qty={items[p.id] || 0}
                primaryColor={pc}
                onAdd={() => add(p.id)}
                onRemove={() => remove(p.id)}
                onOpenModal={() => openModal(p)}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Modal — outside grid */}
      <AnimatePresence>
        {modalProduct && (
          <ProductModal
            key={modalProduct.id}
            product={modalProduct}
            qty={modalQty}
            primaryColor={pc}
            onAdd={() => add(modalProduct.id)}
            onRemove={() => remove(modalProduct.id)}
            onClose={closeModal}
            upsellSuggestions={modalUpsells}
            cartItems={items}
            onUpsellAdd={id => add(id)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
