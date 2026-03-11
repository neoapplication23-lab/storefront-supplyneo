import React, { useState, useEffect } from 'react'
import useBooking from '../../hooks/useBooking'
import useCartStore from '../../store/useCartStore'
import useUpsell from '../../hooks/useUpsell'
import { submitOrder } from '../../api/booking'
import Topbar from '../layout/Topbar'
import CartBar from '../layout/CartBar'
import Hero from './Hero'
import CategoryNav from './CategoryNav'
import ProductSection from './ProductSection'
import FeaturedBundle from './FeaturedBundle'
import PrepWindowBanner from './PrepWindowBanner'
import SuccessScreen from './SuccessScreen'
import NotFound from './NotFound'
import Spinner from '../ui/Spinner'
import CheckoutDrawer from '../checkout/CheckoutDrawer'
import ShipAnimation from './ShipAnimation'
import { motion } from 'framer-motion'

export default function BookingPage({ code }) {
  const { data, loading, error } = useBooking(code)
  const items  = useCartStore(s => s.items)
  const add    = useCartStore(s => s.add)
  const remove = useCartStore(s => s.remove)
  const clear  = useCartStore(s => s.clear)
  const total  = useCartStore(s => s.total)

  // ── ALL hooks must be declared before any early returns ──
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [orders, setOrders]             = useState([])
  const [finalTotal, setFinalTotal]     = useState(0)
  const [showShip, setShowShip]         = useState(false)
  const [shipShown, setShipShown]       = useState(false)
  const [showStore, setShowStore]       = useState(false)
  const [activeFilter, setActiveFilter]  = useState(null)

  const products    = data?.products || []
  const cartUpsells = useUpsell(items, products, 1)

  const departureTime  = data?.departureTime || null

  // Build a real Date from departureTime OR date+checkIn
  const resolvedDeparture = (() => {
    if (!data) return null
    if (data.departureTime) {
      const d = new Date(data.departureTime)
      if (!isNaN(d)) return d
    }
    if (data.date && data.checkIn) {
      const timeMatch = data.checkIn.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
      if (timeMatch) {
        let h = parseInt(timeMatch[1], 10)
        const m = parseInt(timeMatch[2], 10)
        const ampm = timeMatch[3]?.toUpperCase()
        if (ampm === 'PM' && h < 12) h += 12
        if (ampm === 'AM' && h === 12) h = 0
        const d = new Date(data.date)
        if (!isNaN(d)) { d.setHours(h, m, 0, 0); return d }
      }
    }
    return null
  })()

  const timeToCheckin  = resolvedDeparture ? (resolvedDeparture - Date.now()) : Infinity
  const underOneHour   = timeToCheckin > 0 && timeToCheckin < 3600000
  const checkinPassed  = resolvedDeparture ? timeToCheckin <= 0 : false

  useEffect(() => {
    if (underOneHour && !shipShown && !loading && data) {
      setShowShip(true)
      setShipShown(true)
    }
  }, [underOneHour, shipShown, loading, data])

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column',
        gap: 16, background: 'var(--bg-base)',
      }}>
        <Spinner size={26} color="#334155" />
        <p style={{
          color: 'var(--text-muted)', fontSize: 13,
          letterSpacing: '.06em', textTransform: 'uppercase',
          fontFamily: 'var(--font-display)', fontWeight: 600,
        }}>
          Preparing your experience
        </p>
      </div>
    )
  }

  if (error === 'not_found' || !data) return <NotFound />
  if (error === 'network') return (
    <NotFound message="Could not load your booking. Please check your connection and try again." />
  )

  const pc          = data.appearance?.primaryColor || '#0ea5e9'
  const bundles     = data.bundles    || []
  const thresholds  = data.thresholds || null
  const categories  = [...new Set(products.map(p => p.category))]
  const sectionIds  = categories.map((_, i) => `bksec_${i}`)
  const cartCount   = Object.values(items).reduce((a, b) => a + b, 0)
  const cartTotal   = total(products)
  const cartHasItems = cartCount > 0
  const topUpsell   = cartUpsells[0] || null
  const hasDoneOrder = orders.length > 0
  const bookingLocked = underOneHour || checkinPassed

  const urgencyActive = (() => {
    if (!departureTime || !cartHasItems) return false
    const diff = new Date(departureTime) - Date.now()
    const hours = diff / 36e5
    return hours > 0 && hours < 24
  })()

  async function handleSubmit({ form, cartLines, cartTotal: ct }) {
    const orderId = `${data.id}-${Date.now()}`
    await submitOrder({
      linkId:   data.id,
      orderId,
      items,
      total:    ct,
      clientName: form.name,
      email:    form.contact,
      address:  form.address,
      zipcode:  form.zipcode,
      country:  form.country,
      idNumber: form.idNumber,
      notes:    form.notes,
    })
    setFinalTotal(ct)
    setOrders(prev => [...prev, { orderId, total: ct, form }])
    setShowStore(false)
    clear()
    setCheckoutOpen(false)
  }

  // Success screen — after order, cart empty, not explicitly returning to store
  if (hasDoneOrder && cartCount === 0 && !checkoutOpen && !showStore) {
    return (
      <>
        <SuccessScreen
          clientName={data.clientName}
          total={finalTotal}
          primaryColor={pc}
          boatName={data.boat?.boat_name || ''}
          departureDate={data.date || ''}
          orderCount={orders.length}
          onAddMore={bookingLocked ? undefined : () => setShowStore(true)}
        />
        <ShipAnimation
          show={showShip}
          primaryColor={pc}
          onDismiss={() => setShowShip(false)}
        />
      </>
    )
  }

  return (
    <>
      <Topbar appearance={data.appearance} cartCount={cartCount} cartTotal={cartTotal} />

      <main>
        <Hero data={data} departureTime={departureTime} />

        {bookingLocked && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              maxWidth: 900, margin: '24px auto 0',
              padding: '0 clamp(16px,4vw,28px)',
            }}
          >
            <div style={{
              padding: '16px 20px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderLeft: '3px solid #ef4444',
              borderRadius: 'var(--r-lg)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 20 }}>⚓</span>
              <div>
                <p style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: 14, color: 'var(--text-primary)', marginBottom: 2,
                }}>
                  {checkinPassed
                    ? 'Check-in time has passed'
                    : 'Orders are closed — less than 1 hour to check-in'}
                </p>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {checkinPassed
                    ? 'Your booking window has closed. Contact your charter team for assistance.'
                    : 'The preparation team is already loading the vessel. New orders cannot be accepted at this stage.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {categories.length > 0 && (
          <CategoryNav categories={categories} sectionIds={sectionIds} primaryColor={pc} onFilterChange={setActiveFilter} activeFilter={activeFilter} />
        )}

        <div style={{
          maxWidth: 900, margin: '0 auto',
          padding: 'clamp(32px,5vw,56px) clamp(16px,4vw,28px) 160px',
        }}>
          {bundles.length > 0 && (
            <FeaturedBundle bundles={bundles} products={products} primaryColor={pc} />
          )}

          <PrepWindowBanner
            departureTime={resolvedDeparture ? resolvedDeparture.toISOString() : departureTime}
            primaryColor={pc}
            cartHasItems={cartHasItems}
          />

          {(activeFilter ? categories.filter(c => c === activeFilter) : categories).map((cat, i) => (
            <ProductSection
              key={cat}
              category={cat}
              products={products.filter(p => p.category === cat)}
              sectionId={sectionIds[categories.indexOf(cat)]}
              primaryColor={pc}
              allProducts={products}
            />
          ))}
        </div>
      </main>

      <CartBar
        count={cartCount}
        total={cartTotal}
        primaryColor={pc}
        thresholds={thresholds}
        urgencyActive={urgencyActive}
        upsellSuggestion={topUpsell}
        onCheckout={() => !bookingLocked && setCheckoutOpen(true)}
        locked={bookingLocked}
      />

      <CheckoutDrawer
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        products={products}
        items={items}
        primaryColor={pc}
        onAdd={add}
        onRemove={remove}
        onSubmit={handleSubmit}
        clientName={data.clientName}
        boatName={data.boat?.boat_name || ''}
        departureDate={data.date || ''}
        previousOrders={orders}
      />

      <ShipAnimation
        show={showShip}
        primaryColor={pc}
        onDismiss={() => setShowShip(false)}
      />
    </>
  )
}
