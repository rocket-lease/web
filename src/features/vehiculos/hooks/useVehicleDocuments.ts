import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { vehicleDocumentsApi } from '../api/vehicle-documents.api'

const documentsQueryKey = (vehicleId: string) => ['vehicles', vehicleId, 'documents'] as const

export function useVehicleDocuments(vehicleId: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: documentsQueryKey(vehicleId),
    queryFn: () => vehicleDocumentsApi.getDocumentStatus(vehicleId),
    staleTime: 30_000,
    refetchInterval: (currentQuery) =>
      currentQuery.state.data?.status === 'pending' ? 5_000 : false,
  })

  const submitMutation = useMutation({
    mutationFn: (payload: { title: File; greenCard: File }) =>
      vehicleDocumentsApi.submitDocuments(vehicleId, payload),
    onSuccess: (result) => {
      queryClient.setQueryData(documentsQueryKey(vehicleId), result)
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['vehicles', vehicleId] })
    },
  })

  return {
    verification: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    submitDocuments: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  }
}
