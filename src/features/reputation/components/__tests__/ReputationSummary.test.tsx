import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ReputationSummary } from '../ReputationSummary'

describe('ReputationSummary', () => {
  it('renderiza el score y cantidad de reseñas', () => {
    render(<ReputationSummary score={4.5} reviewCount={10} />)
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(10)')).toBeInTheDocument()
    expect(screen.queryByText('Conductor Destacado')).not.toBeInTheDocument()
  })

  it('renderiza el badge si aplica', () => {
    render(<ReputationSummary score={4.9} reviewCount={15} badges={['conductor_destacado']} />)
    expect(screen.getByText('4.9')).toBeInTheDocument()
    expect(screen.getByText('(15)')).toBeInTheDocument()
    expect(screen.getByText('Conductor Destacado')).toBeInTheDocument()
  })
})
