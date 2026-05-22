import { createFileRoute } from '@tanstack/react-router'
import { MapaPage } from '@/features/mapa/components/MapaPage'

export const Route = createFileRoute('/_app/mapa')({
  component: MapaPage,
})
