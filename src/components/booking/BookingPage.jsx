import React, { useState } from 'react'
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

export default function BookingPage({ code }) {
  const { data, loading, error } = useBooking(code)
  const items  = useCartStore(s => s.items)
  const add    = useCartStore(s => s.add)
  const remove = useCartStore(s => s.remove)
  const clear  = useCartStore(s => s.clear)
  const total  = useCartStore(s => s.total)

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [done, setDone]                 = useState(false)
  const [finalTotal, setFinalTotal]     = useState(0)

  // ⚠️ useUpsell must be called here (top level), before any conditional return
  const products    = data?.products || []
  const cartUpsells = useUpsell(items, products, 1)

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
  const departureTime = data.departureTime || null

  // Top upsell suggestion for CartBar micro-prompt
  const topUpsell   = cartUpsells[0] || null

  // Urgency: PrepWindowBanner visibility drives CartBar label
  // We compute it here so CartBar receives it without prop drilling through ProductSection
  const urgencyActive = (() => {
    if (!departureTime || !cartHasItems) return false
    const diff = new Date(departureTime) - Date.now()
    const hours = diff / 36e5
    return hours > 0 && hours < 24
  })()

  if (done) {
    return (
      <SuccessScreen
        clientName={data.clientName}
        total={finalTotal}
        primaryColor={pc}
        boatName={data.boat?.boat_name || ''}
        departureDate={data.date || ''}
      />
    )
  }

  async function handleSubmit({ form, cartTotal: ct }) {
    await submitOrder({
      linkId: data.id, items, total: ct,
      clientName: form.name, email: form.email, notes: form.notes,
    })
    setFinalTotal(ct)
    clear()
    setCheckoutOpen(false)
    setDone(true)
  }

  return (
    <>
      <Topbar appearance={data.appearance} cartCount={cartCount} cartTotal={cartTotal} />

      <main>
        <Hero data={data} />

        {categories.length > 1 && (
          <CategoryNav categories={categories} sectionIds={sectionIds} primaryColor={pc} />
        )}

        <div style={{
          maxWidth: 900, margin: '0 auto',
          padding: 'clamp(32px,5vw,56px) clamp(16px,4vw,28px) 160px',
        }}>
          {bundles.length > 0 && (
            <FeaturedBundle bundles={bundles} products={products} primaryColor={pc} />
          )}

          <PrepWindowBanner
            departureTime={departureTime}
            primaryColor={pc}
            cartHasItems={cartHasItems}
          />

          {categories.map((cat, i) => (
            <ProductSection
              key={cat}
              category={cat}
              products={products.filter(p => p.category === cat)}
              sectionId={sectionIds[i]}
              primaryColor={pc}
              allProducts={products}   // full catalog for cross-category upsells
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
        onCheckout={() => setCheckoutOpen(true)}
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
      />
    </>
  )
}
