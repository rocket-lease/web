import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateRuleSetDialog } from '../CreateRuleSetDialog'
import { rulesApi } from '@/features/rentador/api/rules.api'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('@/features/rentador/api/rules.api', () => ({
  rulesApi: {
    createRuleSet: vi.fn(),
    listRuleSets: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const createRuleSet = vi.mocked(rulesApi.createRuleSet)

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  createRuleSet.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' })
})

describe('CreateRuleSetDialog — seña con slider (US-49)', () => {
  it('no envía depositPercentage cuando el switch está apagado por defecto', async () => {
    render(
      <CreateRuleSetDialog open onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() },
    )

    fireEvent.change(screen.getByLabelText(/Nombre del set/i), {
      target: { value: 'Set sin seña' },
    })

    fireEvent.click(screen.getByRole('button', { name: /^Crear set$/i }))

    await waitFor(() => expect(createRuleSet).toHaveBeenCalledTimes(1))
    expect(createRuleSet).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Set sin seña',
        depositPercentage: null,
        vehicleId: null,
      }),
    )
  })

  it('al activar la seña, envía el porcentaje default (30) en el payload', async () => {
    render(
      <CreateRuleSetDialog open onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() },
    )

    fireEvent.change(screen.getByLabelText(/Nombre del set/i), {
      target: { value: 'Set con seña' },
    })

    fireEvent.click(screen.getByRole('switch', { name: /Requerir seña/i }))
    expect(screen.getByTestId('deposit-percentage-display')).toHaveTextContent('30%')

    fireEvent.click(screen.getByRole('button', { name: /^Crear set$/i }))

    await waitFor(() => expect(createRuleSet).toHaveBeenCalledTimes(1))
    expect(createRuleSet).toHaveBeenCalledWith(
      expect.objectContaining({
        depositPercentage: 30,
        vehicleId: null,
      }),
    )
  })

  it('cambiar el slider a 50 emite depositPercentage=50', async () => {
    render(
      <CreateRuleSetDialog open onOpenChange={vi.fn()} />,
      { wrapper: createWrapper() },
    )

    fireEvent.change(screen.getByLabelText(/Nombre del set/i), {
      target: { value: 'Set 50%' },
    })
    fireEvent.click(screen.getByRole('switch', { name: /Requerir seña/i }))

    const slider = screen.getByRole('slider', { name: /Seña/i })
    fireEvent.change(slider, { target: { value: '50' } })

    expect(screen.getByTestId('deposit-percentage-display')).toHaveTextContent('50%')

    fireEvent.click(screen.getByRole('button', { name: /^Crear set$/i }))

    await waitFor(() => expect(createRuleSet).toHaveBeenCalledTimes(1))
    expect(createRuleSet).toHaveBeenCalledWith(
      expect.objectContaining({ depositPercentage: 50 }),
    )
  })

  it('con vehicleIdForPrivateOption seteado, abre el scope dialog al guardar', async () => {
    render(
      <CreateRuleSetDialog
        open
        onOpenChange={vi.fn()}
        vehicleIdForPrivateOption="veh-1"
        vehicleNameForScopeDialog="BMW X3"
      />,
      { wrapper: createWrapper() },
    )

    fireEvent.change(screen.getByLabelText(/Nombre del set/i), {
      target: { value: 'Set BMW' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^Crear set$/i }))

    expect(await screen.findByText(/Cómo querés guardar este set/i)).toBeInTheDocument()
    expect(createRuleSet).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText(/Solo para este vehículo/i))

    await waitFor(() => expect(createRuleSet).toHaveBeenCalledTimes(1))
    expect(createRuleSet).toHaveBeenCalledWith(
      expect.objectContaining({ vehicleId: 'veh-1' }),
    )
  })

  it('usa preferencia SHARED guardada en localStorage sin mostrar el modal', async () => {
    localStorage.setItem('rocket.preferences.ruleSetScopeDefault', 'SHARED')

    render(
      <CreateRuleSetDialog
        open
        onOpenChange={vi.fn()}
        vehicleIdForPrivateOption="veh-1"
        vehicleNameForScopeDialog="BMW X3"
      />,
      { wrapper: createWrapper() },
    )

    fireEvent.change(screen.getByLabelText(/Nombre del set/i), {
      target: { value: 'Set con preferencia' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^Crear set$/i }))

    await waitFor(() => expect(createRuleSet).toHaveBeenCalledTimes(1))
    expect(createRuleSet).toHaveBeenCalledWith(
      expect.objectContaining({ vehicleId: null }),
    )
    expect(screen.queryByText(/Cómo querés guardar este set/i)).not.toBeInTheDocument()
  })
})
