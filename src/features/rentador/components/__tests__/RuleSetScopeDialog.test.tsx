import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RuleSetScopeDialog } from '../RuleSetScopeDialog'

describe('RuleSetScopeDialog', () => {
  it('no renderiza nada cuando open=false', () => {
    const { container } = render(
      <RuleSetScopeDialog
        open={false}
        vehicleName="BMW X3"
        onChoose={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('muestra el título y ambas opciones (privado/compartido)', () => {
    render(
      <RuleSetScopeDialog
        open
        vehicleName="BMW X3"
        onChoose={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText(/Cómo querés guardar este set/i)).toBeInTheDocument()
    expect(screen.getByText(/Solo para este vehículo/i)).toBeInTheDocument()
    expect(screen.getByText(/Como set reutilizable/i)).toBeInTheDocument()
  })

  it('al elegir privado llama onChoose con PRIVATE y remember=false por defecto', () => {
    const onChoose = vi.fn()
    render(
      <RuleSetScopeDialog
        open
        vehicleName="BMW X3"
        onChoose={onChoose}
        onCancel={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByText(/Solo para este vehículo/i))
    expect(onChoose).toHaveBeenCalledWith('PRIVATE', false)
  })

  it('al elegir compartido llama onChoose con SHARED', () => {
    const onChoose = vi.fn()
    render(
      <RuleSetScopeDialog
        open
        vehicleName="BMW X3"
        onChoose={onChoose}
        onCancel={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByText(/Como set reutilizable/i))
    expect(onChoose).toHaveBeenCalledWith('SHARED', false)
  })

  it('si el rentador marca "No volver a preguntar", pasa remember=true', () => {
    const onChoose = vi.fn()
    render(
      <RuleSetScopeDialog
        open
        vehicleName="BMW X3"
        onChoose={onChoose}
        onCancel={vi.fn()}
      />,
    )
    const checkbox = screen.getByRole('checkbox', { name: /No volver a preguntar/i })
    fireEvent.click(checkbox)
    fireEvent.click(screen.getByText(/Solo para este vehículo/i))
    expect(onChoose).toHaveBeenCalledWith('PRIVATE', true)
  })

  it('incluye el nombre del vehículo en la descripción del scope privado', () => {
    render(
      <RuleSetScopeDialog
        open
        vehicleName="BMW X3"
        onChoose={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText(/BMW X3/)).toBeInTheDocument()
  })
})
