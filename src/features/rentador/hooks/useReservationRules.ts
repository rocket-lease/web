import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  ReservationRuleSet,
  CreateReservationRuleSetRequest,
  UpdateReservationRuleSetRequest,
} from '@rocket-lease/contracts'
import { rulesApi } from '../api/rules.api'
import { t } from '@/i18n/es'

const ruleSetQueryKey = (id: string) => ['reservation-rules', id] as const
const ruleSetListQueryKey = () => ['reservation-rules', 'list'] as const
const privateRuleSetQueryKey = (vehicleId: string) =>
  ['rentador', 'rule-sets', 'private', vehicleId] as const

/**
 * Hook para obtener lista de sets de reglas del rentador
 */
export function useReservationRuleSets(): UseQueryResult<ReservationRuleSet[], Error> {
  return useQuery({
    queryKey: ruleSetListQueryKey(),
    queryFn: () => rulesApi.listRuleSets(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

/**
 * Hook para obtener detalles de un set específico
 */
export function useReservationRuleSet(id: string | undefined): UseQueryResult<ReservationRuleSet, Error> {
  return useQuery({
    queryKey: id ? ruleSetQueryKey(id) : [],
    queryFn: () => (id ? rulesApi.getRuleSetById(id) : Promise.reject('No ID')),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook para obtener el set privado de un vehículo (US-49).
 *
 * Devuelve `null` si el vehículo no tiene set privado.
 * El query se habilita sólo si hay un `vehicleId` válido.
 */
export function usePrivateRuleSet(
  vehicleId: string | undefined,
): UseQueryResult<ReservationRuleSet | null, Error> {
  return useQuery({
    queryKey: vehicleId ? privateRuleSetQueryKey(vehicleId) : ['rentador', 'rule-sets', 'private', 'disabled'],
    queryFn: () =>
      vehicleId ? rulesApi.getPrivateRuleSetForVehicle(vehicleId) : Promise.resolve(null),
    enabled: Boolean(vehicleId),
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook para crear un nuevo set de reglas
 */
export function useCreateReservationRuleSet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateReservationRuleSetRequest) => rulesApi.createRuleSet(data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ruleSetListQueryKey() })
      // Si el set es privado de un vehículo, también invalidamos su query.
      if (variables.vehicleId) {
        queryClient.invalidateQueries({
          queryKey: privateRuleSetQueryKey(variables.vehicleId),
        })
      }
      toast.success(t('reservationRules.created'))
      return response
    },
    onError: (error) => {
      toast.error(t('error.default'))
      console.error('Error creating rule set:', error)
    },
  })
}

/**
 * Hook para actualizar un set de reglas
 */
export function useUpdateReservationRuleSet(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateReservationRuleSetRequest) =>
      rulesApi.updateRuleSet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ruleSetQueryKey(id) })
      queryClient.invalidateQueries({ queryKey: ruleSetListQueryKey() })
      toast.success(t('reservationRules.updated'))
    },
    onError: (error) => {
      toast.error(t('error.default'))
      console.error('Error updating rule set:', error)
    },
  })
}

/**
 * Hook para eliminar un set de reglas
 */
export function useDeleteReservationRuleSet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => rulesApi.deleteRuleSet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ruleSetListQueryKey() })
      toast.success(t('reservationRules.deleted'))
    },
    onError: (error) => {
      toast.error(t('error.default'))
      console.error('Error deleting rule set:', error)
    },
  })
}

/**
 * Hook para asignar un set de reglas a un vehículo
 */
export function useAssignRuleSetToVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ vehicleId, ruleSetId }: { vehicleId: string; ruleSetId: string | null }) =>
      rulesApi.assignRuleSetToVehicle(vehicleId, ruleSetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success(t('reservationRules.assigned'))
    },
    onError: (error) => {
      toast.error(t('error.default'))
      console.error('Error assigning rule set:', error)
    },
  })
}
