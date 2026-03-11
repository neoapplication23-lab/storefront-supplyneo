import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StepIndicator from './StepIndicator'
import { FieldGroup, Input, Textarea, CardFieldMock } from './FormSection'
import Stepper from '../ui/Stepper'
import Spinner from '../ui/Spinner'
import UpsellRow from '../booking/UpsellRow'
import StripePaymentForm from './StripePaymentForm'
import useUpsell from '../../hooks/useUpsell'
import useStripePayment from '../../hooks/useStripePayment'
import { formatPrice } from '../../utils/money'
import { isValidImageSrc } from '../../utils/image'

const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
const ease = [.22, 1, .36, 1]

const slideVariants = {
  enter: dir => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  dir => ({ x: dir > 0 ? -56 : 56, opacity: 0 }),
}

// Country list (common + full)
const COUNTRIES = [
  'Spain', 'France', 'Italy', 'Germany', 'United Kingdom', 'Portugal',
  'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway',
  'Denmark', 'Finland', 'Greece', 'Croatia', 'Malta', 'Cyprus',
  'United States', 'Canada', 'Australia', 'New Zealand',
  'Brazil', 'Argentina', 'Mexico', 'Colombia',
  'China', 'Japan', 'South Korea', 'India', 'Singapore',
  'United Arab Emirates', 'Saudi Arabia', 'Qatar',
  'South Africa', 'Morocco', 'Egypt',
  'Russia', 'Turkey', 'Israel',
  'Other',
]

export default function CheckoutDrawer({
  open, onClose,
  products, items, primaryColor,
  onAdd, onRemove,
  onSubmit,
  clientName,
  boatName = '',
  departureDate = '',
  previousOrders = [],
}) {
  const pc = primaryColor || '#0ea5e9'

  const [step, setStep]         = useState(0)
  const [dir, setDir]           = useState(1)
  const [loading, setLoading]   = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [paymentDone, setPaymentDone] = useState(false)   // ← must pay before confirm

  const stripeSubmitRef = useRef(null)

  const emptyForm = {
    name:      clientName || '',
    address:   '',
    zipcode:   '',
    country:   '',
    idNumber:  '',
    contact:   '',           // email OR phone
    notes:     '',
  }

  const [form, setForm]       = useState(emptyForm)
  const [errors, setErrors]   = useState({})
  const [touched, setTouched] = useState({})

  // Scroll lock
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // ESC
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape' && open) onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [open, onClose])

  // Reset on open — but pre-fill name from client
  useEffect(() => {
    if (open) {
      setStep(0); setDir(1)
      setSubmitError(''); setErrors({}); setTouched({})
      setPaymentDone(false)
      setForm({ ...emptyForm, name: clientName || '' })
    }
  }, [open])

  // Derived
  const cartLines = Object.entries(items)
    .map(([id, qty]) => ({ product: products.find(p => String(p.id) === id), qty }))
    .filter(l => l.product && l.qty > 0)
  const cartTotal = cartLines.reduce((s, l) => s + parseFloat(l.product.price) * l.qty, 0)
  const cartCount = cartLines.reduce((s, l) => s + l.qty, 0)

  const upsellSuggestions = useUpsell(items, products, 4)

  const { clientSecret, loading: stripeLoading, error: stripeInitError } = useStripePayment({
    amount: cartTotal,
    currency: 'eur',
    enabled: step === 2,
  })

  // ── Validation ──────────────────────────────────────────────
  function validateField(key, value) {
    const v = (value || '').trim()
    if (key === 'name')    return v ? '' : 'Full name is required'
    if (key === 'address') return v ? '' : 'Address is required'
    if (key === 'zipcode') return v ? '' : 'ZIP / Postal code is required'
    if (key === 'country') return v ? '' : 'Country is required'
    if (key === 'idNumber') return v ? '' : 'ID or Passport number is required'
    if (key === 'contact') {
      if (!v) return 'Email or phone number is required'
      const isEmail = /\S+@\S+\.\S+/.test(v)
      const isPhone = /^[+\d][\d\s\-().]{6,}$/.test(v)
      return (isEmail || isPhone) ? '' : 'Enter a valid email or phone number'
    }
    return ''
  }

  const requiredFields = ['name', 'address', 'zipcode', 'country', 'idNumber', 'contact']

  function handleBlur(key, value) {
    setTouched(t => ({ ...t, [key]: true }))
    const err = validateField(key, value)
    setErrors(e => ({ ...e, [key]: err }))
  }

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
    if (touched[key]) {
      setErrors(e => ({ ...e, [key]: validateField(key, value) }))
    }
  }

  function validateAll() {
    const newErrors = {}
    const newTouched = {}
    requiredFields.forEach(k => {
      newTouched[k] = true
      newErrors[k] = validateField(k, form[k])
    })
    setTouched(newTouched)
    setErrors(newErrors)
    return requiredFields.every(k => !newErrors[k])
  }

  function goTo(next) {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  async function handleSubmit() {
    // Guard: must have paid
    if (!paymentDone && STRIPE_PK) {
      setSubmitError('Please complete payment before confirming your order.')
      return
    }
    setSubmitError('')
    setLoading(true)
    try {
      if (STRIPE_PK && stripeSubmitRef.current && !paymentDone) {
        await stripeSubmitRef.current(window.location.href)
        setPaymentDone(true)
      }
      await onSubmit({ form, cartLines, cartTotal })
      onClose()
    } catch (e) {
      setSubmitError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Buttons — rendered as elements, not nested components ──
  function renderPrimaryBtn(onClick, disabled, children) {
    return (
      <motion.button
        whileTap={{ scale: .98 }}
        onClick={onClick}
        disabled={disabled || loading}
        style={{
          flex: 1, height: 50, border: 'none',
          borderRadius: 'var(--r-xl)',
          background: disabled || loading ? 'var(--bg-raised)' : `linear-gradient(135deg, ${pc}, ${pc}cc)`,
          color: disabled || loading ? 'var(--text-muted)' : '#fff',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
          letterSpacing: '.01em',
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          boxShadow: disabled || loading ? 'none' : `0 4px 20px ${pc}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background 200ms, box-shadow 200ms, color 200ms',
        }}
      >
        {loading ? <Spinner size={18} color="rgba(255,255,255,.7)" /> : children}
      </motion.button>
    )
  }

  function renderGhostBtn(onClick, children) {
    return (
      <button
        onClick={onClick}
        style={{
          height: 50, paddingLeft: 20, paddingRight: 20,
          border: '1px solid var(--border-soft)', borderRadius: 'var(--r-xl)',
          background: 'transparent', color: 'var(--text-soft)',
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
          cursor: 'pointer', transition: 'border-color 150ms, color 150ms', flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-soft)'; e.currentTarget.style.color = 'var(--text-soft)' }}
      >
        {children}
      </button>
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="co-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .22 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 500,
              background: 'rgba(2,5,12,.78)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            }}
          />

          {/* Drawer */}
          <motion.div
            key="co-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 501,
              width: '100%', maxWidth: 480,
              background: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border-subtle)',
              display: 'flex', flexDirection: 'column',
              boxShadow: '-16px 0 64px rgba(0,0,0,.5)',
            }}
          >
            {/* ── Header ── */}
            <div style={{
              padding: '18px 22px 0',
              borderBottom: '1px solid var(--border-subtle)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div>
                  <h2 style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
                    color: 'var(--text-primary)', letterSpacing: '-.01em',
                  }}>
                    Checkout
                  </h2>
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}
                      >
                        {cartCount} item{cartCount !== 1 ? 's' : ''} · {formatPrice(cartTotal)}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={onClose}
                  style={{
                    width: 30, height: 30, borderRadius: '50%',
                    border: '1px solid var(--border-soft)', background: 'var(--bg-raised)',
                    color: 'var(--text-muted)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'background 150ms, color 150ms',
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              <StepIndicator current={step} primaryColor={pc} />
            </div>

            {/* ── Step content ── */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={step}
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: .26, ease }}
                  style={{
                    position: 'absolute', inset: 0,
                    overflowY: 'auto', padding: '22px 22px 8px',
                    display: 'flex', flexDirection: 'column', gap: 20,
                  }}
                  className="no-scrollbar"
                >
                  {step === 0 && (
                    <StepReview
                      cartLines={cartLines} cartTotal={cartTotal} pc={pc}
                      onAdd={onAdd} onRemove={onRemove}
                      upsellSuggestions={upsellSuggestions}
                      cartItems={items}
                      previousOrders={previousOrders}
                    />
                  )}
                  {step === 1 && (
                    <StepConfirm
                      form={form} setField={setField}
                      errors={errors} touched={touched}
                      handleBlur={handleBlur} pc={pc}
                    />
                  )}
                  {step === 2 && (
                    STRIPE_PK ? (
                      clientSecret ? (
                        <StripePaymentForm
                          clientSecret={clientSecret}
                          publishableKey={STRIPE_PK}
                          primaryColor={pc}
                          submitError={submitError}
                          onReady={fn => { stripeSubmitRef.current = fn }}
                          onPaymentSuccess={() => setPaymentDone(true)}
                          form={form}
                          cartLines={cartLines}
                          cartTotal={cartTotal}
                          boatName={boatName}
                          departureDate={departureDate}
                          formatPrice={formatPrice}
                        />
                      ) : stripeInitError ? (
                        <StepPayment
                          form={form} cartLines={cartLines} cartTotal={cartTotal}
                          pc={pc} submitError={stripeInitError}
                          boatName={boatName} departureDate={departureDate}
                          paymentDone={paymentDone}
                          onPaymentDone={() => setPaymentDone(true)}
                        />
                      ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 13 }}>
                          <Spinner size={18} color={pc} /> Preparing secure payment…
                        </div>
                      )
                    ) : (
                      <StepPayment
                        form={form} cartLines={cartLines} cartTotal={cartTotal}
                        pc={pc} submitError={submitError}
                        boatName={boatName} departureDate={departureDate}
                        paymentDone={paymentDone}
                        onPaymentDone={() => setPaymentDone(true)}
                      />
                    )
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Footer ── */}
            <div style={{
              padding: '14px 22px 28px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex', gap: 10, flexShrink: 0,
              background: 'var(--bg-surface)',
              flexDirection: 'column',
            }}>
              {/* Payment required warning */}
              {step === 2 && !paymentDone && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 12px',
                    background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.25)',
                    borderRadius: 'var(--r-md)',
                    fontSize: 12, color: '#f59e0b',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Complete payment above to confirm your order
                </motion.div>
              )}
              {step === 2 && paymentDone && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 12px',
                    background: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.25)',
                    borderRadius: 'var(--r-md)',
                    fontSize: 12, color: '#10b981',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Payment confirmed — tap below to finalise your order
                </motion.div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                {step === 0 && (
                  <>
                    {renderGhostBtn(onClose, 'Cancel')}
                    {renderPrimaryBtn(() => goTo(1), cartCount === 0, 'Continue →')}
                  </>
                )}
                {step === 1 && (
                  <>
                    {renderGhostBtn(() => goTo(0), '← Back')}
                    {renderPrimaryBtn(() => { if (validateAll()) goTo(2) }, false, 'Continue →')}
                  </>
                )}
                {step === 2 && (
                  <>
                    {renderGhostBtn(() => goTo(1), '← Back')}
                    {renderPrimaryBtn(handleSubmit, !paymentDone && !!STRIPE_PK, loading ? 'Confirming…' : 'Confirm My Order')}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ─────────────────────────────────────────
   Step 0 — Review cart
───────────────────────────────────────── */
function StepReview({ cartLines, cartTotal, pc, onAdd, onRemove, upsellSuggestions, cartItems, previousOrders }) {
  if (cartLines.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 12, paddingTop: 40,
      }}>
        <span style={{ fontSize: 40 }}>🛒</span>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>
          Your selection is empty.<br />Add items to continue.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Previous order badge */}
      {previousOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '9px 14px',
            background: `${pc}0d`,
            border: `1px solid ${pc}20`,
            borderRadius: 'var(--r-md)',
            fontSize: 12.5, color: 'var(--text-soft)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <span>🔁</span>
          <span>
            You've placed {previousOrders.length} order{previousOrders.length > 1 ? 's' : ''} before —
            {' '}<strong style={{ color: 'var(--text-primary)' }}>this will create a new separate order.</strong>
          </span>
        </motion.div>
      )}

      <p style={{
        fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        fontFamily: 'var(--font-display)',
      }}>
        {cartLines.reduce((s, l) => s + l.qty, 0)} items selected
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {cartLines.map(({ product: p, qty }) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 13,
            padding: '11px 0',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--r-md)',
              background: 'var(--bg-raised)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0, overflow: 'hidden',
            }}>
              {isValidImageSrc(p.image_url)
                ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (p.emoji || '📦')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13.5,
                color: 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {p.name}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {formatPrice(p.price)} each
              </p>
            </div>
            <Stepper qty={qty} onAdd={() => onAdd(p.id)} onRemove={() => onRemove(p.id)} primaryColor={pc} />
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5,
              color: 'var(--text-primary)', minWidth: 56, textAlign: 'right', flexShrink: 0,
            }}>
              {formatPrice(parseFloat(p.price) * qty)}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-lg)', padding: '13px 17px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Total</span>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22,
          color: pc, letterSpacing: '-.02em',
        }}>
          {formatPrice(cartTotal)}
        </span>
      </div>

      {upsellSuggestions.length > 0 && (
        <>
          <div style={{ height: 1, background: 'var(--border-subtle)' }} />
          <UpsellRow
            suggestions={upsellSuggestions}
            primaryColor={pc}
            onAdd={id => onAdd(id)}
            cartItems={cartItems}
            compact={true}
            label="You might also want…"
          />
        </>
      )}
    </>
  )
}

/* ─────────────────────────────────────────
   Step 1 — Shipping / identity details
───────────────────────────────────────── */
function StepConfirm({ form, setField, errors, touched, handleBlur, pc }) {
  return (
    <>
      <div>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
          color: 'var(--text-primary)', marginBottom: 4,
        }}>
          Your details
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Required for customs clearance and delivery to your vessel.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Full name */}
        <FieldGroup label="Full name" error={errors.name} required>
          <Input
            value={form.name}
            onChange={v => setField('name', v)}
            onBlur={v => handleBlur('name', v)}
            placeholder="e.g. James Harrington"
            hasError={!!errors.name}
            isValid={!!(touched.name && !errors.name && form.name.trim())}
          />
        </FieldGroup>

        {/* Address */}
        <FieldGroup label="Address" error={errors.address} required>
          <Input
            value={form.address}
            onChange={v => setField('address', v)}
            onBlur={v => handleBlur('address', v)}
            placeholder="Street address, apartment, suite…"
            hasError={!!errors.address}
            isValid={!!(touched.address && !errors.address && form.address.trim())}
          />
        </FieldGroup>

        {/* ZIP + Country row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 12 }}>
          <FieldGroup label="ZIP / Postal code" error={errors.zipcode} required>
            <Input
              value={form.zipcode}
              onChange={v => setField('zipcode', v)}
              onBlur={v => handleBlur('zipcode', v)}
              placeholder="e.g. 07001"
              hasError={!!errors.zipcode}
              isValid={!!(touched.zipcode && !errors.zipcode && form.zipcode.trim())}
            />
          </FieldGroup>

          <FieldGroup label="Country" error={errors.country} required>
            <CountrySelect
              value={form.country}
              onChange={v => { setField('country', v); handleBlur('country', v) }}
              hasError={!!errors.country}
              isValid={!!(touched.country && !errors.country && form.country.trim())}
              pc={pc}
            />
          </FieldGroup>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0',
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          <span style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: '.1em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
            fontFamily: 'var(--font-display)', whiteSpace: 'nowrap',
          }}>
            Identity & Contact
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
        </div>

        {/* ID / Passport */}
        <FieldGroup label="ID / Passport number" error={errors.idNumber} required>
          <Input
            value={form.idNumber}
            onChange={v => setField('idNumber', v)}
            onBlur={v => handleBlur('idNumber', v)}
            placeholder="e.g. AB1234567"
            hasError={!!errors.idNumber}
            isValid={!!(touched.idNumber && !errors.idNumber && form.idNumber.trim())}
          />
        </FieldGroup>

        {/* Email or Phone */}
        <FieldGroup label="Email or phone number" error={errors.contact} required>
          <Input
            value={form.contact}
            onChange={v => setField('contact', v)}
            onBlur={v => handleBlur('contact', v)}
            placeholder="you@example.com  or  +34 600 000 000"
            hasError={!!errors.contact}
            isValid={!!(touched.contact && !errors.contact && form.contact.trim())}
          />
        </FieldGroup>

        {/* Notes optional */}
        <FieldGroup label="Special requests (optional)">
          <Textarea
            value={form.notes}
            onChange={v => setField('notes', v)}
            placeholder="Dietary requirements, allergies, timing preferences…"
            rows={3}
          />
        </FieldGroup>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────
   Step 2 — Payment
───────────────────────────────────────── */
function StepPayment({ form, cartLines, cartTotal, pc, submitError, boatName, departureDate, paymentDone, onPaymentDone }) {
  return (
    <>
      {(boatName || departureDate) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          background: pc + '0a',
          border: `1px solid ${pc}20`,
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

      {/* Payment fields */}
      <div>
        <p style={{
          fontSize: 9.5, fontWeight: 700, letterSpacing: '.1em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          fontFamily: 'var(--font-display)', marginBottom: 12,
        }}>
          Payment details
        </p>

        {paymentDone ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '20px',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 'var(--r-lg)',
              display: 'flex', alignItems: 'center', gap: 14,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(16,185,129,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#10b981', marginBottom: 2 }}>
                Payment received
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Now confirm your order below to complete
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <CardFieldMock placeholder="Card number" icon="💳" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <CardFieldMock placeholder="MM / YY" />
                <CardFieldMock placeholder="CVC" />
              </div>
              <CardFieldMock placeholder="Cardholder name" />
            </div>

            {/* Mock pay button for demo (Stripe would replace this) */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onPaymentDone}
              style={{
                width: '100%', height: 46, marginTop: 12,
                background: `linear-gradient(135deg, ${pc}, ${pc}cc)`,
                border: 'none', borderRadius: 'var(--r-lg)',
                color: '#fff', fontFamily: 'var(--font-display)',
                fontWeight: 700, fontSize: 14,
                cursor: 'pointer',
                boxShadow: `0 4px 16px ${pc}30`,
              }}
            >
              Pay {formatPrice(cartTotal)}
            </motion.button>

            {/* Trust signals */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
              marginTop: 12, padding: '10px 12px',
              background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-md)',
            }}>
              {[
                { icon: '🔒', text: 'SSL encrypted' },
                { icon: '💳', text: 'Powered by Stripe' },
                { icon: '🚫', text: 'Never stored' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 11 }}>{icon}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Contact echo */}
      {form.contact && (
        <div style={{
          padding: '11px 14px',
          background: pc + '0d', border: `1px solid ${pc}20`,
          borderRadius: 'var(--r-md)',
          fontSize: 12.5, color: 'var(--text-soft)', lineHeight: 1.6,
        }}>
          Confirmation sent to{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{form.contact}</strong>
        </div>
      )}

      {/* Submit error */}
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
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {submitError}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─────────────────────────────────────────
   Country Select
───────────────────────────────────────── */
function CountrySelect({ value, onChange, hasError, isValid, pc }) {
  const [focused, setFocused] = useState(false)
  const borderColor = hasError
    ? 'rgba(248,113,113,.6)'
    : isValid
      ? 'rgba(16,185,129,.5)'
      : focused
        ? 'var(--border-hover)'
        : 'var(--border-soft)'

  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', height: 44,
          background: 'var(--bg-raised)',
          border: `1px solid ${borderColor}`,
          borderRadius: 'var(--r-md)',
          padding: '0 32px 0 14px',
          fontSize: 14, color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          fontFamily: 'var(--font-body)',
          outline: 'none',
          appearance: 'none',
          WebkitAppearance: 'none',
          cursor: 'pointer',
          transition: 'border-color 180ms ease',
        }}
      >
        <option value="">Select…</option>
        {COUNTRIES.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <svg
        width="10" height="10" viewBox="0 0 10 6" fill="none"
        style={{
          position: 'absolute', right: 12, top: '50%',
          transform: 'translateY(-50%)', pointerEvents: 'none',
          opacity: 0.5,
        }}
      >
        <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}


