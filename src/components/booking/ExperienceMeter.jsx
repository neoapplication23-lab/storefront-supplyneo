import React, { useEffect, useRef } from 'react'
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion'

/**
 * ExperienceMeter
 *
 * Renders below the CartBar button as a secondary sub-row.
 * Frames cart total as experience completion — not spend targets.
 *
 * Default thresholds are configurable via props or data.thresholds from API.
 *
 * Visual: thin progress bar + qualitative label.
 * No numbers shown. No "spend X more". Purely aspirational framing.
 */

const DEFAULT_THRESHOLDS = [
  { value: 150,  label: 'Basic setup' },
  { value: 300,  label: 'Comfortable day on the water' },
  { value: 500,  label: 'Full charter experience' },
  { value: 750,  label: 'Complete concierge selection ✓' },
]

export default function ExperienceMeter({ total = 0, primaryColor, thresholds }) {
  const pc = primaryColor || '#0ea5e9'
  const levels = thresholds?.length ? thresholds : DEFAULT_THRESHOLDS
  const maxValue = levels[levels.length - 1].value

  // Which threshold are we at or past?
  const currentLevel = levels.reduce((found, t) => total >= t.value ? t : found, null)
  const nextLevel = levels.find(t => total < t.value) || null

  // Progress within the current segment
  const prevThresholdValue = currentLevel ? currentLevel.value : 0
  const nextThresholdValue = nextLevel ? nextLevel.value : maxValue
  const segmentProgress = nextLevel
    ? (total - prevThresholdValue) / (nextThresholdValue - prevThresholdValue)
    : 1

  // Overall bar progress (0–1) for the full track
  const overallProgress = Math.min(total / maxValue, 1)

  // Spring-animated bar width
  const spring = useSpring(overallProgress, { stiffness: 80, damping: 18 })
  useEffect(() => { spring.set(overallProgress) }, [overallProgress, spring])
  const barWidth = useTransform(spring, v => `${(v * 100).toFixed(2)}%`)

  // Completion celebration
  const isComplete = total >= maxValue

  if (total <= 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: .28, ease: [.22, 1, .36, 1] }}
      style={{
        paddingTop: 10,
        paddingLeft: 4,
        paddingRight: 4,
      }}
    >
      {/* Label row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
      }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={currentLevel?.label || 'start'}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: .22 }}
            style={{
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              color: isComplete ? pc : 'var(--text-soft)',
              letterSpacing: '.02em',
            }}
          >
            {isComplete
              ? currentLevel?.label
              : currentLevel
                ? currentLevel.label
                : 'Start your selection'}
          </motion.span>
        </AnimatePresence>

        <AnimatePresence>
          {!isComplete && nextLevel && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-display)',
                letterSpacing: '.02em',
              }}
            >
              → {nextLevel.label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Progress track */}
      <div style={{
        height: 3,
        borderRadius: 99,
        background: 'rgba(255,255,255,.07)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <motion.div
          style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: barWidth,
            background: isComplete
              ? `linear-gradient(90deg, ${pc}, ${pc}cc)`
              : `linear-gradient(90deg, ${pc}cc, ${pc})`,
            borderRadius: 99,
          }}
        />

        {/* Threshold tick marks */}
        {levels.slice(0, -1).map((t) => {
          const pct = (t.value / maxValue) * 100
          const passed = total >= t.value
          return (
            <div
              key={t.value}
              style={{
                position: 'absolute',
                top: 0, bottom: 0,
                left: `${pct}%`,
                width: 1.5,
                background: passed ? pc + '80' : 'rgba(255,255,255,.12)',
                transform: 'translateX(-50%)',
              }}
            />
          )
        })}
      </div>

      {/* Completion glow flash */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: .6, scaleX: 0 }}
            animate={{ opacity: 0, scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .7, ease: [.22, 1, .36, 1] }}
            style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              height: 3,
              background: `linear-gradient(90deg, transparent, ${pc}, transparent)`,
              borderRadius: 99,
              transformOrigin: 'center',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
