import React from 'react'

export default function Chip({ icon, label }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgba(255,255,255,.055)',
      border: '1px solid rgba(255,255,255,.09)',
      borderRadius: 'var(--r-pill)',
      padding: '6px 13px',
      fontSize: 12, fontWeight: 500,
      color: 'var(--text-secondary)',
      whiteSpace: 'nowrap',
      backdropFilter: 'blur(8px)',
      letterSpacing: '.01em',
    }}>
      {icon && <span style={{ fontSize: 12, opacity: .8 }}>{icon}</span>}
      <span>{label}</span>
    </div>
  )
}
