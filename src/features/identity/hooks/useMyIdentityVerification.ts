import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { identityApi, type SubmitIdentityVerificationFiles } from '../api/identity.api'

const QUERY_KEY = ['identity', 'verification'] as const

export function useMyIdentityVerification() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => identityApi.getMyVerification(),
    staleTime: 30_000,
    refetchInterval: (currentQuery) =>
      currentQuery.state.data?.status === 'pending' ? 5_000 : false,
  })

  const submitMutation = useMutation({
    mutationFn: (payload: SubmitIdentityVerificationFiles) =>
      identityApi.submitMyVerification(payload),
    onSuccess: (verification) => {
      queryClient.setQueryData(QUERY_KEY, verification)
    },
  })

  return {
    verification: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    submitVerification: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  }
}