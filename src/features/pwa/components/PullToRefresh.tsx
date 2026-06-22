import { useEffect, useRef, useState } from 'react'
import { Loader2, ArrowDown } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children:  React.ReactNode
  /** Deshabilita los gestos de pull-to-refresh sin desmontar el componente. */
  enabled?:  boolean
  /** Clases del contenedor scrolleable interno (este componente ES el scroller). */
  className?: string
}

const THRESHOLD = 70
const MAX_PULL = 110
const RESISTANCE = 0.5

/**
 * Contenedor scrolleable con gesto pull-to-refresh. Es el único scroller del
 * shell: el documento/viewport no scrollea, así la bottom bar queda clavada por
 * layout. El gesto se mide sobre el `scrollTop` de este contenedor, no sobre
 * `window`.
 */
export function PullToRefresh({ onRefresh, children, enabled = true, className }: PullToRefreshProps) {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const pullRef = useRef(0)
  const startYRef = useRef<number | null>(null)
  const refreshingRef = useRef(false)
  const scrollerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el || !enabled) {
      setPull(0)
      pullRef.current = 0
      startYRef.current = null
      return
    }
    const setPullValue = (value: number) => {
      pullRef.current = value
      setPull(value)
    }

    const onTouchStart = (event: TouchEvent) => {
      if (el.scrollTop > 0 || refreshingRef.current) return
      startYRef.current = event.touches[0].clientY
    }

    const onTouchMove = (event: TouchEvent) => {
      if (startYRef.current === null || refreshingRef.current) return
      if (el.scrollTop > 0) {
        startYRef.current = null
        setPullValue(0)
        return
      }
      const dy = event.touches[0].clientY - startYRef.current
      if (dy <= 0) {
        setPullValue(0)
        return
      }
      setPullValue(Math.min(MAX_PULL, dy * RESISTANCE))
    }

    const onTouchEnd = async () => {
      if (startYRef.current === null) return
      startYRef.current = null
      if (pullRef.current < THRESHOLD) {
        setPullValue(0)
        return
      }
      refreshingRef.current = true
      setRefreshing(true)
      setPullValue(THRESHOLD)
      try {
        await onRefresh()
      } finally {
        refreshingRef.current = false
        setRefreshing(false)
        setPullValue(0)
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchcancel', onTouchEnd)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [onRefresh, enabled])

  const visible = pull > 0 || refreshing
  const progress = Math.min(1, pull / THRESHOLD)

  return (
    <>
      <div
        aria-hidden={!visible}
        className="pointer-events-none fixed left-0 right-0 z-50 flex justify-center"
        style={{
          top: 'env(safe-area-inset-top, 0px)',
          transform: `translateY(${Math.max(0, pull - 30)}px)`,
          opacity: refreshing ? 1 : progress,
          transition: refreshing || pull === 0 ? 'transform 200ms ease, opacity 200ms ease' : 'none',
        }}
      >
        <div className="mt-2 flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 border border-white/8 shadow-elevated">
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
          ) : (
            <ArrowDown
              className="h-4 w-4 text-brand-400 transition-transform"
              style={{ transform: progress >= 1 ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          )}
        </div>
      </div>
      <main ref={scrollerRef} className={className}>
        {children}
      </main>
    </>
  )
}
