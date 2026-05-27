import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from '@tanstack/react-router'
import { FileText } from '@phosphor-icons/react'
import { Button } from '@/ui/button'
import { t } from '@/i18n/es'

interface VehicleDocumentGateProps {
  children: React.ReactNode
  vehicleId: string
  documentStatus?: string | null
}

export function VehicleDocumentGate({
  children,
  vehicleId,
  documentStatus,
}: VehicleDocumentGateProps) {
  const navigate = useNavigate()

  const needsDocuments =
    documentStatus == null || documentStatus === 'none' || documentStatus === 'rejected'

  useEffect(() => {
    if (needsDocuments) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [needsDocuments])

  return (
    <>
      {children}
      {needsDocuments &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6">
            <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-surface-1 p-6 text-center shadow-elevated">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-bg text-warning">
                <FileText className="h-7 w-7" />
              </div>

              <h2 className="mt-4 text-xl font-bold text-text-primary">
                {t('documentosVehiculo.guard.title')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {t('documentosVehiculo.guard.copy')}
              </p>

              <Button
                className="mt-6 w-full"
                onClick={() =>
                  navigate({ to: '/mis-vehiculos/$id/documentos', params: { id: vehicleId } })
                }
              >
                {t('documentosVehiculo.guard.cta')}
              </Button>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
