import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import ExperienceMeter from '../booking/ExperienceMeter'

const ease = [.22, 1, .36, 1]

export default function CartBar({
  count, total, primaryColor, onCheckout,
  thresholds,
  urgencyActive,
  upsellSuggestion,
  locked = false,
}) {
  const pc = primaryColor || '#0ea5e9'

  // Spring-animated total
  const spring       = useSpring(total, { stiffness: 120, damping: 20 })
  const displayTotal = useTransform(spring, v => `€${v.toFixed(2)}`)
  useEffect(() => { spring.set(total) }, [total, spring])

  // Micro-prompt timers
  const [showPrompt, setShowPrompt] = useState(false)
  const promptTimer  = useRef(null)
  const dismissTimer = useRef(null)
  const lastCount    = useRef(count)

  useEffect(() => {
    // Only fire when an item is added AND we have a suggestion to show
    if (count > lastCount.current && upsellSuggestion) {
      clearTimeout(promptTimer.current)
      clearTimeout(dismissTimer.current)
      setShowPrompt(false)

      // Appear 3 s after add, auto-dismiss after 6 s
      promptTimer.current  = setTimeout(() => {
        setShowPrompt(true)
        dismissTimer.current = setTimeout(() => setShowPrompt(false), 6000)
      }, 3000)
    }
    lastCount.current = count
    return () => {
      clearTimeout(promptTimer.current)
      clearTimeout(dismissTimer.current)
    }
  }, [count, upsellSuggestion])

  const label = locked ? '⚓ Orders Closed' : urgencyActive ? 'Finalise — vessel prepares soon' : 'Review Selection'

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          key="cartbar"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            zIndex: 'var(--z-cartbar)',
            padding: 'clamp(12px,3vw,16px) clamp(12px,4vw,24px) clamp(20px,5vw,36px)',
            background: 'linear-gradient(to top, rgba(4,8,15,1) 55%, rgba(4,8,15,0))',
            pointerEvents: 'none',
          }}
        >
          <div style={{ maxWidth: 780, margin: '0 auto', pointerEvents: 'all' }}>

            {/* ── Micro-prompt ── */}
            <AnimatePresence>
              {showPrompt && upsellSuggestion && (
                <motion.div
                  key="prompt"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: .25, ease }}
                  style={{
                    marginBottom: 8,
                    padding: '9px 12px',
                    background: 'rgba(8,15,30,.96)',
                    border: `1px solid ${pc}28`,
                    borderRadius: 'var(--r-lg)',
                    display: 'flex', alignItems: 'center', gap: 10,
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    boxShadow: `0 4px 24px rgba(0,0,0,.45), 0 0 0 1px ${pc}10`,
                  }}
                >
                  {/* Thumb */}
                  <div style={{
                    width: 34, height: 34, borderRadius: 'var(--r-sm)',
                    background: 'var(--bg-raised)', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, overflow: 'hidden',
                  }}>
                    {upsellSuggestion.image_url
                      ? <img src={upsellSuggestion.image_url} alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (upsellSuggestion.emoji || '📦')}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 1, fontWeight: 500 }}>
                      Guests also add
                    </p>
                    <p style={{
                      fontSize: 13, fontWeight: 600,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-display)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {upsellSuggestion.name}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowPrompt(false)}
                    style={{
                      width: 22, height: 22, borderRadius: '50%',
                      border: '1px solid var(--border-soft)', background: 'transparent',
                      color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── CTA Button ── */}
            <motion.button
              whileTap={{ scale: locked ? 1 : .975 }}
              onClick={locked ? undefined : onCheckout}
              style={{
                width: '100%', height: 'clamp(56px,7vw,64px)',
                border: 'none', borderRadius: 'var(--r-xl)', cursor: locked ? 'not-allowed' : 'pointer',
                background: locked
                  ? 'var(--bg-raised)'
                  : `linear-gradient(135deg, ${pc} 0%, ${pc}d0 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 clamp(10px,2vw,16px)',
                boxShadow: locked ? 'none' : `0 8px 36px ${pc}45, 0 2px 8px rgba(0,0,0,.45)`,
                position: 'relative', overflow: 'hidden',
                transition: 'box-shadow 200ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 12px 48px ${pc}55, 0 2px 8px rgba(0,0,0,.45)` }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 8px 36px ${pc}45, 0 2px 8px rgba(0,0,0,.45)` }}
            >
              {/* Sweep sheen */}
              <motion.span
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2.5 }}
                style={{
                  position: 'absolute', top: 0, bottom: 0, width: '40%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent)',
                  pointerEvents: 'none',
                }}
              />

              {/* Left: count + label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <motion.div
                  key={count}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: .25, ease: [.34,1.56,.64,1] }}
                  style={{
                    background: 'rgba(255,255,255,.22)', borderRadius: 10,
                    padding: '5px 13px', fontFamily: 'var(--font-display)',
                    fontWeight: 700, fontSize: 14, color: '#fff',
                    letterSpacing: '.02em', flexShrink: 0,
                  }}
                >
                  {count}
                </motion.div>

                <AnimatePresence mode="wait">
                  <motion.span
                    key={label}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: .2 }}
                    style={{
                      fontFamily: 'var(--font-display)', fontWeight: 700,
                      fontSize: 'clamp(13px,1.5vw,15px)',
                      color: '#fff', letterSpacing: '.01em', whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Right: spring total */}
              <motion.span style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 'clamp(16px,1.8vw,19px)', color: '#fff', letterSpacing: '-.01em',
              }}>
                {displayTotal}
              </motion.span>
            </motion.button>

            {/* ── Experience meter ── */}
            <ExperienceMeter total={total} primaryColor={pc} thresholds={thresholds} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
