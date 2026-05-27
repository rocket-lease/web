import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { paymentMethodsApi } from '../api/payment-methods.api'
import type { CreateSavedPaymentMethod, UpdateSavedPaymentMethod } from '@rocket-lease/contracts'
import { t } from '@/i18n/es'

const QUERY_KEY = ['payment-methods']

export function usePaymentMethods() {
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: paymentMethodsApi.list,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateSavedPaymentMethod) => paymentMethodsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success(t('paymentMethods.createSuccess'))
    },
    onError: () => {
      toast.error(t('error.default'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSavedPaymentMethod }) => 
      paymentMethodsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success(t('paymentMethods.updateSuccess'))
    },
    onError: () => {
      toast.error(t('error.default'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentMethodsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success(t('paymentMethods.deleteSuccess'))
    },
    onError: () => {
      toast.error(t('error.default'))
    },
  })

  return {
    paymentMethods: listQuery.data,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    createPaymentMethod: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updatePaymentMethod: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deletePaymentMethod: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}
