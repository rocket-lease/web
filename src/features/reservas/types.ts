export type ReservaEstado =
  | 'pending_approval'
  | 'pending_payment'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'expired'

export interface Reserva {
  id: string
  conductorId: string
  vehiculoId: string
  rentadorId: string
  estado: ReservaEstado
  fechaDesde: string
  fechaHasta: string
  totalCents: number
  vehiculo: {
    marca: string
    modelo: string
    anio: number
    fotoUrl?: string
  }
  rentador: {
    nombre: string
    avatarUrl?: string
  }
  createdAt: string
  updatedAt: string
}
