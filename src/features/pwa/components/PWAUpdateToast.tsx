import { useEffect } from 'react'
import { toast } from 'sonner'

export function PWAUpdateToast() {
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const { updateSW } = (e as CustomEvent).detail as { updateSW: (reload?: boolean) => void }
      toast('Nueva versión disponible', {
        duration: Infinity,
        description: 'Actualizá para obtener las últimas mejoras.',
        action: {
          label: 'Actualizar',
          onClick: () => updateSW(true),
        },
        cancel: {
          label: 'Después',
          onClick: () => toast.dismiss(),
        },
      })
    }

    window.addEventListener('pwa:update-available', handleUpdate)
    return () => window.removeEventListener('pwa:update-available', handleUpdate)
  }, [])

  return null
}
