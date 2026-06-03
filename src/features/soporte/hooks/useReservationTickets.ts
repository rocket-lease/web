import { useQuery } from '@tanstack/react-query'
import { ticketsApi } from '../api/tickets.api'

export function useReservationTickets(reservationId: string) {
  return useQuery({
    queryKey: ['tickets', 'reservation', reservationId],
    queryFn: () => ticketsApi.getByReservation(reservationId),
  })
}
