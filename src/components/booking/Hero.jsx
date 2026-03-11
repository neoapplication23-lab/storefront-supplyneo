import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Chip from '../ui/Chip'
import CountdownTimer from './CountdownTimer'

const ease = [.22, 1, .36, 1]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: .09, delayChildren: .1 } },
}
const line = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: .6, ease } },
}

export default function Hero({ data, departureTime }) {
  const pc   = data.appearance?.primaryColor || '#0ea5e9'
  const boat = data.boat?.boat_name || ''

  const chips = [
    boat          && { icon: '⛵', label: boat },
    data.date     && { icon: '📅', label: data.date },
    data.checkIn  && { icon: '🕐', label: `Check-in ${data.checkIn}` },
    data.marina   && { icon: '⚓', label: data.marina },
    data.berth    && { icon: '🪝', label: `Berth ${data.berth}` },
  ].filter(Boolean)

  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      minHeight: '62vh',
      display: 'flex',
      alignItems: 'flex-end',
      padding: 'clamp(56px,9vw,104px) clamp(20px,5vw,80px) clamp(52px,6vw,76px)',
    }}>
      {/* ── Layered background ── */}
      {/* Base */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'linear-gradient(168deg, #020609 0%, #04091a 45%, #030710 100%)',
      }} />

      {/* Primary glow — left, large */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: .85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease }}
        style={{
          position: 'absolute', zIndex: 0,
          top: '-10%', left: '-5%',
          width: '65%', height: '130%',
          background: `radial-gradient(ellipse at 30% 50%, ${pc}18 0%, transparent 68%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Secondary glow — bottom right */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, delay: .3, ease }}
        style={{
          position: 'absolute', zIndex: 0,
          bottom: '-20%', right: '-10%',
          width: '55%', height: '90%',
          background: `radial-gradient(ellipse at 70% 70%, ${pc}0e 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Grain texture overlay */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, zIndex: 0, opacity: .018, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '180px',
      }} />

      {/* Horizontal accent line at bottom */}
      <div aria-hidden style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, zIndex: 1,
        background: `linear-gradient(90deg, transparent 0%, ${pc}28 35%, ${pc}18 65%, transparent 100%)`,
      }} />

      {/* ── Content ── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        style={{ position: 'relative', zIndex: 2, maxWidth: 680, width: '100%' }}
      >
        {/* Eyebrow */}
        <motion.div variants={line} style={{
          display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24,
        }}>
          <div style={{ width: 24, height: 1, background: pc, opacity: .75 }} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 10, fontWeight: 600,
            letterSpacing: '.18em', textTransform: 'uppercase',
            color: pc, opacity: .9,
          }}>
            Your Water Toys Selection
          </span>
        </motion.div>

        {/* H1 — word by word depth */}
        <motion.h1
          variants={line}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(34px, 5.8vw, 62px)',
            lineHeight: 1.06,
            marginBottom: 22,
            color: 'var(--text-primary)',
            letterSpacing: '-.025em',
          }}
        >
          Hey{' '}
          <span style={{
            color: pc,
            position: 'relative',
            display: 'inline-block',
          }}>
            {(data.clientName || '').split(' ')[0]}
            {/* name underline glow */}
            <span style={{
              position: 'absolute', bottom: -3, left: 0, right: 0,
              height: 2, borderRadius: 1,
              background: `linear-gradient(90deg, ${pc}80, ${pc}20)`,
              pointerEvents: 'none',
            }} />
          </span>
          ,<br />
          <span style={{ color: 'var(--text-soft)', fontWeight: 500, fontSize: '0.82em', letterSpacing: '-.01em' }}>your water toys await.</span>
        </motion.h1>

        {/* Body */}
        <motion.p variants={line} style={{
          fontSize: 'clamp(14px, 1.8vw, 16px)',
          color: 'var(--text-soft)',
          lineHeight: 1.75,
          maxWidth: 400,
          marginBottom: 34,
          fontWeight: 300,
        }}>
          Curated exclusively for your time on{' '}
          <strong style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            {boat || 'your vessel'}
          </strong>.
          {' '}Select what you'd like — we take care of the rest.
        </motion.p>

        {/* Chips */}
        {chips.length > 0 && (
          <motion.div variants={line} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {chips.map((c, i) => (
              <Chip key={i} icon={c.icon} label={c.label} />
            ))}
          </motion.div>
        )}

        {/* Countdown timer — always visible when we have timing info */}
        {(departureTime || (data.date && data.checkIn)) && (
          <motion.div variants={line}>
            <CountdownTimer
              departureTime={departureTime}
              date={data.date}
              checkIn={data.checkIn}
              primaryColor={pc}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Decorative orb — top right, purely visual */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: .6 }}
        animate={{ opacity: .12, scale: 1 }}
        transition={{ duration: 2, delay: .5, ease }}
        className="animate-float"
        style={{
          position: 'absolute', top: '8%', right: '6%', zIndex: 1,
          width: 'clamp(120px, 18vw, 220px)',
          aspectRatio: '1',
          borderRadius: '50%',
          border: `1px solid ${pc}50`,
          boxShadow: `0 0 60px ${pc}20, inset 0 0 40px ${pc}10`,
          pointerEvents: 'none',
        }}
      />
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: .6 }}
        animate={{ opacity: .06, scale: 1 }}
        transition={{ duration: 2, delay: .7, ease }}
        style={{
          position: 'absolute', top: '12%', right: '9%', zIndex: 1,
          width: 'clamp(80px, 12vw, 150px)',
          aspectRatio: '1',
          borderRadius: '50%',
          border: `1px solid ${pc}30`,
          pointerEvents: 'none',
        }}
      />
    </section>
  )
}
