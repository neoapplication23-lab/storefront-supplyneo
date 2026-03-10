import React, { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice } from '../../utils/money'

const ease = [.22, 1, .36, 1]

/**
 * UpsellRow
 *
 * Horizontal scroll strip of complementary product cards.
 * Used in two contexts:
 *   - ProductModal footer: "Pairs well with…"
 *   - CheckoutDrawer Step 0: "You might also want…"
 *
 * Props:
 *   suggestions   Product[]   from useUpsell hook
 *   primaryColor  string
 *   onAdd         (id) => void
 *   cartItems     { [id]: qty }
 *   compact       bool  — tighter layout for drawer context
 *   label         string — section heading
 */
export default function UpsellRow({
  suggestions = [],
  primaryColor,
  onAdd,
  cartItems = {},
  compact = false,
  label = 'Pairs well with…',
}) {
  const pc = primaryColor || '#0ea5e9'
  const scrollRef = useRef(null)

  if (!suggestions.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .32, ease }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: compact ? 10 : 12,
      }}>
        <div style={{
          width: 2, height: 12, borderRadius: 1,
          background: pc, flexShrink: 0,
        }} />
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          fontFamily: 'var(--font-display)',
        }}>
          {label}
        </p>
      </div>

      {/* Scroll strip */}
      <div
        ref={scrollRef}
        className="no-scrollbar"
        style={{
          display: 'flex',
          gap: compact ? 8 : 10,
          overflowX: 'auto',
          paddingBottom: 4,
          // Fade edges
          maskImage: 'linear-gradient(to right, transparent 0, black 12px, black calc(100% - 12px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0, black 12px, black calc(100% - 12px), transparent 100%)',
        }}
      >
        {suggestions.map((product, i) => (
          <UpsellCard
            key={product.id}
            product={product}
            inCart={cartItems[String(product.id)] > 0}
            primaryColor={pc}
            onAdd={() => onAdd(product.id)}
            compact={compact}
            index={i}
          />
        ))}
      </div>
    </motion.div>
  )
}

function UpsellCard({ product, inCart, primaryColor, onAdd, compact, index }) {
  const pc = primaryColor
  const [imgError, setImgError] = React.useState(false)
  const [justAdded, setJustAdded] = React.useState(false)
  const hasImage = product.image_url && !imgError

  function handleAdd(e) {
    e.stopPropagation()
    if (inCart || justAdded) return
    onAdd()
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2200)
  }

  const w = compact ? 140 : 160
  const imgH = compact ? 72 : 88

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: .28, delay: index * .06, ease: [.22,1,.36,1] }}
      style={{
        width: w, minWidth: w, flexShrink: 0,
        background: inCart || justAdded
          ? `linear-gradient(145deg, ${pc}0c, var(--bg-raised))`
          : 'var(--bg-raised)',
        border: `1px solid ${inCart || justAdded ? pc + '35' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        transition: 'border-color 220ms ease, background 220ms ease',
        cursor: 'default',
      }}
    >
      {/* Image */}
      <div style={{
        height: imgH, overflow: 'hidden',
        background: 'var(--bg-card)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {hasImage ? (
          <img
            src={product.image_url} alt={product.name}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: compact ? 24 : 28, userSelect: 'none' }}>
            {product.emoji || '📦'}
          </span>
        )}
        {(inCart || justAdded) && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            style={{
              position: 'absolute', top: 6, right: 6,
              width: 18, height: 18, borderRadius: '50%',
              background: pc,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 2px 8px ${pc}55`,
            }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1.5 4l2 2 3-3.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: compact ? '8px 10px 10px' : '10px 12px 12px' }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: compact ? 11.5 : 12.5,
          color: 'var(--text-primary)',
          lineHeight: 1.3, marginBottom: 6,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {product.name}
        </p>

        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 4,
        }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: compact ? 12 : 13,
            color: inCart || justAdded ? pc : 'var(--text-primary)',
            letterSpacing: '-.01em',
            transition: 'color 220ms ease',
          }}>
            {formatPrice(product.price)}
          </span>

          <AnimatePresence mode="wait">
            {inCart || justAdded ? (
              <motion.span
                key="in"
                initial={{ opacity: 0, scale: .8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: .8 }}
                style={{
                  fontSize: 10, fontWeight: 700, color: pc,
                  fontFamily: 'var(--font-display)',
                }}
              >
                ✓ Added
              </motion.span>
            ) : (
              <motion.button
                key="add"
                initial={{ opacity: 0, scale: .8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: .8 }}
                whileTap={{ scale: .88 }}
                onClick={handleAdd}
                style={{
                  height: 24, paddingLeft: 8, paddingRight: 8,
                  borderRadius: 'var(--r-pill)',
                  border: `1px solid ${pc}45`,
                  background: pc + '12',
                  color: pc, fontSize: 10.5, fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer', flexShrink: 0,
                  transition: 'background 140ms, border-color 140ms',
                  display: 'flex', alignItems: 'center',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = pc + '22'; e.currentTarget.style.borderColor = pc + '70' }}
                onMouseLeave={e => { e.currentTarget.style.background = pc + '12'; e.currentTarget.style.borderColor = pc + '45' }}
              >
                + Add
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
