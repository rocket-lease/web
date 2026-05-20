import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FavoritoButton } from './FavoritoButton'

const VEHICLE_ID = '11111111-1111-1111-1111-111111111111'

const mockToggle = vi.fn()
const mockIsLoading = { value: false }
const mockUseFavoritoIds = vi.fn()

vi.mock('../hooks/useFavoritos', () => ({
  useFavoritoIds: () => mockUseFavoritoIds(),
}))

vi.mock('../hooks/useToggleFavorito', () => ({
  useToggleFavorito: () => ({ toggle: mockToggle, isLoading: mockIsLoading.value }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockIsLoading.value = false
  mockUseFavoritoIds.mockReturnValue(new Set())
})

describe('FavoritoButton', () => {
  it('renderiza con aria-label "Agregar a favoritos" cuando no es favorito', () => {
    render(<FavoritoButton vehicleId={VEHICLE_ID} />)

    expect(screen.getByRole('button', { name: /agregar a favoritos/i })).toBeInTheDocument()
  })

  it('renderiza con aria-label "Quitar de favoritos" cuando ya es favorito', () => {
    mockUseFavoritoIds.mockReturnValue(new Set([VEHICLE_ID]))

    render(<FavoritoButton vehicleId={VEHICLE_ID} />)

    expect(screen.getByRole('button', { name: /quitar de favoritos/i })).toBeInTheDocument()
  })

  it('aria-pressed es false cuando no es favorito', () => {
    render(<FavoritoButton vehicleId={VEHICLE_ID} />)

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('aria-pressed es true cuando ya es favorito', () => {
    mockUseFavoritoIds.mockReturnValue(new Set([VEHICLE_ID]))

    render(<FavoritoButton vehicleId={VEHICLE_ID} />)

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('llama a toggle con isFavorito=false al hacer click cuando no es favorito', () => {
    render(<FavoritoButton vehicleId={VEHICLE_ID} />)
    fireEvent.click(screen.getByRole('button'))

    expect(mockToggle).toHaveBeenCalledWith(VEHICLE_ID, false)
  })

  it('llama a toggle con isFavorito=true al hacer click cuando ya es favorito', () => {
    mockUseFavoritoIds.mockReturnValue(new Set([VEHICLE_ID]))

    render(<FavoritoButton vehicleId={VEHICLE_ID} />)
    fireEvent.click(screen.getByRole('button'))

    expect(mockToggle).toHaveBeenCalledWith(VEHICLE_ID, true)
  })

  it('previene la propagación del click para no navegar desde la card', () => {
    const parentHandler = vi.fn()
    render(
      <div onClick={parentHandler}>
        <FavoritoButton vehicleId={VEHICLE_ID} />
      </div>,
    )

    fireEvent.click(screen.getByRole('button'))

    expect(parentHandler).not.toHaveBeenCalled()
  })
})
