import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * ShipAnimation — full-screen overlay shown when check-in < 1h away.
 * "Sending products to the ship" — cinematic, not blocking.
 * Auto-dismissed after 4s or on click.
 */
export default function ShipAnimation({ show, primaryColor, onDismiss }) {
  const pc = primaryColor || '#0ea5e9'

  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => onDismiss?.(), 5000)
    return () => clearTimeout(t)
  }, [show, onDismiss])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="ship-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={onDismiss}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(2,6,18,0.94)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 0,
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          {/* Ocean waves */}
          <OceanWaves pc={pc} />

          {/* Boxes flying to ship */}
          {[0,1,2,3].map(i => (
            <FlyingBox key={i} pc={pc} delay={i * 0.35} />
          ))}

          {/* Ship */}
          <div style={{ position: 'relative', zIndex: 10, marginBottom: 0 }}>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              style={{ textAlign: 'center' }}
            >
              <ShipSVG pc={pc} />
            </motion.div>
          </div>

          {/* Text below */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{
              textAlign: 'center', paddingTop: 32,
              position: 'relative', zIndex: 10,
            }}
          >
            <motion.p
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(13px,2vw,16px)',
                fontWeight: 700,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: pc,
                marginBottom: 8,
              }}
            >
              Loading your order aboard
            </motion.p>
            <p style={{
              fontSize: 13, color: 'rgba(255,255,255,0.4)',
              fontWeight: 300,
            }}>
              Check-in is less than 1 hour away
            </p>
            <p style={{
              fontSize: 11, color: 'rgba(255,255,255,0.25)',
              marginTop: 24, letterSpacing: '.06em',
            }}>
              Tap anywhere to continue
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function OceanWaves({ pc }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: '45%', overflow: 'hidden', zIndex: 1,
    }}>
      {[0,1,2].map(i => (
        <motion.div
          key={i}
          animate={{ x: [0, -80, 0] }}
          transition={{
            repeat: Infinity, duration: 4 + i * 1.2,
            ease: 'easeInOut', delay: i * 0.7,
          }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: '-10%', right: '-10%',
            height: `${40 - i * 8}%`,
            background: `radial-gradient(ellipse 120% 50% at 50% 100%, ${pc}${['15','0d','08'][i]} 0%, transparent 70%)`,
            borderRadius: '50% 50% 0 0',
          }}
        />
      ))}
      {/* Horizon glow */}
      <div style={{
        position: 'absolute', bottom: '30%', left: 0, right: 0,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${pc}30, transparent)`,
      }} />
    </div>
  )
}

function FlyingBox({ pc, delay }) {
  const startX = Math.random() * 200 - 100
  const startY = 150 + Math.random() * 100

  return (
    <motion.div
      initial={{ opacity: 0, x: startX, y: startY, scale: 0.6, rotate: -10 }}
      animate={{
        opacity: [0, 1, 1, 0],
        x: [startX, startX * 0.3, 0],
        y: [startY, startY * 0.4, -40],
        scale: [0.6, 0.9, 0.5],
        rotate: [-10, 5, 0],
      }}
      transition={{
        delay,
        duration: 2,
        repeat: Infinity,
        repeatDelay: 1.4,
        ease: 'easeInOut',
      }}
      style={{
        position: 'absolute',
        zIndex: 8,
        width: 28, height: 24,
        background: `${pc}20`,
        border: `1px solid ${pc}50`,
        borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14,
      }}
    >
      📦
    </motion.div>
  )
}

function ShipSVG({ pc }) {
  return (
    <svg width="160" height="90" viewBox="0 0 160 90" fill="none">
      {/* Hull */}
      <path d="M20 55 L140 55 L120 78 L40 78 Z"
        fill={`${pc}20`} stroke={pc} strokeWidth="1.5"/>
      {/* Deck superstructure */}
      <rect x="55" y="32" width="50" height="23" rx="2"
        fill={`${pc}18`} stroke={`${pc}60`} strokeWidth="1"/>
      {/* Bridge windows */}
      <rect x="62" y="37" width="10" height="8" rx="1"
        fill={`${pc}35`} stroke={`${pc}70`} strokeWidth="0.8"/>
      <rect x="78" y="37" width="10" height="8" rx="1"
        fill={`${pc}35`} stroke={`${pc}70`} strokeWidth="0.8"/>
      <rect x="94" y="37" width="8" height="8" rx="1"
        fill={`${pc}35`} stroke={`${pc}70`} strokeWidth="0.8"/>
      {/* Mast */}
      <line x1="80" y1="10" x2="80" y2="32" stroke={`${pc}80`} strokeWidth="1.5"/>
      {/* Flag */}
      <path d="M80 10 L95 15 L80 20 Z" fill={pc} opacity="0.7"/>
      {/* Bow line */}
      <path d="M140 55 L148 68" stroke={`${pc}60`} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M20 55 L12 68" stroke={`${pc}60`} strokeWidth="1.2" strokeLinecap="round"/>
      {/* Glow under hull */}
      <ellipse cx="80" cy="80" rx="55" ry="5"
        fill={pc} opacity="0.08"/>
    </svg>
  )
}
