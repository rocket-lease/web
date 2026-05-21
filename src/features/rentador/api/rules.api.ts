import { apiClient } from '@/lib/api-client'
import { vehiclesApi } from '@/features/vehiculos/api/vehiculos.api'
import {
  CreateReservationRuleSetResponseSchema,
  ReservationRuleSetSchema,
  ReservationRuleSetEndpoints,
  type ReservationRuleSet,
  type CreateReservationRuleSetRequest,
  type UpdateReservationRuleSetRequest,
  type CreateReservationRuleSetResponse,
} from '@rocket-lease/contracts'

const parseRuleSet = (input: unknown): ReservationRuleSet => ReservationRuleSetSchema.parse(input)
const parseRuleSets = (input: unknown): ReservationRuleSet[] => ReservationRuleSetSchema.array().parse(input)
const parseCreateResponse = (input: unknown): CreateReservationRuleSetResponse =>
  CreateReservationRuleSetResponseSchema.parse(input)
const parseRuleSetNullable = (input: unknown): ReservationRuleSet | null =>
  input === null ? null : ReservationRuleSetSchema.parse(input)
export const rulesApi = {
  /**
   * Obtener lista de sets de reglas del rentador (con todos los campos)
   */
  async listRuleSets(): Promise<ReservationRuleSet[]> {
    const response = await apiClient.get<unknown>(ReservationRuleSetEndpoints.listMine)
    return parseRuleSets(response)
  },

  /**
   * Obtener detalles completos de un set de reglas
   */
  async getRuleSetById(id: string): Promise<ReservationRuleSet> {
    const response = await apiClient.get<unknown>(ReservationRuleSetEndpoints.getById(id))
    return parseRuleSet(response)
  },

  /**
   * Crear un nuevo set de reglas
   */
  async createRuleSet(
    data: CreateReservationRuleSetRequest
  ): Promise<CreateReservationRuleSetResponse> {
    const response = await apiClient.post<unknown>(ReservationRuleSetEndpoints.create, data)
    return parseCreateResponse(response)
  },

  /**
   * Actualizar un set de reglas existente
   */
  async updateRuleSet(
    id: string,
    data: UpdateReservationRuleSetRequest
  ): Promise<ReservationRuleSet> {
    const response = await apiClient.patch<unknown>(ReservationRuleSetEndpoints.update(id), data)
    return parseRuleSet(response)
  },

  /**
   * Eliminar un set de reglas
   */
  async deleteRuleSet(id: string): Promise<void> {
    await apiClient.delete<void>(ReservationRuleSetEndpoints.delete(id))
  },

  /**
   * Asignar un set de reglas a un vehículo
   */
  async assignRuleSetToVehicle(vehicleId: string, ruleSetId: string | null): Promise<void> {
    await vehiclesApi.updateVehicle(vehicleId, { reservationRuleSetId: ruleSetId })
  },

  /**
   * Obtener el set privado asociado a un vehículo (si existe).
   * Devuelve `null` cuando el vehículo no tiene set privado.
   */
  async getPrivateRuleSetForVehicle(vehicleId: string): Promise<ReservationRuleSet | null> {
    const response = await apiClient.get<unknown>(
      ReservationRuleSetEndpoints.getPrivateByVehicle(vehicleId),
    )
    return parseRuleSetNullable(response)
  },
}
