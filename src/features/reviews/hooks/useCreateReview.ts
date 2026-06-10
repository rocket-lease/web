import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateReviewRequest } from '@rocket-lease/contracts'
import { createReview } from '../api/reviews.api'
import { t } from '@/i18n/es'
import { getErrorMessage } from '@/lib/error-mapper'

export function useCreateReview(reservationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateReviewRequest) => createReview(reservationId, data),
    onSuccess: () => {
      toast.success(t('resenas.create.success'))
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] })
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['reputation'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })
}
