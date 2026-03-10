import React from 'react'

export default function Topbar({ appearance, cartCount, cartTotal }) {
  const pc      = appearance?.primaryColor || '#0ea5e9'
  const bizName = appearance?.businessName || ''
  const logo    = appearance?.logo || ''

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 'var(--z-topbar)',
      height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 clamp(16px, 4vw, 32px)',
      background: 'rgba(4,8,15,.82)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {logo && (
          <img
            src={logo} alt={bizName}
            style={{ height: 28, objectFit: 'contain' }}
            onError={e => e.currentTarget.style.display = 'none'}
          />
        )}
        {bizName && (
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: 15,
            letterSpacing: '.02em',
            color: 'var(--text-primary)',
          }}>
            {bizName}
          </span>
        )}
      </div>

      {/* Cart indicator pill */}
      <div style={{
        height: 36,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 14px',
        borderRadius: 'var(--r-pill)',
        background: cartCount > 0 ? pc + '14' : 'transparent',
        border: `1px solid ${cartCount > 0 ? pc + '28' : 'var(--border-subtle)'}`,
        transition: 'background 300ms ease, border-color 300ms ease',
        cursor: 'default',
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={cartCount > 0 ? pc : 'var(--text-muted)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 300ms ease', flexShrink: 0 }}>
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        {cartCount > 0 ? (
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: 13,
            color: pc,
            whiteSpace: 'nowrap',
          }}>
            {cartCount} · €{cartTotal.toFixed(2)}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            Empty
          </span>
        )}
      </div>
    </header>
  )
}
