import React from 'react'

export default function Spinner({ size = 20, color = '#475569' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `1.5px solid ${color}28`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin .65s linear infinite',
      flexShrink: 0,
    }} />
  )
}
