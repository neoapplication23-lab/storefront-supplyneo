import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function getTimeLeft(departureISO) {
  const diff = new Date(departureISO) - Date.now()
  if (diff <= 0) return null
  const totalSecs = Math.floor(diff / 1000)
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  return { h, m, s, totalSecs }
}

function pad(n) { return String(n).padStart(2, '0') }

/**
 * PrepWindowBanner
 *
 * Mounts between CategoryNav and the first ProductSection.
 * Only renders when:
 *   - departureTime is a valid future ISO string
 *   - hours remaining < 24
 *   - cartHasItems is true
 *
 * Visual language: logistical urgency, never discount pressure.
 * Copy anchored to vessel preparation — a real operational constraint.
 */
export default function PrepWindowBanner({ departureTime, primaryColor, cartHasItems }) {
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

  // Conditions to show
  const shouldShow = (
    cartHasItems &&
    timeLeft !== null &&
    timeLeft.totalSecs > 0 &&
    timeLeft.h < 24
  )

  // Urgency tone: warmer colour as time shrinks
  const isUrgent = timeLeft && timeLeft.h < 3

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          key="prep-banner"
          initial={{ opacity: 0, y: -12, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          style={{ overflow: 'hidden', marginBottom: 24 }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '14px 18px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderLeft: `3px solid ${isUrgent ? '#f59e0b' : pc}`,
            borderRadius: 'var(--r-lg)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Ambient glow */}
            <div aria-hidden style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: `radial-gradient(ellipse 60% 100% at 0% 50%, ${isUrgent ? '#f59e0b' : pc}0a 0%, transparent 70%)`,
            }} />

            {/* Vessel icon */}
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--r-md)',
              background: (isUrgent ? '#f59e0b' : pc) + '15',
              border: `1px solid ${isUrgent ? '#f59e0b' : pc}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={isUrgent ? '#f59e0b' : pc} strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17l1.5-9h15L21 17"/>
                <path d="M3 17c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4"/>
                <path d="M12 3v5"/>
                <path d="M8 8h8"/>
              </svg>
            </div>

            {/* Copy */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 12, fontWeight: 700,
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
                letterSpacing: '-.01em',
                marginBottom: 2,
              }}>
                {isUrgent
                  ? 'Vessel preparation begins very soon'
                  : 'Your vessel begins preparation shortly'}
              </p>
              <p style={{
                fontSize: 12, color: 'var(--text-muted)',
                lineHeight: 1.5, fontWeight: 300,
              }}>
                Finalise your selection to ensure everything is on board before departure.
              </p>
            </div>

            {/* Countdown */}
            <div style={{
              display: 'flex',
              gap: 6,
              alignItems: 'center',
              flexShrink: 0,
            }}>
              {[
                { val: pad(timeLeft.h),  unit: 'hr' },
                { val: pad(timeLeft.m),  unit: 'min' },
                { val: pad(timeLeft.s),  unit: 'sec' },
              ].map(({ val, unit }, i) => (
                <React.Fragment key={unit}>
                  {i > 0 && (
                    <span style={{
                      fontSize: 14, fontWeight: 700,
                      color: 'var(--text-muted)',
                      lineHeight: 1, alignSelf: 'flex-start',
                      paddingTop: 2,
                    }}>:</span>
                  )}
                  <div style={{ textAlign: 'center' }}>
                    <motion.div
                      key={val}
                      initial={{ y: -4, opacity: .6 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: .18 }}
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: 22,
                        color: isUrgent ? '#f59e0b' : pc,
                        letterSpacing: '-.02em',
                        lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                        minWidth: 30,
                        textAlign: 'center',
                      }}
                    >
                      {val}
                    </motion.div>
                    <div style={{
                      fontSize: 9, fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '.08em',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-display)',
                      marginTop: 2,
                    }}>
                      {unit}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
