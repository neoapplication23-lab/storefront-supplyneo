import React, { useRef, useState } from 'react'

export default function CategoryNav({ collections = [], sectionIds, primaryColor, onFilterChange, activeFilter, products = [] }) {
  const pc     = primaryColor || '#0ea5e9'
  const navRef = useRef(null)

  function handleClick(col, idx) {
    if (col === null) {
      onFilterChange(null)
    } else {
      onFilterChange(col.name)
      const sectionIdx = collections.indexOf(col)
      const el = document.getElementById(sectionIds[sectionIdx])
      if (el) {
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - (64 + 48),
          behavior: 'smooth',
        })
      }
    }
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
          padding: '10px clamp(16px, 4vw, 32px)',
          gap: 8,
        }}
      >
        {/* All pill */}
        {[null, ...collections].map((col, i) => {
          const isAll = col === null
          const isActive = isAll ? activeFilter === null : activeFilter === col.name
          const count = isAll ? products.length : (col.productIds?.filter(pid => products.find(p => p.id === pid)).length || 0)
          const label = isAll ? `🌊 All (${count})` : `${col.name} (${count})`
          return (
            <button
              key={isAll ? 'all' : col.id}
              onClick={() => handleClick(col, i)}
              style={{
                flexShrink: 0,
                padding: '7px 16px',
                borderRadius: 99,
                border: `1px solid ${isActive ? pc : 'rgba(255,255,255,.12)'}`,
                background: isActive ? pc + '18' : 'transparent',
                fontFamily: 'var(--font-display)',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '.01em',
                color: isActive ? pc : 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 200ms ease',
                outline: 'none',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = pc + '50'; e.currentTarget.style.color = 'var(--text-soft)' }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'; e.currentTarget.style.color = 'var(--text-muted)' }}}
            >
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
