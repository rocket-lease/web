import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LevelUpCelebrationModal } from '../LevelUpCelebrationModal'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

describe('LevelUpCelebrationModal', () => {
  const onClose = vi.fn()

  it('muestra contenido cuando open=true', () => {
    render(
      <LevelUpCelebrationModal
        open
        onClose={onClose}
        oldLevel="silver"
        newLevel="gold"
        benefits={[{ type: 'discount', description: '10% de descuento', config: null }]}
      />,
    )

    expect(screen.getByText('10% de descuento')).toBeInTheDocument()
  })

  it('no renderiza nada cuando open=false', () => {
    const { container } = render(
      <LevelUpCelebrationModal
        open={false}
        onClose={onClose}
        oldLevel="bronze"
        newLevel="silver"
        benefits={[]}
      />,
    )

    expect(container.innerHTML).toBe('')
  })
})
