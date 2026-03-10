import { useState, useEffect } from 'react'

export default function useScrollSpy(ids, offset = 120) {
  const [active, setActive] = useState(ids[0] || null)

  useEffect(() => {
    if (!ids.length) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: `-${offset}px 0px -60% 0px`, threshold: 0 }
    )

    ids.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [ids.join(','), offset])

  return active
}
