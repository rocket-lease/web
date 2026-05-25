import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { ReservationRuleSet } from '@rocket-lease/contracts'
import { EditRuleSetDialog } from '../EditRuleSetDialog'
import { rulesApi } from '@/features/rentador/api/rules.api'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('@/features/rentador/api/rules.api', () => ({
  rulesApi: {
    updateRuleSet: vi.fn(),
    listRuleSets: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const updateRuleSet = vi.mocked(rulesApi.updateRuleSet)

function makeRuleSet(overrides: Partial<ReservationRuleSet> = {}): ReservationRuleSet {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    rentalorId: '22222222-2222-2222-2222-222222222222',
    vehicleId: null,
    name: 'Set base',
    description: undefined,
    cancellationPolicy: 'FLEXIBLE',
    depositPercentage: null,
    maxKilometrage: { type: 'UNLIMITED' },
    rentalTimeConstraints: {},
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  updateRuleSet.mockResolvedValue(undefined as unknown as ReservationRuleSet)
})

describe('EditRuleSetDialog', () => {
  it('prepopula el porcentaje existente cuando el set ya tenía seña', () => {
    render(
      <EditRuleSetDialog ruleSet={makeRuleSet({ depositPercentage: 25 })} open onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() },
    )

    const switchEl = screen.getByRole('switch', { name: /Requerir seña/i })
    expect(switchEl).toBeChecked()
    expect(
      screen.getByTestId('deposit-percentage-display').querySelector('input'),
    ).toHaveValue(25)
  })

  it('deja la seña apagada cuando el set guardado no tenía', () => {
    render(
      <EditRuleSetDialog ruleSet={makeRuleSet({ depositPercentage: null })} open onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() },
    )

    expect(screen.getByRole('switch', { name: /Requerir seña/i })).not.toBeChecked()
    expect(screen.queryByTestId('deposit-percentage-display')).not.toBeInTheDocument()
  })

  it('muestra el aviso "Reglas particulares" cuando vehicleId no es null', () => {
    render(
      <EditRuleSetDialog
        ruleSet={makeRuleSet({ vehicleId: '33333333-3333-3333-3333-333333333333' })}
        open
        onOpenChange={vi.fn()}
      />,
      { wrapper: createWrapper() },
    )

    expect(screen.getByText(/Reglas particulares de este vehículo/i)).toBeInTheDocument()
  })

  it('no muestra el aviso de reglas particulares cuando vehicleId es null', () => {
    render(
      <EditRuleSetDialog ruleSet={makeRuleSet({ vehicleId: null })} open onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() },
    )

    expect(screen.queryByText(/Reglas particulares de este vehículo/i)).not.toBeInTheDocument()
  })

  it('al apagar el switch de seña, envía depositPercentage: null en el payload', async () => {
    render(
      <EditRuleSetDialog ruleSet={makeRuleSet({ depositPercentage: 30 })} open onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() },
    )

    fireEvent.click(screen.getByRole('switch', { name: /Requerir seña/i }))
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }))

    await waitFor(() => expect(updateRuleSet).toHaveBeenCalledTimes(1))
    expect(updateRuleSet).toHaveBeenCalledWith(
      '11111111-1111-1111-1111-111111111111',
      expect.objectContaining({ depositPercentage: null }),
    )
  })
})
