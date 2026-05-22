import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useNearMe } from './useNearMe'

const originalGeolocation = navigator.geolocation

afterEach(() => {
  Object.defineProperty(navigator, 'geolocation', {
    value: originalGeolocation,
    configurable: true,
  })
})

function setGeolocation(value: unknown) {
  Object.defineProperty(navigator, 'geolocation', {
    value,
    configurable: true,
  })
}

describe('useNearMe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('arranca en estado idle', () => {
    const { result } = renderHook(() => useNearMe())
    expect(result.current.status).toBe('idle')
    expect(result.current.position).toBeNull()
  })

  it('marca "unavailable" si el navegador no soporta geolocalización', () => {
    setGeolocation(undefined)
    const { result } = renderHook(() => useNearMe())
    act(() => result.current.locate())
    expect(result.current.status).toBe('unavailable')
  })

  it('expone la posición cuando el permiso es concedido', async () => {
    setGeolocation({
      getCurrentPosition: (success: PositionCallback) => {
        success({
          coords: { latitude: -34.6, longitude: -58.4 },
        } as GeolocationPosition)
      },
    })
    const { result } = renderHook(() => useNearMe())
    act(() => result.current.locate())
    await waitFor(() => expect(result.current.status).toBe('granted'))
    expect(result.current.position).toEqual({ lat: -34.6, lng: -58.4 })
  })

  it('marca "denied" cuando el usuario rechaza el permiso', async () => {
    setGeolocation({
      getCurrentPosition: (
        _success: PositionCallback,
        error: PositionErrorCallback,
      ) => {
        error({
          code: 1,
          PERMISSION_DENIED: 1,
        } as GeolocationPositionError)
      },
    })
    const { result } = renderHook(() => useNearMe())
    act(() => result.current.locate())
    await waitFor(() => expect(result.current.status).toBe('denied'))
  })
})
