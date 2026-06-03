import { describe, it, expect } from 'vitest'
import { ErrorCodes } from '@rocket-lease/contracts'
import { getErrorMessage, getErrorCode, getErrorDetail } from './error-mapper'

describe('getErrorMessage', () => {
  it('devuelve mensaje para UNAUTHORIZED', () => {
    const msg = getErrorMessage({
      code: ErrorCodes.UNAUTHORIZED,
      status: 401,
      detail: 'Token expired',
      title: 'Unauthorized',
      type: 'https://rocket-lease.local/problems/unauthorized',
      statusCode: 401,
      message: 'Token expired',
      timestamp: '2026-01-01T00:00:00.000Z',
      path: '/test',
    })
    expect(msg).toBe('Sesion expirada. Por favor ingresa nuevamente.')
  })

  it('devuelve mensaje para IDENTITY_VERIFICATION_REQUIRED', () => {
    const msg = getErrorMessage({
      code: ErrorCodes.IDENTITY_VERIFICATION_REQUIRED,
      status: 403,
      detail: 'Identity not verified',
      title: 'Forbidden',
      type: 'https://rocket-lease.local/problems/identity_verification_required',
      statusCode: 403,
      message: 'Identity not verified',
      timestamp: '2026-01-01T00:00:00.000Z',
      path: '/test',
    })
    expect(msg).toBe('Necesitas verificar tu identidad antes de continuar.')
  })

  it('devuelve mensaje para DRIVER_LICENSE_VERIFICATION_REQUIRED', () => {
    const msg = getErrorMessage({
      code: ErrorCodes.DRIVER_LICENSE_VERIFICATION_REQUIRED,
      status: 403,
      detail: 'License not verified',
      title: 'Forbidden',
      type: 'https://rocket-lease.local/problems/driver_license_verification_required',
      statusCode: 403,
      message: 'License not verified',
      timestamp: '2026-01-01T00:00:00.000Z',
      path: '/test',
    })
    expect(msg).toBe('Necesitas verificar tu licencia de conducir antes de continuar.')
  })

  it('devuelve mensaje para RESERVATION_VEHICLE_NOT_AVAILABLE', () => {
    const msg = getErrorMessage({
      code: ErrorCodes.RESERVATION_VEHICLE_NOT_AVAILABLE,
      status: 409,
      detail: 'Vehicle not available',
      title: 'Conflict',
      type: 'https://rocket-lease.local/problems/reservation_vehicle_not_available',
      statusCode: 409,
      message: 'Vehicle not available',
      timestamp: '2026-01-01T00:00:00.000Z',
      path: '/test',
    })
    expect(msg).toBe('Este vehiculo ya no esta disponible en esas fechas.')
  })

  it('devuelve mensaje para ENTITY_NOT_FOUND', () => {
    const msg = getErrorMessage({
      code: ErrorCodes.ENTITY_NOT_FOUND,
      status: 404,
      detail: 'Resource not found',
      title: 'Not Found',
      type: 'https://rocket-lease.local/problems/entity_not_found',
      statusCode: 404,
      message: 'Resource not found',
      timestamp: '2026-01-01T00:00:00.000Z',
      path: '/test',
    })
    expect(msg).toBe('No encontramos lo que buscas.')
  })

  it('usa detail como fallback para codigos desconocidos', () => {
    const msg = getErrorMessage({
      code: 'SOME_UNKNOWN_CODE' as any,
      status: 400,
      detail: 'Specific error detail from backend',
      title: 'Bad Request',
      type: 'https://rocket-lease.local/problems/unknown',
      statusCode: 400,
      message: 'Specific error detail from backend',
      timestamp: '2026-01-01T00:00:00.000Z',
      path: '/test',
    })
    expect(msg).toBe('Specific error detail from backend')
  })

  it('devuelve error.default cuando no hay code ni detail', () => {
    const msg = getErrorMessage({})
    expect(msg).toBe('Algo salio mal. Intenta de nuevo.')
  })

  it('devuelve error.default cuando error es null', () => {
    const msg = getErrorMessage(null)
    expect(msg).toBe('Algo salio mal. Intenta de nuevo.')
  })

  it('devuelve error.default cuando error es undefined', () => {
    const msg = getErrorMessage(undefined)
    expect(msg).toBe('Algo salio mal. Intenta de nuevo.')
  })

  it('devuelve mensaje para BANK_ACCOUNT_REQUIRED', () => {
    const msg = getErrorMessage({
      code: ErrorCodes.BANK_ACCOUNT_REQUIRED,
      status: 403,
      detail: 'Bank account required',
      title: 'Forbidden',
      type: 'https://rocket-lease.local/problems/bank_account_required',
      statusCode: 403,
      message: 'Bank account required',
      timestamp: '2026-01-01T00:00:00.000Z',
      path: '/test',
    })
    expect(msg).toBe('Necesitas vincular una cuenta bancaria para recibir pagos.')
  })

  it('devuelve mensaje para INTERNAL_ERROR', () => {
    const msg = getErrorMessage({
      code: ErrorCodes.INTERNAL_ERROR,
      status: 500,
      detail: 'Something went wrong',
      title: 'Internal Server Error',
      type: 'https://rocket-lease.local/problems/internal_error',
      statusCode: 500,
      message: 'Something went wrong',
      timestamp: '2026-01-01T00:00:00.000Z',
      path: '/test',
    })
    expect(msg).toBe('No pudimos procesar tu solicitud. Intenta nuevamente en unos minutos.')
  })
})

describe('getErrorCode', () => {
  it('devuelve el codigo de error', () => {
    const code = getErrorCode({
      code: ErrorCodes.UNAUTHORIZED,
      status: 401,
      title: 'Unauthorized',
      type: 'https://rocket-lease.local/problems/unauthorized',
      statusCode: 401,
      message: 'nope',
      timestamp: '2026-01-01T00:00:00.000Z',
      path: '/test',
    })
    expect(code).toBe(ErrorCodes.UNAUTHORIZED)
  })

  it('devuelve null si no hay error', () => {
    expect(getErrorCode(null)).toBeNull()
  })
})

describe('getErrorDetail', () => {
  it('devuelve el detail del error', () => {
    const detail = getErrorDetail({
      code: ErrorCodes.INTERNAL_ERROR,
      status: 500,
      detail: 'DB connection failed',
      title: 'Error',
      type: 'https://rocket-lease.local/problems/internal_error',
      statusCode: 500,
      message: 'DB connection failed',
      timestamp: '2026-01-01T00:00:00.000Z',
      path: '/test',
    })
    expect(detail).toBe('DB connection failed')
  })

  it('devuelve null si no hay error', () => {
    expect(getErrorDetail(null)).toBeNull()
  })
})
