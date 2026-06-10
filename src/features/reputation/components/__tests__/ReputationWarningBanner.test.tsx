import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ReputationWarningBanner } from '../ReputationWarningBanner'
import '@/i18n/es'

vi.mock('@/i18n/es', () => ({
  t: (key: string) => key,
}))

describe('ReputationWarningBanner', () => {
  it('no renderiza nada si no hay problemas', () => {
    const { container } = render(<ReputationWarningBanner isLowReputation={false} penaltyCount={0} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renderiza warning por baja reputacion', () => {
    render(<ReputationWarningBanner isLowReputation={true} penaltyCount={0} />)
    expect(screen.getByText('reputation.banner.lowScore')).toBeInTheDocument()
  })

  it('renderiza warning por reportes (penaltyCount > 0)', () => {
    render(<ReputationWarningBanner isLowReputation={false} penaltyCount={1} />)
    expect(screen.getByText('reputation.banner.warning')).toBeInTheDocument()
  })

  it('renderiza suspended si penaltyCount >= 3', () => {
    render(<ReputationWarningBanner isLowReputation={false} penaltyCount={3} />)
    expect(screen.getByText('reputation.banner.suspended')).toBeInTheDocument()
  })
})
