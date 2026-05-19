import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/ui/button'
import { t } from '@/i18n/es'

interface QrScannerProps {
  onScan: (token: string) => void
}

/**
 * Escanea un QR con la cámara del dispositivo.
 * Si el usuario deniega permisos o hay un error, muestra un input de texto
 * como fallback para ingresar el código manualmente.
 */
export function QrScanner({ onScan }: QrScannerProps) {
  const containerId = 'qr-scanner-container'
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan
  const [fallback, setFallback] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [cameraError, setCameraError] = useState(false)

  useEffect(() => {
    if (fallback) return
    const scanner = new Html5Qrcode(containerId)
    scannerRef.current = scanner

    void scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
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
  }, [fallback])

  if (fallback || cameraError) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-text-secondary text-center">
          {t('reservas.retiro.fallback')}
        </p>
        <input
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
          onClick={() => onScan(manualCode.trim())}
        >
          {t('reservas.retiro.confirmar')}
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
        {t('reservas.retiro.fallback')}
      </Button>
    </div>
  )
}

function extractToken(text: string): string {
  try {
    const url = new URL(text)
    const parts = url.pathname.split('/')
    return parts[parts.length - 1] ?? text
  } catch {
    return text
  }
}
