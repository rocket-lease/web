import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCancelReservation } from './useCancelReservation'

const queryClient = new QueryClient()

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

describe('useCancelReservation', () => {
  it('should be defined', () => {
    const { result } = renderHook(() => useCancelReservation(), { wrapper })
    expect(result.current.mutateAsync).toBeDefined()
  })
})
