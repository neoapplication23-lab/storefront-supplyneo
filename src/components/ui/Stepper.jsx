import React from 'react'

export default function Stepper({ qty, onAdd, onRemove, primaryColor }) {
  const pc = primaryColor || '#0ea5e9'

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 0,
      background: 'rgba(255,255,255,.05)',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-pill)',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <StepBtn onClick={onRemove} label="−" />
      <span style={{
        minWidth: 32, textAlign: 'center',
        fontFamily: 'var(--font-display)',
        fontWeight: 700, fontSize: 14,
        color: 'var(--text-primary)',
        userSelect: 'none',
        letterSpacing: '.02em',
      }}>
        {qty}
      </span>
      <StepBtn onClick={onAdd} label="+" />
    </div>
  )
}

function StepBtn({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 34, height: 34,
        border: 'none',
        background: 'transparent',
        color: 'var(--text-secondary)',
        fontSize: 16, fontWeight: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 150ms ease, color 150ms ease',
        flexShrink: 0,
        lineHeight: 1,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,.08)'
        e.currentTarget.style.color = 'var(--text-primary)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'var(--text-secondary)'
      }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(.88)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {label}
    </button>
  )
}
