import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { t } from '@/i18n/es'
import { ticketsApi } from '../api/tickets.api'

export function useContactSupport() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // If there's already an open support_request ticket, navigate to it instead of creating a new one
      const existing = await ticketsApi.getMine()
      const open = existing.find(
        (tk) => tk.type === 'support_request' && (tk.status === 'open' || tk.status === 'under_review'),
      )
      if (open) return open
      return ticketsApi.create({
        type: 'support_request',
        subject: t('soporte.contactar.asuntoDefault'),
        description: t('soporte.contactar.asuntoDefault'),
        photoUrls: [],
      })
    },
    onSuccess: (ticket) => {
      void queryClient.invalidateQueries({ queryKey: ['my-tickets'] })
      void navigate({ to: '/soporte/tickets/$id', params: { id: ticket.id } })
    },
  })
}
