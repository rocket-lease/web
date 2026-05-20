import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/ui/button'
import { t } from '@/i18n/es'

interface QrScannerProps {
  onScan: (token: string) => void
  confirmLabel?: string
  fallbackLabel?: string
}

export function QrScanner({
  onScan,
  confirmLabel = t('reservas.retiro.confirmar'),
  fallbackLabel = t('reservas.retiro.fallback'),
}: QrScannerProps) {
  const uid = useId().replace(/:/g, '')
  const containerId = `qr-scanner-${uid}`
  const onScanRef = useRef(onScan)
  const scannedRef = useRef(false)
  const [fallback, setFallback] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [cameraError, setCameraError] = useState(false)

  useLayoutEffect(() => { onScanRef.current = onScan })

  useEffect(() => {
    if (fallback) return
    scannedRef.current = false
    const scanner = new Html5Qrcode(containerId)

    void scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          if (scannedRef.current) return
          scannedRef.current = true
          void scanner.stop().catch(() => {})
          onScanRef.current(extractToken(decodedText))
        },
        undefined,
      )
      .catch(() => {
        setCameraError(true)
        setFallback(true)
      })

    return () => {
      if (scanner.isScanning) void scanner.stop().catch(() => {})
    }
  }, [fallback, containerId])

  if (fallback || cameraError) {
    const inputId = `${containerId}-input`
    return (
      <div className="space-y-3">
        <label htmlFor={inputId} className="block text-sm text-text-secondary text-center">
          {fallbackLabel}
        </label>
        <input
          id={inputId}
          type="text"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder={t('reservas.qr.codigoPlaceholder')}
          className="w-full rounded-xl border border-white/8 bg-surface-2 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-500"
          autoFocus
        />
        <Button
          className="w-full"
          disabled={manualCode.trim().length < 8}
          onClick={() => onScanRef.current(manualCode.trim())}
        >
          {confirmLabel}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div id={containerId} className="overflow-hidden rounded-xl" />
      <Button
        variant="ghost"
        className="w-full text-sm text-text-muted"
        onClick={() => setFallback(true)}
      >
        {fallbackLabel}
      </Button>
    </div>
  )
}

function extractToken(text: string): string {
  try {
    const url = new URL(text)
    const parts = url.pathname.split('/').filter(Boolean)
    return parts[parts.length - 1] ?? text
  } catch {
    return text
  }
}
