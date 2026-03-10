import React from 'react'

const presets = {
  popular:     { label: '★ Popular',      color: null,      bg: null,                         border: null },
  limited:     { label: '⚡ Limited',      color: '#f59e0b', bg: 'rgba(245,158,11,.12)',       border: 'rgba(245,158,11,.28)' },
  recommended: { label: '✦ Recommended',  color: '#a78bfa', bg: 'rgba(167,139,250,.12)',      border: 'rgba(167,139,250,.28)' },
}

export default function Badge({ type, primaryColor }) {
  const p = presets[type]
  if (!p) return null

  const useAccent = (type === 'popular' || type === 'recommended') && primaryColor
  const color  = useAccent ? primaryColor        : p.color
  const bg     = useAccent ? primaryColor + '1c' : p.bg
  const border = useAccent ? primaryColor + '38' : p.border

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px',
      borderRadius: 'var(--r-pill)',
      fontSize: 9.5, fontWeight: 700,
      fontFamily: 'var(--font-display)',
      textTransform: 'uppercase', letterSpacing: '.08em',
      background: bg, color, border: `1px solid ${border}`,
      backdropFilter: 'blur(8px)',
      whiteSpace: 'nowrap',
    }}>
      {p.label}
    </span>
  )
}
