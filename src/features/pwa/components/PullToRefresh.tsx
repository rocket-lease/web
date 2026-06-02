import { useEffect, useRef, useState } from 'react'
import { Loader2, ArrowDown } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children:  React.ReactNode
  /** Deshabilita los gestos de pull-to-refresh sin desmontar el componente. */
  enabled?:  boolean
}

const THRESHOLD = 70
const MAX_PULL = 110
const RESISTANCE = 0.5

export function PullToRefresh({ onRefresh, children, enabled = true }: PullToRefreshProps) {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const pullRef = useRef(0)
  const startYRef = useRef<number | null>(null)
  const refreshingRef = useRef(false)

  useEffect(() => {
    if (!enabled) {
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
      if (window.scrollY > 0 || refreshingRef.current) return
      startYRef.current = event.touches[0].clientY
    }

    const onTouchMove = (event: TouchEvent) => {
      if (startYRef.current === null || refreshingRef.current) return
      if (window.scrollY > 0) {
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

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
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
      {children}
    </>
  )
}
