import { createFileRoute } from '@tanstack/react-router'
import { VehiculoDetailPage } from '@/features/vehiculos/components/VehiculoDetailPage'

export const Route = createFileRoute('/_app/vehiculos/$id')({
  component: VehiculoDetailPage,
})
