import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─────────────────────────────────────────────────────────────────
   FormSection — reusable form primitives for CheckoutDrawer
   
   Changes in Sprint 2:
   - Input: onBlur validation trigger + inline success state
   - FieldGroup: animated error entrance + shake on error
   - Textarea: same focus/blur visual treatment as Input
   - CardFieldMock: unchanged
   - SectionDivider: unchanged
───────────────────────────────────────────────────────────────── */

// Shake keyframes injected once
if (typeof document !== 'undefined' && !document.getElementById('form-shake-style')) {
  const s = document.createElement('style')
  s.id = 'form-shake-style'
  s.textContent = `
    @keyframes fieldShake {
      0%   { transform: translateX(0) }
      15%  { transform: translateX(-5px) }
      35%  { transform: translateX(5px) }
      55%  { transform: translateX(-4px) }
      72%  { transform: translateX(4px) }
      88%  { transform: translateX(-2px) }
      100% { transform: translateX(0) }
    }
    .field-shake { animation: fieldShake 320ms cubic-bezier(.36,.07,.19,.97) both; }
  `
  document.head.appendChild(s)
}

export function FieldGroup({ label, error, children, required }) {
  const shakeKey = useRef(0)
  const prevError = useRef(null)

  // Increment shakeKey each time a NEW error appears
  if (error && error !== prevError.current) {
    shakeKey.current++
  }
  prevError.current = error

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: '.09em',
          textTransform: 'uppercase', fontFamily: 'var(--font-display)',
          color: error ? '#f87171' : 'var(--text-muted)',
          transition: 'color 150ms',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {label}
          {required && (
            <span style={{ color: '#f87171', fontSize: 10 }}>*</span>
          )}
        </label>
      )}

      {/* Shake wrapper */}
      <div
        key={shakeKey.current > 0 ? `shake-${shakeKey.current}` : 'normal'}
        className={shakeKey.current > 0 ? 'field-shake' : ''}
      >
        {children}
      </div>

      {/* Animated error message */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.span
            key={error}
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: .18 }}
            style={{
              fontSize: 11.5, color: '#f87171', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 5,
              overflow: 'hidden',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="5" cy="5" r="4.5" stroke="#f87171" strokeWidth="1"/>
              <path d="M5 3v2.5M5 6.5v.5" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Input({
  value, onChange, onBlur,
  placeholder, type = 'text',
  hasError, isValid, disabled,
}) {
  const [focused, setFocused] = useState(false)

  const borderColor = hasError
    ? 'rgba(248,113,113,.6)'
    : isValid
      ? 'rgba(16,185,129,.5)'
      : focused
        ? 'var(--border-hover)'
        : 'var(--border-soft)'

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={e => { setFocused(false); onBlur?.(e.target.value) }}
        style={{
          width: '100%', height: 44,
          background: 'var(--bg-raised)',
          border: `1px solid ${borderColor}`,
          borderRadius: 'var(--r-md)',
          padding: '0 14px',
          paddingRight: isValid || hasError ? 38 : 14,
          fontSize: 14, color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          outline: 'none',
          transition: 'border-color 180ms ease',
          opacity: disabled ? .45 : 1,
        }}
      />

      {/* Inline validity icon */}
      <AnimatePresence>
        {(isValid || hasError) && (
          <motion.div
            initial={{ opacity: 0, scale: .7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: .7 }}
            transition={{ duration: .18 }}
            style={{
              position: 'absolute', right: 12, top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          >
            {isValid ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" fill="rgba(16,185,129,.15)" stroke="rgba(16,185,129,.5)" strokeWidth="1"/>
                <path d="M4.5 7l2 2 3.5-3.5" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" fill="rgba(248,113,113,.12)" stroke="rgba(248,113,113,.5)" strokeWidth="1"/>
                <path d="M5 5l4 4M9 5l-4 4" stroke="#f87171" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Textarea({ value, onChange, onBlur, placeholder, rows = 3, disabled }) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={e => { setFocused(false); onBlur?.(e.target.value) }}
      style={{
        width: '100%',
        background: 'var(--bg-raised)',
        border: `1px solid ${focused ? 'var(--border-hover)' : 'var(--border-soft)'}`,
        borderRadius: 'var(--r-md)',
        padding: '10px 14px', fontSize: 14,
        color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
        outline: 'none', resize: 'vertical',
        transition: 'border-color 180ms ease',
        lineHeight: 1.6, opacity: disabled ? .45 : 1,
      }}
    />
  )
}

export function SectionDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
      {label && (
        <span style={{
          fontSize: 9.5, fontWeight: 700, letterSpacing: '.1em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          fontFamily: 'var(--font-display)', whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
    </div>
  )
}

export function CardFieldMock({ label, placeholder, icon, disabled }) {
  return (
    <div style={{
      height: 44,
      background: 'var(--bg-raised)',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-md)',
      padding: '0 14px',
      display: 'flex', alignItems: 'center', gap: 10,
      opacity: disabled ? .45 : 1,
    }}>
      {icon && <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>}
      <span style={{ fontSize: 13.5, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
        {placeholder}
      </span>
    </div>
  )
}
