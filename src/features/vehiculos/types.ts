export type Transmission = 'automatic' | 'manual'

export interface VehiculoFoto {
  id: string
  url: string
  order: number
}

export interface Tarifa {
  daily: number
  weekly?: number
  monthly?: number
}

export interface Vehiculo {
  id: string
  rentadorId: string
  marca: string
  modelo: string
  anio: number
  patente: string
  transmission: Transmission
  asientos: number
  combustible: 'nafta' | 'diesel' | 'gnc' | 'electrico' | 'hibrido'
  descripcion: string
  tags: string[]
  tarifa: Tarifa
  fotos: VehiculoFoto[]
  disponible: boolean
  rating: number
  reviewCount: number
  ubicacion: {
    direccion: string
    lat: number
    lng: number
    ciudad: string
  }
  rentador: {
    id: string
    nombre: string
    avatarUrl?: string
    rating: number
    reviewCount: number
    level: 'bronze' | 'silver' | 'gold' | 'platinum'
  }
  createdAt: string
}

export interface VehiculoFilters {
  query?: string
  transmission?: Transmission | null
  maxPriceDaily?: number | null
  accessibility?: string[]
  fechaDesde?: string
  fechaHasta?: string
}
