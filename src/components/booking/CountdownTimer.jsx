import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function getTimeLeft(checkInISO) {
  const diff = new Date(checkInISO) - Date.now()
  if (diff <= 0) return null
  const totalSecs = Math.floor(diff / 1000)
  const d = Math.floor(totalSecs / 86400)
  const h = Math.floor((totalSecs % 86400) / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  return { d, h, m, s, totalSecs }
}

function pad(n) { return String(n).padStart(2, '0') }

/**
 * CountdownTimer — shown in the Hero area, always visible when departureTime is set.
 * Visual but non-intrusive: small inline pill that expands slightly when urgent.
 */
export default function CountdownTimer({ departureTime, primaryColor }) {
  const pc = primaryColor || '#0ea5e9'
  const [timeLeft, setTimeLeft] = useState(() =>
    departureTime ? getTimeLeft(departureTime) : null
  )

  useEffect(() => {
    if (!departureTime) return
    const tick = () => setTimeLeft(getTimeLeft(departureTime))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [departureTime])

  if (!timeLeft || !departureTime) return null

  const isUnder1h   = timeLeft.totalSecs < 3600
  const isUnder24h  = timeLeft.d === 0
  const color       = isUnder1h ? '#ef4444' : isUnder24h ? '#f59e0b' : pc

  // Build segments — hide days when < 1 day
  const segments = timeLeft.d > 0
    ? [
        { val: pad(timeLeft.d),  unit: 'd' },
        { val: pad(timeLeft.h),  unit: 'h' },
        { val: pad(timeLeft.m),  unit: 'm' },
      ]
    : [
        { val: pad(timeLeft.h),  unit: 'h' },
        { val: pad(timeLeft.m),  unit: 'm' },
        { val: pad(timeLeft.s),  unit: 's' },
      ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 14px',
        borderRadius: 100,
        background: `${color}12`,
        border: `1px solid ${color}30`,
        backdropFilter: 'blur(8px)',
        marginTop: 20,
      }}
    >
      {/* Icon */}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>

      <span style={{
        fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em',
        textTransform: 'uppercase', color: color, opacity: 0.75,
        fontFamily: 'var(--font-display)',
        whiteSpace: 'nowrap',
      }}>
        Check-in in
      </span>

      {/* Countdown digits */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {segments.map(({ val, unit }, i) => (
          <React.Fragment key={unit}>
            {i > 0 && (
              <span style={{
                fontSize: 13, fontWeight: 700, color, opacity: 0.5,
                lineHeight: 1,
              }}>:</span>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <motion.span
                key={val}
                initial={{ y: -3, opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.15 }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 16,
                  color,
                  letterSpacing: '-.02em',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                  minWidth: 22,
                  textAlign: 'center',
                }}
              >
                {val}
              </motion.span>
              <span style={{
                fontSize: 9, fontWeight: 600, color, opacity: 0.6,
                textTransform: 'uppercase', letterSpacing: '.06em',
                fontFamily: 'var(--font-display)',
              }}>
                {unit}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Pulse dot when urgent */}
      {isUnder24h && (
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          style={{
            width: 6, height: 6, borderRadius: '50%',
            background: color, flexShrink: 0,
          }}
        />
      )}
    </motion.div>
  )
}
