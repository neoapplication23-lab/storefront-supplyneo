import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * Parses a departure ISO string OR builds one from date + checkIn strings.
 * date:    "2025-07-15" or "15 Jul 2025"
 * checkIn: "10:00" or "10:00 AM"
 */
export function parseDepartureTime(departureTime, date, checkIn) {
  // 1. Use explicit ISO if provided
  if (departureTime) {
    const d = new Date(departureTime)
    if (!isNaN(d)) return d
  }
  // 2. Build from date + checkIn
  if (date && checkIn) {
    // Try parsing checkIn as HH:MM
    const timeMatch = checkIn.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10)
      const m = parseInt(timeMatch[2], 10)
      const ampm = timeMatch[3]?.toUpperCase()
      if (ampm === 'PM' && h < 12) h += 12
      if (ampm === 'AM' && h === 12) h = 0

      // Try parsing date
      const d = new Date(date)
      if (!isNaN(d)) {
        d.setHours(h, m, 0, 0)
        return d
      }
    }
  }
  return null
}

function getTimeLeft(target) {
  const diff = target - Date.now()
  if (diff <= 0) return null
  const totalSecs = Math.floor(diff / 1000)
  const d = Math.floor(totalSecs / 86400)
  const h = Math.floor((totalSecs % 86400) / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  return { d, h, m, s, totalSecs }
}

function pad(n) { return String(n).padStart(2, '0') }

export default function CountdownTimer({ departureTime, date, checkIn, primaryColor }) {
  const pc = primaryColor || '#0ea5e9'

  const target = parseDepartureTime(departureTime, date, checkIn)

  const [timeLeft, setTimeLeft] = useState(() => target ? getTimeLeft(target) : null)

  useEffect(() => {
    if (!target) return
    const tick = () => setTimeLeft(getTimeLeft(target))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target?.getTime()])

  if (!target || !timeLeft) return null

  const isUnder1h  = timeLeft.totalSecs < 3600
  const isUnder24h = timeLeft.d === 0
  const color      = isUnder1h ? '#ef4444' : isUnder24h ? '#f59e0b' : pc

  const segments = timeLeft.d > 0
    ? [{ val: pad(timeLeft.d), unit: 'd' }, { val: pad(timeLeft.h), unit: 'h' }, { val: pad(timeLeft.m), unit: 'm' }]
    : [{ val: pad(timeLeft.h), unit: 'h' }, { val: pad(timeLeft.m), unit: 'm' }, { val: pad(timeLeft.s), unit: 's' }]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        marginTop: 20,
        padding: '10px 18px',
        borderRadius: 14,
        background: `${color}14`,
        border: `1px solid ${color}35`,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Clock icon */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0, opacity: 0.85 }}>
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>

      <span style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '.08em',
        textTransform: 'uppercase', color: color, opacity: 0.7,
        fontFamily: 'var(--font-display)', whiteSpace: 'nowrap',
      }}>
        Check-in in
      </span>

      {/* Digits */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {segments.map(({ val, unit }, i) => (
          <React.Fragment key={unit}>
            {i > 0 && (
              <span style={{ fontSize: 15, fontWeight: 700, color, opacity: 0.4, lineHeight: 1, marginBottom: 1 }}>:</span>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <motion.span
                key={val}
                initial={{ y: -4, opacity: 0.4 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.15 }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800, fontSize: 20,
                  color, letterSpacing: '-.02em', lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                  minWidth: 26, textAlign: 'center',
                }}
              >
                {val}
              </motion.span>
              <span style={{
                fontSize: 9, fontWeight: 700, color, opacity: 0.55,
                textTransform: 'uppercase', letterSpacing: '.06em',
                fontFamily: 'var(--font-display)',
              }}>
                {unit}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Pulse dot when < 24h */}
      {isUnder24h && (
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }}
        />
      )}
    </motion.div>
  )
}
