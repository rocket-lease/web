import { createFileRoute } from '@tanstack/react-router'
import { BuscarPage } from '@/features/vehiculos/components/BuscarPage'

export const Route = createFileRoute('/_app/buscar')({
  component: BuscarPage,
})
