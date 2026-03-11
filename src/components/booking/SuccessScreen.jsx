import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice } from '../../utils/money'

const ease = [.22, 1, .36, 1]

// Floating particles
function Particle({ pc, delay, x, y, size }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x, y: y + 20 }}
      animate={{ opacity: [0, .8, 0], scale: [0, 1, .6], y: y - 60 }}
      transition={{ delay, duration: 1.4, ease }}
      style={{
        position: 'absolute',
        width: size, height: size,
        borderRadius: '50%',
        background: pc,
        boxShadow: `0 0 ${size * 2}px ${pc}`,
        pointerEvents: 'none',
      }}
    />
  )
}

const PARTICLES = [
  { x: -80, y: -20, size: 4, delay: .4 },
  { x: 60,  y: -30, size: 3, delay: .5 },
  { x: -40, y: 10,  size: 5, delay: .55 },
  { x: 80,  y: 0,   size: 3, delay: .45 },
  { x: 20,  y: -40, size: 4, delay: .6 },
  { x: -60, y: -10, size: 3, delay: .5 },
]

export default function SuccessScreen({ clientName, total, primaryColor, boatName, departureDate, orderCount = 1, onAddMore }) {
  const pc = primaryColor || '#0ea5e9'
  const [showParticles, setShowParticles] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowParticles(false), 2500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background ambient glows */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: .6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease }}
        style={{
          position: 'absolute',
          top: '20%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${pc}10 0%, transparent 68%)`,
          pointerEvents: 'none',
        }}
      />
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${pc}07 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .55, ease }}
        style={{
          textAlign: 'center', maxWidth: 400, width: '100%',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* ── Icon + particles ── */}
        <div style={{
          position: 'relative', display: 'inline-block',
          marginBottom: 32,
        }}>
          {/* Particle burst */}
          <AnimatePresence>
            {showParticles && PARTICLES.map((p, i) => (
              <Particle key={i} pc={pc} {...p} />
            ))}
          </AnimatePresence>

          {/* Outer ring — slow pulse */}
          <motion.div
            initial={{ scale: .5, opacity: 0 }}
            animate={{ scale: [.8, 1.6, 1.8], opacity: [.6, .2, 0] }}
            transition={{ delay: .2, duration: 1.1, ease }}
            style={{
              position: 'absolute', inset: -12,
              borderRadius: '50%',
              border: `1.5px solid ${pc}`,
              pointerEvents: 'none',
            }}
          />

          {/* Mid ring */}
          <motion.div
            initial={{ scale: .5, opacity: 0 }}
            animate={{ scale: [.8, 1.3, 1.5], opacity: [.5, .15, 0] }}
            transition={{ delay: .35, duration: .9, ease }}
            style={{
              position: 'absolute', inset: -6,
              borderRadius: '50%',
              border: `1px solid ${pc}`,
              pointerEvents: 'none',
            }}
          />

          {/* Check circle */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: .12, type: 'spring', stiffness: 260, damping: 16 }}
            style={{
              width: 84, height: 84, borderRadius: '50%',
              background: `linear-gradient(145deg, ${pc} 0%, ${pc}aa 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 0 8px ${pc}14, 0 8px 40px ${pc}40`,
            }}
          >
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <motion.path
                d="M8 17.5l6 6 12-12"
                stroke="#fff"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: .38, duration: .42, ease }}
              />
            </svg>
          </motion.div>
        </div>

        {/* ── Text ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .32, duration: .45, ease }}
        >
          <p style={{
            fontSize: 10.5, fontWeight: 700, letterSpacing: '.16em',
            textTransform: 'uppercase', color: pc, opacity: .9,
            fontFamily: 'var(--font-display)', marginBottom: 10,
          }}>
            You're all set
          </p>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800, fontSize: 'clamp(26px, 4vw, 34px)',
            color: 'var(--text-primary)',
            letterSpacing: '-.025em', lineHeight: 1.1,
            marginBottom: 14,
          }}>
            Selection<br />Confirmed ✓
          </h1>

          <p style={{
            color: 'var(--text-soft)', fontSize: 15,
            lineHeight: 1.75, marginBottom: 36,
            fontWeight: 300, maxWidth: 320, margin: '0 auto 36px',
          }}>
            Thank you,{' '}
            <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              {clientName}
            </strong>
            . Your charter team will prepare everything and be in touch shortly.
          </p>
        </motion.div>

        {/* ── Total card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .46, duration: .4, ease }}
          style={{
            background: `linear-gradient(135deg, ${pc}0e 0%, ${pc}06 100%)`,
            border: `1px solid ${pc}28`,
            borderRadius: 'var(--r-xl)',
            padding: '20px 28px',
            display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <div>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
              fontFamily: 'var(--font-display)', marginBottom: 4,
            }}>
              Order Total
            </p>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 28, color: pc, letterSpacing: '-.03em',
            }}>
              {formatPrice(total)}
            </span>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: pc + '15',
            border: `1px solid ${pc}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={pc} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
        </motion.div>

        {/* ── What happens next ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .6, duration: .45 }}
          style={{
            display: 'flex', flexDirection: 'column', gap: 8,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-lg)',
            padding: '16px 20px',
            textAlign: 'left',
            marginBottom: 22,
          }}
        >
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
            fontFamily: 'var(--font-display)',
          }}>
            What happens next
          </p>
          {[
            'Your charter team reviews the selection',
            'You receive a confirmation email',
            'Everything is prepared before departure',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                background: pc + '18', border: `1px solid ${pc}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color: pc,
                fontFamily: 'var(--font-display)',
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.5 }}>
                {step}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .72 }}
          style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}
        >
          You can safely close this window.
        </motion.p>

        {/* Re-order option */}
        {onAddMore && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            style={{ marginTop: 8 }}
          >
            <div style={{
              height: 1, background: 'var(--border-subtle)', margin: '16px 0',
            }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              {orderCount > 1
                ? `You've placed ${orderCount} orders so far.`
                : 'Want to add something else?'}
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onAddMore}
              style={{
                width: '100%', height: 44,
                background: 'transparent',
                border: `1px solid ${pc}40`,
                borderRadius: 'var(--r-xl)',
                color: pc,
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                cursor: 'pointer',
                transition: 'background 150ms, border-color 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${pc}10`; e.currentTarget.style.borderColor = `${pc}70` }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${pc}40` }}
            >
              + Add another order
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
