import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LevelDiscountBadge } from '../LevelDiscountBadge'

describe('LevelDiscountBadge', () => {
  it('renderiza el texto con el porcentaje correcto para 5%', () => {
    render(<LevelDiscountBadge discountPercentage={5} />)
    expect(screen.getByText('5% OFF por nivel')).toBeInTheDocument()
  })

  it('renderiza el texto con el porcentaje correcto para 15%', () => {
    render(<LevelDiscountBadge discountPercentage={15} />)
    expect(screen.getByText('15% OFF por nivel')).toBeInTheDocument()
  })
})
