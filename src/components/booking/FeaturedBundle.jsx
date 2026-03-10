import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice } from '../../utils/money'
import useCartStore from '../../store/useCartStore'

const ease = [.22, 1, .36, 1]

export default function FeaturedBundle({ bundles, products, primaryColor }) {
  const pc = primaryColor || '#0ea5e9'
  const add = useCartStore(s => s.add)
  const items = useCartStore(s => s.items)
  const [added, setAdded] = useState(null) // bundleId of last added

  if (!bundles?.length) return null

  function addBundle(bundle) {
    bundle.productIds.forEach(id => add(id))
    setAdded(bundle.id)
    setTimeout(() => setAdded(null), 2000)
  }

  // Resolve bundle total from product prices
  function bundleTotal(bundle) {
    return bundle.productIds.reduce((sum, id) => {
      const p = products.find(x => String(x.id) === String(id))
      return sum + (p ? parseFloat(p.price) : 0)
    }, 0)
  }

  function bundleInCart(bundle) {
    return bundle.productIds.some(id => items[id] > 0)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: .55, ease }}
      style={{
        maxWidth: 900, margin: '0 auto',
        padding: '0 clamp(16px, 4vw, 28px)',
        marginBottom: 52,
      }}
    >
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{ width: 3, height: 18, borderRadius: 2, background: pc, flexShrink: 0 }} />
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
          color: 'var(--text-primary)', letterSpacing: '-.01em',
        }}>
          Curated Bundles
        </h2>
        <span style={{
          fontSize: 10, fontWeight: 600, color: pc,
          background: pc + '18', border: `1px solid ${pc}30`,
          padding: '2px 8px', borderRadius: 'var(--r-pill)',
          fontFamily: 'var(--font-display)', letterSpacing: '.04em',
          textTransform: 'uppercase',
        }}>
          Best Value
        </span>
      </div>

      {/* Bundle cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 14,
      }}>
        {bundles.map((bundle, idx) => {
          const total   = bundleTotal(bundle)
          const inCart  = bundleInCart(bundle)
          const isAdded = added === bundle.id
          const saving  = bundle.originalPrice ? bundle.originalPrice - (bundle.discountedPrice || total) : 0

          return (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: .4, delay: idx * .08, ease }}
              whileHover={{ y: -4, transition: { duration: .2 } }}
              style={{
                position: 'relative',
                background: `linear-gradient(145deg, ${pc}0a 0%, var(--bg-card) 50%, ${pc}06 100%)`,
                border: `1px solid ${inCart ? pc + '45' : pc + '22'}`,
                borderRadius: 'var(--r-xl)',
                padding: '22px 22px 20px',
                overflow: 'hidden',
                cursor: 'default',
                transition: 'border-color 250ms ease',
              }}
            >
              {/* Shimmer layer */}
              <div className="bundle-shimmer" style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit',
              }} />

              {/* Corner glow */}
              <div aria-hidden style={{
                position: 'absolute', top: -30, right: -30,
                width: 100, height: 100, borderRadius: '50%',
                background: `radial-gradient(circle, ${pc}18 0%, transparent 70%)`,
                pointerEvents: 'none',
              }} />

              {/* Saving badge */}
              {saving > 0 && (
                <div style={{
                  position: 'absolute', top: 14, right: 14,
                  background: `linear-gradient(135deg, ${pc}, ${pc}bb)`,
                  borderRadius: 'var(--r-pill)',
                  padding: '3px 10px',
                  fontSize: 10, fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  color: '#fff', letterSpacing: '.04em',
                  textTransform: 'uppercase',
                  boxShadow: `0 2px 10px ${pc}45`,
                }}>
                  Save {formatPrice(saving)}
                </div>
              )}

              {/* Bundle icon / emoji */}
              <div style={{ fontSize: 32, marginBottom: 14 }}>
                {bundle.emoji || '✨'}
              </div>

              {/* Name */}
              <h3 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
                color: 'var(--text-primary)', letterSpacing: '-.01em',
                marginBottom: 6, lineHeight: 1.2,
              }}>
                {bundle.name}
              </h3>

              {bundle.description && (
                <p style={{
                  fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.6,
                  marginBottom: 16, fontWeight: 300,
                }}>
                  {bundle.description}
                </p>
              )}

              {/* Included items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 18 }}>
                {bundle.productIds.map(id => {
                  const p = products.find(x => String(x.id) === String(id))
                  if (!p) return null
                  return (
                    <div key={id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: 12.5, color: 'var(--text-secondary)',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5" fill={pc + '20'} stroke={pc + '50'} strokeWidth="1"/>
                        <path d="M3.5 6l1.8 1.8 3-3" stroke={pc} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {p.name}
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: 10,
                paddingTop: 14,
                borderTop: `1px solid ${pc}18`,
              }}>
                <div>
                  {bundle.discountedPrice && (
                    <span style={{
                      fontSize: 11, color: 'var(--text-muted)',
                      textDecoration: 'line-through', marginRight: 6,
                    }}>
                      {formatPrice(total)}
                    </span>
                  )}
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20,
                    color: pc, letterSpacing: '-.02em',
                  }}>
                    {formatPrice(bundle.discountedPrice || total)}
                  </span>
                </div>

                <motion.button
                  whileTap={{ scale: .94 }}
                  onClick={() => addBundle(bundle)}
                  style={{
                    height: 38, paddingLeft: 16, paddingRight: 16,
                    borderRadius: 'var(--r-pill)',
                    border: inCart || isAdded ? `1px solid ${pc}50` : 'none',
                    background: inCart || isAdded
                      ? 'transparent'
                      : `linear-gradient(135deg, ${pc}, ${pc}cc)`,
                    color: inCart || isAdded ? pc : '#fff',
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                    cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                    boxShadow: inCart || isAdded ? 'none' : `0 3px 14px ${pc}40`,
                    transition: 'all 200ms ease',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <AnimatePresence mode="wait">
                    {isAdded ? (
                      <motion.span key="done"
                        initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }} transition={{ duration: .18 }}
                      >
                        ✓ Added
                      </motion.span>
                    ) : inCart ? (
                      <motion.span key="incart"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .18 }}
                      >
                        In selection
                      </motion.span>
                    ) : (
                      <motion.span key="add"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .18 }}
                      >
                        Add bundle
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
