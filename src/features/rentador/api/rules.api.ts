import type {
  ReservationRuleSet,
  CreateReservationRuleSetRequest,
  UpdateReservationRuleSetRequest,
  CreateReservationRuleSetResponse,
} from '@rocket-lease/contracts'

/**
 * Datos mock para desarrollo/preview
 */
const MOCK_RULE_SETS: ReservationRuleSet[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    rentalorId: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Estándar Flexible',
    description: 'Política flexible, sin seña',
    cancellationPolicy: 'FLEXIBLE',
    deposit: 'NONE',
    maxKilometrage: { type: 'UNLIMITED' },
    rentalTimeConstraints: {},
    vehicleCount: 2,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    rentalorId: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Premium Protegido',
    description: 'Política moderada, seña 50%, máx 500km',
    cancellationPolicy: 'MODERATE',
    deposit: 'FIFTY_PERCENT',
    maxKilometrage: { type: 'LIMITED', value: 500 },
    rentalTimeConstraints: { minDays: 3 },
    vehicleCount: 1,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    rentalorId: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Estricta Corporativa',
    description: 'Política estricta para rentales corporativas',
    cancellationPolicy: 'STRICT',
    deposit: 'FIFTY_PERCENT',
    maxKilometrage: { type: 'LIMITED', value: 1000 },
    rentalTimeConstraints: { minDays: 5, maxDays: 30 },
    vehicleCount: 0,
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
  },
]
const USE_MOCK_RESERVATION_RULES = true // Cambiar a false para usar API real
export const rulesApi = {
  /**
   * Obtener lista de sets de reglas del rentador (con todos los campos)
   */
  async listRuleSets(): Promise<ReservationRuleSet[]> {
    if (USE_MOCK_RESERVATION_RULES) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return MOCK_RULE_SETS
    }

    const response = await fetch('/api/v1/reservation-rules', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch rule sets: ${response.statusText}`)
    }

    return response.json()
  },

  /**
   * Obtener detalles completos de un set de reglas
   */
  async getRuleSetById(id: string): Promise<ReservationRuleSet> {
    if (USE_MOCK_RESERVATION_RULES) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      const found = MOCK_RULE_SETS.find((set) => set.id === id)
      if (!found) {
        throw new Error(`Rule set ${id} not found`)
      }
      return found
    }

    const response = await fetch(`/api/v1/reservation-rules/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch rule set: ${response.statusText}`)
    }

    return response.json()
  },

  /**
   * Crear un nuevo set de reglas
   */
  async createRuleSet(
    data: CreateReservationRuleSetRequest
  ): Promise<CreateReservationRuleSetResponse> {
    if (USE_MOCK_RESERVATION_RULES) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const newSet: ReservationRuleSet = {
        id: 'mock-' + Math.random().toString(36).substring(7),
        rentalorId: 'current-user-id',
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      MOCK_RULE_SETS.push(newSet)
      return { id: newSet.id }
    }

    const response = await fetch('/api/v1/reservation-rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create rule set: ${response.statusText}`)
    }

    return response.json()
  },

  /**
   * Actualizar un set de reglas existente
   */
  async updateRuleSet(
    id: string,
    data: UpdateReservationRuleSetRequest
  ): Promise<void> {
    if (USE_MOCK_RESERVATION_RULES) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const idx = MOCK_RULE_SETS.findIndex((set) => set.id === id)
      if (idx === -1) {
        throw new Error(`Rule set ${id} not found`)
      }
      MOCK_RULE_SETS[idx] = {
        ...MOCK_RULE_SETS[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      return
    }

    const response = await fetch(`/api/v1/reservation-rules/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to update rule set: ${response.statusText}`)
    }
  },

  /**
   * Eliminar un set de reglas
   */
  async deleteRuleSet(id: string): Promise<void> {
    if (USE_MOCK_RESERVATION_RULES) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const idx = MOCK_RULE_SETS.findIndex((set) => set.id === id)
      if (idx === -1) {
        throw new Error(`Rule set ${id} not found`)
      }
      MOCK_RULE_SETS.splice(idx, 1)
      return
    }

    const response = await fetch(`/api/v1/reservation-rules/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete rule set: ${response.statusText}`)
    }
  },

  /**
   * Asignar un set de reglas a un vehículo
   */
  async assignRuleSetToVehicle(vehicleId: string, ruleSetId: string | null): Promise<void> {
    if (USE_MOCK_RESERVATION_RULES) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return
    }

    const response = await fetch(`/api/v1/vehicles/${vehicleId}/reservation-rules`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ruleSetId }),
    })

    if (!response.ok) {
      throw new Error(`Failed to assign rule set: ${response.statusText}`)
    }
  },
}
