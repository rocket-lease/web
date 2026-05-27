import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ReservationRuleSetSelector } from '../ReservationRuleSetSelector'
import { rulesApi } from '@/features/rentador/api/rules.api'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('@/features/rentador/api/rules.api', () => ({
  rulesApi: {
    listRuleSets: vi.fn(),
    createRuleSet: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const listRuleSets = vi.mocked(rulesApi.listRuleSets)

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  listRuleSets.mockResolvedValue([])
})

async function openDropdown() {
  await waitFor(() => expect(listRuleSets).toHaveBeenCalled())
  const trigger = screen.getByRole('button')
  fireEvent.click(trigger)
  await waitFor(() => {
    if (!screen.queryByText(/\+ Crear nuevo set/i)) {
      fireEvent.click(trigger)
      throw new Error('not open yet')
    }
  })
}

describe('ReservationRuleSetSelector — + Crear nuevo (US-49)', () => {
  it('renderiza la opción "+ Crear nuevo set" al final', async () => {
    render(
      <ReservationRuleSetSelector
        onSelect={vi.fn()}
        vehicleId="veh-1"
        vehicleName="BMW X3"
      />,
      { wrapper: createWrapper() },
    )
    await openDropdown()
    expect(await screen.findByText(/\+ Crear nuevo set/i)).toBeInTheDocument()
  })

  it('al tocar "+ Crear nuevo set" abre el CreateRuleSetDialog', async () => {
    render(
      <ReservationRuleSetSelector
        onSelect={vi.fn()}
        vehicleId="veh-1"
        vehicleName="BMW X3"
      />,
      { wrapper: createWrapper() },
    )
    await openDropdown()
    fireEvent.click(await screen.findByText(/\+ Crear nuevo set/i))

    expect(await screen.findByText(/Nuevo set de reglas/i)).toBeInTheDocument()
  })

  it('no llama onSelect al abrir el dialog de creación', async () => {
    const onSelect = vi.fn()
    render(
      <ReservationRuleSetSelector
        onSelect={onSelect}
        vehicleId="veh-1"
        vehicleName="BMW X3"
      />,
      { wrapper: createWrapper() },
    )
    await openDropdown()
    fireEvent.click(await screen.findByText(/\+ Crear nuevo set/i))

    expect(onSelect).not.toHaveBeenCalled()
  })
})
