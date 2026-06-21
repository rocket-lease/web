import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SugeridoParaVos } from './SugeridoParaVos'
import { createWrapper } from '@/test/query-wrapper'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: { children: React.ReactNode }) => <a {...props}>{children}</a>,
  useLinkProps: () => ({}),
  useNavigate: () => vi.fn(),
}))

const mockUseRecommendations = vi.fn()

vi.mock('../hooks/useRecommendations', () => ({
  useRecommendations: () => mockUseRecommendations(),
}))

const Wrapper = createWrapper()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('SugeridoParaVos', () => {
  it('renderiza null cuando hay error', () => {
    mockUseRecommendations.mockReturnValue({ data: null, isLoading: false, isError: true })
    const { container } = render(<SugeridoParaVos />, { wrapper: Wrapper })
    expect(container).toBeEmptyDOMElement()
  })

  it('renderiza sección cuando hay datos', () => {
    mockUseRecommendations.mockReturnValue({
      data: {
        section: 'Sugerido para vos',
        vehicles: [
          { id: 'v1', brand: 'Toyota', model: 'Corolla', year: 2024, transmission: 'Manual' as const, passengers: 5, isAccessible: false, basePriceCents: 50000, characteristics: ['GPS' as const], enabled: true, photos: ['https://i.com/1.jpg'], mileage: 10000, color: 'Rojo', trunkLiters: 400, isPromoted: false, autoAccept: false, demandMultiplier: 1, province: 'B', city: 'CABA' },
        ],
      },
      isLoading: false,
      isError: false,
    })
    render(<SugeridoParaVos />, { wrapper: Wrapper })
    expect(screen.getByText('Sugerido para vos')).toBeInTheDocument()
  })

  it('renderiza null cuando no hay sección', () => {
    mockUseRecommendations.mockReturnValue({ data: { section: '', vehicles: [] }, isLoading: false, isError: false })
    const { container } = render(<SugeridoParaVos />, { wrapper: Wrapper })
    expect(container).toBeEmptyDOMElement()
  })

  it('renderiza null cuando vehicles está vacío', () => {
    mockUseRecommendations.mockReturnValue({ data: { section: 'Sugerido para vos', vehicles: [] }, isLoading: false, isError: false })
    const { container } = render(<SugeridoParaVos />, { wrapper: Wrapper })
    expect(container).toBeEmptyDOMElement()
  })
})
