import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { licenseApi, type SubmitDriverLicenseVerificationFiles } from '../api/license.api'

const QUERY_KEY = ['driver-license', 'verification'] as const

export function useMyDriverLicenseVerification() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => licenseApi.getMyVerification(),
    staleTime: 30_000,
    refetchInterval: (currentQuery) =>
      currentQuery.state.data?.status === 'pending' ? 5_000 : false,
  })

  const submitMutation = useMutation({
    mutationFn: (payload: SubmitDriverLicenseVerificationFiles) =>
      licenseApi.submitMyVerification(payload),
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