import React from 'react'
import { motion } from 'framer-motion'

const STEPS = ['Review', 'Confirm', 'Payment']

export default function StepIndicator({ current, primaryColor }) {
  const pc = primaryColor || '#0ea5e9'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 0, padding: '20px 24px 0',
    }}>
      {STEPS.map((label, i) => {
        const done   = i < current
        const active = i === current

        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <motion.div
                animate={{
                  background: done || active ? pc : 'var(--bg-raised)',
                  borderColor: done || active ? pc : 'var(--border-soft)',
                  scale: active ? 1.1 : 1,
                }}
                transition={{ duration: .25 }}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: '2px solid var(--border-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {done ? (
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 5.5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
                    color: active ? '#fff' : 'var(--text-muted)',
                  }}>
                    {i + 1}
                  </span>
                )}
              </motion.div>

              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 500,
                fontFamily: 'var(--font-display)',
                letterSpacing: '.06em', textTransform: 'uppercase',
                color: active ? 'var(--text-primary)' : done ? pc : 'var(--text-muted)',
                transition: 'color .25s', whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 1, marginBottom: 22, margin: '0 6px 22px',
                background: 'var(--border-subtle)',
                position: 'relative', overflow: 'hidden', minWidth: 32,
              }}>
                <motion.div
                  animate={{ scaleX: done ? 1 : 0 }}
                  initial={{ scaleX: 0 }}
                  transition={{ duration: .35, ease: [.22,1,.36,1] }}
                  style={{
                    position: 'absolute', inset: 0, background: pc,
                    transformOrigin: 'left',
                  }}
                />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
