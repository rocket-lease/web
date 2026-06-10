import { createFileRoute } from '@tanstack/react-router'
import { VehiculoDetailPage } from '@/features/vehiculos/components/VehiculoDetailPage'

interface VehiculoDetailSearch {
  from?: string
  to?: string
}

export const Route = createFileRoute('/_app/vehiculos/$id')({
  validateSearch: (search: Record<string, unknown>): VehiculoDetailSearch => ({
    from: typeof search.from === 'string' ? search.from : undefined,
    to: typeof search.to === 'string' ? search.to : undefined,
  }),
  component: VehiculoDetailPage,
})
