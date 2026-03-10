import React, { useRef } from 'react'
import useScrollSpy from '../../hooks/useScrollSpy'

export default function CategoryNav({ categories, sectionIds, primaryColor }) {
  const pc     = primaryColor || '#0ea5e9'
  const active = useScrollSpy(sectionIds, 120)
  const navRef = useRef(null)

  function scrollTo(id, idx) {
    const el = document.getElementById(id)
    if (!el) return
    const offset = 64 + 48
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'smooth',
    })

    // Keep active tab visible in the nav
    const btn = navRef.current?.children[idx]
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  return (
    <nav style={{
      position: 'sticky', top: 64, zIndex: 'var(--z-catnav)',
      background: 'rgba(4,8,15,.90)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div
        ref={navRef}
        className="no-scrollbar"
        style={{
          display: 'flex',
          overflowX: 'auto',
          padding: '0 clamp(16px, 4vw, 32px)',
          gap: 2,
        }}
      >
        {categories.map((cat, i) => {
          const isActive = active === sectionIds[i]
          return (
            <button
              key={cat}
              onClick={() => scrollTo(sectionIds[i], i)}
              style={{
                flexShrink: 0,
                position: 'relative',
                padding: '0 16px',
                height: 48,
                border: 'none',
                background: 'transparent',
                fontFamily: 'var(--font-display)',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '.01em',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 200ms ease',
                outline: 'none',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-soft)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              {cat}
              {/* Active underline */}
              <span style={{
                position: 'absolute', bottom: 0, left: '50%',
                transform: 'translateX(-50%)',
                height: 2, borderRadius: '2px 2px 0 0',
                width: isActive ? '80%' : '0%',
                background: pc,
                transition: 'width 250ms cubic-bezier(.22,1,.36,1)',
                display: 'block',
              }} />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
