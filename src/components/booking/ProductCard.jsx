import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Badge from '../ui/Badge'
import Stepper from '../ui/Stepper'
import { formatPrice } from '../../utils/money'
import { isValidImageSrc } from '../../utils/image'

export default function ProductCard({ product, qty, primaryColor, onAdd, onRemove, onOpenModal }) {
  const pc      = primaryColor || '#0ea5e9'
  const inCart  = qty > 0
  const [imgError, setImgError] = useState(false)
  const [popKey, setPopKey]     = useState(0)  // triggers add-pop animation
  const hasImage = isValidImageSrc(product.image_url) && !imgError

  function handleAdd(e) {
    e.stopPropagation()
    onAdd()
    setPopKey(k => k + 1)
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .32, ease: [.22,1,.36,1] }}
      onClick={onOpenModal}
      style={{
        background: inCart
          ? `linear-gradient(160deg, ${pc}08 0%, var(--bg-card) 60%)`
          : 'var(--bg-card)',
        border: `1px solid ${inCart ? pc + '38' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 280ms ease, background 280ms ease',
        boxShadow: inCart
          ? `var(--shadow-card), 0 0 0 1px ${pc}15`
          : 'var(--shadow-card)',
        cursor: 'pointer',
        position: 'relative',
      }}
      whileHover={{
        y: -4,
        boxShadow: inCart
          ? `0 8px 32px rgba(0,0,0,.5), 0 0 0 1px ${pc}25`
          : '0 8px 32px rgba(0,0,0,.5), 0 16px 56px rgba(0,0,0,.28)',
        transition: { duration: .2 },
      }}
    >
      {/* ── Media ── */}
      <div style={{
        position: 'relative',
        aspectRatio: '16/10',
        overflow: 'hidden',
        background: 'var(--bg-raised)',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {hasImage ? (
          <img
            src={product.image_url} alt={product.name}
            onError={() => setImgError(true)}
            className="card-img"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 500ms cubic-bezier(.22,1,.36,1)',
            }}
          />
        ) : (
          <div style={{
            fontSize: 46, userSelect: 'none',
            filter: 'drop-shadow(0 3px 10px rgba(0,0,0,.4))',
            transition: 'transform 300ms ease',
          }}>
            {product.emoji || '📦'}
          </div>
        )}

        {/* Gradient overlay */}
        {hasImage && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(4,8,15,.6) 0%, rgba(4,8,15,.1) 45%, transparent 100%)',
            pointerEvents: 'none',
          }} />
        )}

        {/* In-cart glow overlay */}
        <AnimatePresence>
          {inCart && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `linear-gradient(to top, ${pc}14 0%, transparent 55%)`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Badges */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          display: 'flex', flexDirection: 'column', gap: 5, zIndex: 1,
        }}>
          {product.popular    && <Badge type="popular" primaryColor={pc} />}
          {product.limited    && <Badge type="limited" />}
          {product.recommended && <Badge type="recommended" primaryColor={pc} />}
        </div>

        {/* In-cart check */}
        <AnimatePresence>
          {inCart && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 20 }}
              style={{
                position: 'absolute', top: 10, right: 10,
                width: 26, height: 26, borderRadius: '50%',
                background: `linear-gradient(135deg, ${pc}, ${pc}cc)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 2px 10px ${pc}55, 0 0 0 3px ${pc}20`,
                zIndex: 1,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M2 5.5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover overlay */}
        <div
          className="card-hover-overlay"
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 220ms ease',
            background: 'rgba(0,0,0,.18)',
            pointerEvents: 'none',
          }}
        >
          <span style={{
            fontSize: 11, fontWeight: 700,
            fontFamily: 'var(--font-display)',
            letterSpacing: '.08em', textTransform: 'uppercase',
            color: '#fff', background: 'rgba(0,0,0,.5)',
            padding: '5px 13px', borderRadius: 'var(--r-pill)',
            backdropFilter: 'blur(6px)',
          }}>
            View details
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{
        padding: 'clamp(13px, 2vw, 16px) clamp(14px, 2vw, 18px) clamp(14px, 2vw, 17px)',
        display: 'flex', flexDirection: 'column', gap: 10, flexGrow: 1,
      }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 'clamp(14.5px, 1.4vw, 16px)',
            lineHeight: 1.28, marginBottom: 5,
            color: 'var(--text-primary)', letterSpacing: '-.01em',
          }}>
            {product.name}
          </h3>
          {product.description && (
            <p style={{
              fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {product.description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 10,
          marginTop: 'auto', paddingTop: 6,
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(17px, 1.6vw, 20px)',
              color: inCart ? pc : 'var(--text-primary)',
              transition: 'color 280ms ease', letterSpacing: '-.02em',
            }}>
              {formatPrice(product.price)}
            </span>
            {product.unit && (
              <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>per {product.unit}</span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {inCart ? (
              <motion.div
                key="stepper"
                initial={{ opacity: 0, scale: .82, x: 8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: .82, x: 8 }}
                transition={{ duration: .18 }}
                onClick={e => e.stopPropagation()}
              >
                <Stepper qty={qty} onAdd={onAdd} onRemove={onRemove} primaryColor={pc} />
              </motion.div>
            ) : (
              <motion.button
                key={`add-${popKey}`}
                initial={{ opacity: 0, scale: .82 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: .82 }}
                transition={{ duration: .18 }}
                whileTap={{ scale: .86 }}
                onClick={handleAdd}
                style={{
                  height: 36, paddingLeft: 14, paddingRight: 14,
                  borderRadius: 'var(--r-pill)',
                  border: `1px solid ${pc}50`,
                  background: pc + '12',
                  color: pc, fontSize: 12.5, fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  display: 'flex', alignItems: 'center', gap: 5,
                  cursor: 'pointer', flexShrink: 0,
                  transition: 'background 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
                  whiteSpace: 'nowrap',
                  minHeight: 44, // touch ergonomics
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = pc + '24'
                  e.currentTarget.style.borderColor = pc + '75'
                  e.currentTarget.style.boxShadow = `0 0 14px ${pc}30`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = pc + '12'
                  e.currentTarget.style.borderColor = pc + '50'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1, marginTop: -1 }}>+</span>
                Add
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Add feedback burst ── */}
      <AnimatePresence>
        {popKey > 0 && (
          <motion.div
            key={popKey}
            initial={{ opacity: .7, scale: .5 }}
            animate={{ opacity: 0, scale: 2.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .5, ease: [.22,1,.36,1] }}
            style={{
              position: 'absolute', inset: 0,
              borderRadius: 'var(--r-lg)',
              border: `2px solid ${pc}`,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
    </motion.article>
  )
}
