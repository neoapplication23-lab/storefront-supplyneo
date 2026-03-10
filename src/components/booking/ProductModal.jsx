import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Badge from '../ui/Badge'
import Stepper from '../ui/Stepper'
import UpsellRow from './UpsellRow'
import { formatPrice } from '../../utils/money'

const ease = [.22, 1, .36, 1]

export default function ProductModal({
  product, qty, primaryColor,
  onAdd, onRemove, onClose,
  upsellSuggestions = [],   // from useUpsell, scoped to this product
  cartItems = {},
  onUpsellAdd,              // (id) => void
}) {
  const pc      = primaryColor || '#0ea5e9'
  const inCart  = qty > 0
  const [imgError, setImgError] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  )
  const hasImage = product?.image_url && !imgError

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  if (!product) return null

  const features = Array.isArray(product.features) ? product.features : []
  const delivery = product.delivery || product.delivery_info || ''

  const panelStyle = isMobile ? {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 401,
    width: '100%', maxHeight: '92dvh',
    borderRadius: '24px 24px 0 0', flexDirection: 'column',
  } : {
    position: 'relative', width: '100%',
    maxWidth: 860, maxHeight: '88vh',
    borderRadius: 24, flexDirection: 'row',
  }

  const panelMotion = isMobile
    ? { initial: { y: '100%', opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: '100%', opacity: 0 } }
    : { initial: { opacity: 0, scale: .95, y: 16 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: .97, y: 8 } }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: .22 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(2,5,12,.80)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Desktop wrapper */}
      {!isMobile && (
        <div
          key="desktop-wrapper"
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 401,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, pointerEvents: 'all',
          }}
        >
          <motion.div
            key="panel"
            {...panelMotion}
            transition={{ duration: .3, ease }}
            onClick={e => e.stopPropagation()}
            style={{
              ...panelStyle,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-soft)',
              overflow: 'hidden', display: 'flex',
              boxShadow: '0 24px 80px rgba(0,0,0,.7)',
            }}
          >
            <ModalInner
              product={product} pc={pc} hasImage={hasImage}
              features={features} delivery={delivery}
              qty={qty} inCart={inCart} isMobile={false}
              onAdd={onAdd} onRemove={onRemove} onClose={onClose}
              setImgError={setImgError}
              upsellSuggestions={upsellSuggestions}
              cartItems={cartItems}
              onUpsellAdd={onUpsellAdd}
            />
          </motion.div>
        </div>
      )}

      {/* Mobile bottom sheet */}
      {isMobile && (
        <motion.div
          key="panel-mobile"
          {...panelMotion}
          transition={{ duration: .32, ease }}
          onClick={e => e.stopPropagation()}
          style={{
            ...panelStyle,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-soft)',
            overflow: 'hidden', display: 'flex',
            boxShadow: '0 -8px 40px rgba(0,0,0,.5)',
          }}
        >
          <ModalInner
            product={product} pc={pc} hasImage={hasImage}
            features={features} delivery={delivery}
            qty={qty} inCart={inCart} isMobile={true}
            onAdd={onAdd} onRemove={onRemove} onClose={onClose}
            setImgError={setImgError}
            upsellSuggestions={upsellSuggestions}
            cartItems={cartItems}
            onUpsellAdd={onUpsellAdd}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ModalInner({
  product, pc, hasImage, features, delivery,
  qty, inCart, isMobile,
  onAdd, onRemove, onClose, setImgError,
  upsellSuggestions, cartItems, onUpsellAdd,
}) {
  const hasUpsells = upsellSuggestions?.length > 0

  return (
    <>
      {/* ── Image pane ── */}
      <div style={{
        flexShrink: 0,
        width: isMobile ? '100%' : '42%',
        aspectRatio: isMobile ? '16/9' : undefined,
        background: 'var(--bg-raised)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {hasImage ? (
          <img
            src={product.image_url} alt={product.name}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            fontSize: isMobile ? 56 : 72, userSelect: 'none',
            filter: 'drop-shadow(0 4px 16px rgba(0,0,0,.4))',
          }}>
            {product.emoji || '📦'}
          </div>
        )}

        {/* Gradient bleed — desktop only */}
        {!isMobile && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, transparent 55%, var(--bg-surface) 100%)',
            pointerEvents: 'none',
          }} />
        )}

        {/* Badges */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          display: 'flex', flexDirection: 'column', gap: 5,
        }}>
          {product.popular && <Badge type="popular" primaryColor={pc} />}
          {product.limited && <Badge type="limited" />}
          {product.recommended && <Badge type="recommended" primaryColor={pc} />}
        </div>

        {/* Mobile drag handle */}
        {isMobile && (
          <div style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            width: 36, height: 4, borderRadius: 2,
            background: 'rgba(255,255,255,.25)',
          }} />
        )}
      </div>

      {/* ── Content pane ── */}
      <div
        className="no-scrollbar"
        style={{
          flex: 1, minWidth: 0, overflowY: 'auto',
          padding: 'clamp(20px,3vw,32px)',
          display: 'flex', flexDirection: 'column',
          gap: 18, position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 30, height: 30, borderRadius: '50%',
            border: '1px solid var(--border-soft)', background: 'var(--bg-raised)',
            color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 150ms, color 150ms',
            zIndex: 2,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-raised)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Title + price */}
        <div style={{ paddingRight: 36 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(18px,2.2vw,24px)',
            color: 'var(--text-primary)', lineHeight: 1.2,
            letterSpacing: '-.02em', marginBottom: 8,
          }}>
            {product.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26,
              color: pc, letterSpacing: '-.02em',
            }}>
              {formatPrice(product.price)}
            </span>
            {product.unit && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ {product.unit}</span>
            )}
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border-subtle)', flexShrink: 0 }} />

        {/* Description */}
        {product.description && (
          <p style={{ fontSize: 13.5, color: 'var(--text-soft)', lineHeight: 1.75, fontWeight: 300 }}>
            {product.description}
          </p>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div>
            <p style={{
              fontSize: 9.5, fontWeight: 700, letterSpacing: '.12em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
              marginBottom: 10, fontFamily: 'var(--font-display)',
            }}>
              What's included
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {features.map((f, i) => (
                <li key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55,
                }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    background: pc + '1a', border: `1px solid ${pc}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: 1,
                  }}>
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5l2 2 4-4" stroke={pc} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Delivery info */}
        {delivery && (
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-md)', padding: '11px 13px',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={pc} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <span style={{ fontSize: 12.5, color: 'var(--text-soft)', lineHeight: 1.65, fontWeight: 300 }}>
              {delivery}
            </span>
          </div>
        )}

        {/* ── Upsell row ── */}
        {hasUpsells && (
          <>
            <div style={{ height: 1, background: 'var(--border-subtle)' }} />
            <UpsellRow
              suggestions={upsellSuggestions}
              primaryColor={pc}
              onAdd={onUpsellAdd}
              cartItems={cartItems}
              compact={false}
              label="Pairs well with…"
            />
          </>
        )}

        <div style={{ flexGrow: 1, minHeight: 8 }} />

        {/* CTA row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: inCart ? 'space-between' : 'flex-end',
          gap: 14, paddingTop: 16,
          borderTop: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          <AnimatePresence mode="wait">
            {inCart && (
              <motion.div
                key="stepper"
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }} transition={{ duration: .18 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <Stepper qty={qty} onAdd={onAdd} onRemove={onRemove} primaryColor={pc} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>in selection</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: .97 }}
            onClick={inCart ? onClose : onAdd}
            style={{
              height: 46, paddingLeft: 24, paddingRight: 24,
              borderRadius: 'var(--r-pill)',
              border: inCart ? `1px solid ${pc}40` : 'none',
              background: inCart ? 'transparent' : `linear-gradient(135deg, ${pc}, ${pc}cc)`,
              color: inCart ? pc : '#fff',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
              letterSpacing: '.01em', cursor: 'pointer',
              boxShadow: inCart ? 'none' : `0 4px 18px ${pc}35`,
              transition: 'all 200ms ease',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
            onMouseEnter={e => { if (inCart) e.currentTarget.style.background = pc + '12' }}
            onMouseLeave={e => { if (inCart) e.currentTarget.style.background = 'transparent' }}
          >
            {inCart ? 'Done ✓' : `Add — ${formatPrice(product.price)}`}
          </motion.button>
        </div>
      </div>
    </>
  )
}
