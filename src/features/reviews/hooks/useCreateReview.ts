import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateReviewRequest, CreateReviewResponse, LevelUpInfo } from '@rocket-lease/contracts'
import { createReview } from '../api/reviews.api'
import { t } from '@/i18n/es'
import { getErrorMessage } from '@/lib/error-mapper'

interface CreateReviewResult {
  review: CreateReviewResponse
  levelUp: LevelUpInfo | null
}

export function useCreateReview(reservationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateReviewRequest): Promise<CreateReviewResult> => {
      const response = await createReview(reservationId, data)
      return {
        review: response,
        levelUp: response.levelUp ?? null,
      }
    },
    onSuccess: () => {
      toast.success(t('resenas.create.success'))
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] })
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['reputation'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['loyalty'] })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })
}
