import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * StripePaymentForm
 *
 * Renders a real Stripe Payment Element inside the checkout drawer Step 2.
 * Loads Stripe.js from CDN (no npm package needed), mounts the Element,
 * and exposes a `submit(returnUrl)` method via the `onReady` callback.
 *
 * Props:
 *   clientSecret  — from the PaymentIntent created on your server
 *   publishableKey — your Stripe publishable key (pk_live_... or pk_test_...)
 *   primaryColor  — accent color for the theme
 *   submitError   — external error string to display
 *   onReady(submitFn) — called when the element is mounted; submitFn(returnUrl) triggers confirmPayment
 */
export default function StripePaymentForm({
  clientSecret,
  publishableKey,
  primaryColor,
  submitError,
  onReady,
  form,
  cartLines,
  cartTotal,
  boatName,
  departureDate,
  formatPrice,
}) {
  const pc = primaryColor || '#0ea5e9'
  const mountRef        = useRef(null)
  const stripeRef       = useRef(null)
  const elementsRef     = useRef(null)
  const paymentElRef    = useRef(null)
  const [ready, setReady]   = useState(false)
  const [loadErr, setLoadErr] = useState(null)

  // ── Load Stripe.js and mount the Element ───────────────────────
  useEffect(() => {
    if (!clientSecret || !publishableKey) return
    let destroyed = false

    async function init() {
      try {
        // Load Stripe.js from CDN if not already present
        if (!window.Stripe) {
          await loadScript('https://js.stripe.com/v3/')
        }

        if (destroyed) return

        const stripe = window.Stripe(publishableKey)
        stripeRef.current = stripe

        // Appearance tweaked to match the app's dark theme
        const appearance = {
          theme: 'night',
          variables: {
            colorPrimary: pc,
            colorBackground: 'var(--bg-raised)',
            colorText: 'var(--text-primary)',
            colorDanger: '#f87171',
            fontFamily: 'var(--font-display), system-ui, sans-serif',
            borderRadius: '10px',
            fontSizeBase: '14px',
          },
          rules: {
            '.Input': {
              boxShadow: 'none',
              border: '1px solid var(--border-soft)',
              backgroundColor: 'var(--bg-raised)',
            },
            '.Input:focus': {
              border: `1px solid ${pc}`,
              boxShadow: `0 0 0 3px ${pc}22`,
            },
            '.Label': {
              fontSize: '10.5px',
              fontWeight: '700',
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            },
          },
        }

        const elements = stripe.elements({ clientSecret, appearance })
        elementsRef.current = elements

        const paymentElement = elements.create('payment', {
          layout: { type: 'tabs', defaultCollapsed: false },
        })
        paymentElRef.current = paymentElement
        paymentElement.mount(mountRef.current)

        paymentElement.on('ready', () => {
          if (!destroyed) {
            setReady(true)
            // Expose the submit function to the parent
            if (onReady) {
              onReady(async (returnUrl) => {
                const { error } = await stripe.confirmPayment({
                  elements,
                  confirmParams: {
                    return_url: returnUrl || window.location.href,
                    receipt_email: form?.email,
                  },
                  redirect: 'if_required',
                })
                if (error) throw new Error(error.message)
              })
            }
          }
        })
      } catch (e) {
        if (!destroyed) setLoadErr(e.message || 'Failed to load Stripe')
      }
    }

    init()
    return () => {
      destroyed = true
      paymentElRef.current?.destroy()
      paymentElRef.current = null
    }
  }, [clientSecret, publishableKey])

  return (
    <>
      {/* Vessel echo */}
      {(boatName || departureDate) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          background: pc + '0a', border: `1px solid ${pc}20`,
          borderRadius: 'var(--r-md)',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke={pc} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17l1.5-9h15L21 17"/>
            <path d="M3 17c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4"/>
            <path d="M12 3v5"/><path d="M8 8h8"/>
          </svg>
          <span style={{ fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.4 }}>
            {boatName && <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{boatName}</strong>}
            {boatName && departureDate && ' · '}
            {departureDate && <span>{departureDate}</span>}
          </span>
        </div>
      )}

      {/* Order summary */}
      <div style={{
        background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-lg)', padding: '14px 18px',
        display: 'flex', flexDirection: 'column', gap: 7,
      }}>
        <p style={{
          fontSize: 9.5, fontWeight: 700, letterSpacing: '.1em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          fontFamily: 'var(--font-display)',
        }}>
          Order summary
        </p>
        {cartLines.map(({ product: p, qty }) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-soft)' }}>{p.name} × {qty}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {formatPrice(parseFloat(p.price) * qty)}
            </span>
          </div>
        ))}
        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '3px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Total</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: pc, fontFamily: 'var(--font-display)', letterSpacing: '-.02em' }}>
            {formatPrice(cartTotal)}
          </span>
        </div>
      </div>

      {/* ── Stripe Element ── */}
      <div>
        <p style={{
          fontSize: 9.5, fontWeight: 700, letterSpacing: '.1em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          fontFamily: 'var(--font-display)', marginBottom: 12,
        }}>
          Payment details
        </p>

        {loadErr ? (
          <div style={{
            padding: '12px 14px', borderRadius: 'var(--r-md)',
            background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)',
            color: '#f87171', fontSize: 13,
          }}>
            ⚠️ {loadErr}
          </div>
        ) : (
          <div style={{ position: 'relative', minHeight: 160 }}>
            {/* Skeleton shimmer while loading */}
            {!ready && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                {[80, 50].map((h, i) => (
                  <div key={i} style={{
                    height: h, borderRadius: 10,
                    background: 'var(--bg-raised)',
                    animation: 'pulse 1.4s ease-in-out infinite',
                    animationDelay: `${i * 0.15}s`,
                  }} />
                ))}
              </div>
            )}
            {/* Stripe mounts here */}
            <div
              ref={mountRef}
              style={{
                opacity: ready ? 1 : 0,
                transition: 'opacity 300ms',
              }}
            />
          </div>
        )}

        {/* Trust signals */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
          marginTop: 14, padding: '10px 12px',
          background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-md)',
        }}>
          {[
            { icon: '🔒', text: 'SSL encrypted' },
            { icon: '💳', text: 'Powered by Stripe' },
            { icon: '🛡️', text: 'PCI compliant' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 11 }}>{icon}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation email echo */}
      {form?.email && (
        <div style={{
          padding: '11px 14px',
          background: pc + '0d', border: `1px solid ${pc}20`,
          borderRadius: 'var(--r-md)',
          fontSize: 12.5, color: 'var(--text-soft)', lineHeight: 1.6,
        }}>
          Confirmation will be sent to{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{form.email}</strong>
        </div>
      )}

      {/* External submit error */}
      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px',
              background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)',
              borderRadius: 'var(--r-md)', color: '#f87171', fontSize: 13, fontWeight: 500,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {submitError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse keyframe */}
      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.7} }`}</style>
    </>
  )
}

// ── Helper: dynamically load a script ────────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload  = resolve
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}
