import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { BuscarPage } from '@/features/vehiculos/components/BuscarPage'

/**
 * Search params de `/buscar`. Toda la búsqueda y los filtros viven en la URL
 * para que sea shareable, el botón back funcione y la pantalla pueda
 * reconstruirse desde un deep-link.
 *
 * Convención: campos que no afectan la URL "limpia" (UI ephemeral como
 * sheets abiertos) quedan como state local.
 */
const buscarSearchSchema = z.object({
  city:            z.string().optional(),
  locationCode:    z.string().optional(),
  locationLabel:   z.string().optional(),
  start:           z.string().optional(),
  end:             z.string().optional(),
  searched:        z.boolean().optional(),
  query:           z.string().optional(),
  transmission:    z.enum(['Automatico', 'Manual', 'Semiautomatico']).optional(),
  minPrice:        z.number().optional(),
  maxPrice:        z.number().optional(),
  minSeats:        z.number().optional(),
  minYear:         z.number().optional(),
  maxYear:         z.number().optional(),
  accessible:      z.boolean().optional(),
  minTrunk:        z.number().optional(),
  characteristics: z.array(z.string()).optional(),
  sort:            z.enum(['price_asc', 'price_desc', 'rating', 'distance']).optional(),
})

export type BuscarSearch = z.infer<typeof buscarSearchSchema>

export const Route = createFileRoute('/_app/buscar')({
  component: BuscarPage,
  validateSearch: buscarSearchSchema,
})
