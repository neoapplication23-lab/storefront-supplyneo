import React from 'react'

export default function NotFound({ message }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-base)',
    }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🌊</div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 22, color: 'var(--text-primary)', marginBottom: 8,
        }}>
          Link not found
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {message || 'This booking link may have expired or been removed.'}
        </p>
      </div>
    </div>
  )
}
