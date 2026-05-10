import { createFileRoute } from '@tanstack/react-router'
import { NuevoVehiculoPage } from '@/features/rentador/components/NuevoVehiculoPage'

export const Route = createFileRoute('/_app/mis-vehiculos/nuevo')({
  component: NuevoVehiculoPage,
})
