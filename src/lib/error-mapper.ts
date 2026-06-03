import type { ProblemDetails } from '@rocket-lease/contracts'
import { ErrorCodes, type ErrorCode } from '@rocket-lease/contracts'
import { t, type I18nKey } from '@/i18n/es'

type ErrorCodeMap = Partial<Record<ErrorCode, I18nKey>>

const errorCodeToKey: ErrorCodeMap = {
  // Auth
  [ErrorCodes.UNAUTHORIZED]: 'error.unauthorized',
  [ErrorCodes.FORBIDDEN]: 'error.forbidden',
  [ErrorCodes.EMAIL_UNVERIFIED_PENDING]: 'error.emailUnverified',

  // Identity
  [ErrorCodes.IDENTITY_VERIFICATION_REQUIRED]: 'error.IDENTITY_VERIFICATION_REQUIRED',
  [ErrorCodes.DRIVER_LICENSE_VERIFICATION_REQUIRED]: 'error.DRIVER_LICENSE_VERIFICATION_REQUIRED',

  // Entity
  [ErrorCodes.ENTITY_NOT_FOUND]: 'error.notFound',
  [ErrorCodes.ENTITY_ALREADY_EXISTS]: 'error.conflict',
  [ErrorCodes.INVALID_ENTITY_DATA]: 'error.validation',

  // Reservation
  [ErrorCodes.RESERVATION_VEHICLE_NOT_AVAILABLE]: 'reservar.errors.RESERVATION_VEHICLE_NOT_AVAILABLE',
  [ErrorCodes.RESERVATION_HOLD_EXPIRED]: 'reservar.errors.RESERVATION_HOLD_EXPIRED',
  [ErrorCodes.RESERVATION_CONTRACT_NOT_ACCEPTED]: 'reservar.errors.RESERVATION_CONTRACT_NOT_ACCEPTED',
  [ErrorCodes.RESERVATION_INVALID_TRANSITION]: 'reservar.errors.RESERVATION_INVALID_TRANSITION',
  [ErrorCodes.RESERVATION_NOT_FOUND]: 'reservar.errors.RESERVATION_NOT_FOUND',
  [ErrorCodes.RESERVATION_FORBIDDEN]: 'reservar.errors.RESERVATION_FORBIDDEN',
  [ErrorCodes.RESERVATION_OWNER_CANNOT_RESERVE]: 'reservar.errors.RESERVATION_OWNER_CANNOT_RESERVE',
  [ErrorCodes.RESERVATION_EXTENSION_NOT_IN_PROGRESS]: 'reservar.errors.RESERVATION_EXTENSION_NOT_IN_PROGRESS',
  [ErrorCodes.RESERVATION_EXTENSION_INVALID_END_AT]: 'reservar.errors.RESERVATION_EXTENSION_INVALID_END_AT',

  // Home delivery
  [ErrorCodes.VEHICLE_HOME_DELIVERY_NOT_ENABLED]: 'reservar.errors.VEHICLE_HOME_DELIVERY_NOT_ENABLED',
  [ErrorCodes.VEHICLE_HOME_RETURN_NOT_ENABLED]: 'reservar.errors.VEHICLE_HOME_RETURN_NOT_ENABLED',
  [ErrorCodes.HOME_DELIVERY_ADDRESS_REQUIRED]: 'reservar.errors.HOME_DELIVERY_ADDRESS_REQUIRED',
  [ErrorCodes.HOME_RETURN_ADDRESS_REQUIRED]: 'reservar.errors.HOME_RETURN_ADDRESS_REQUIRED',

  // General conflict
  [ErrorCodes.USER_HAS_VEHICLES]: 'error.USER_HAS_VEHICLES',
  [ErrorCodes.USER_HAS_ACTIVE_RESERVATIONS]: 'error.USER_HAS_ACTIVE_RESERVATIONS',
  [ErrorCodes.BANK_ACCOUNT_REQUIRED]: 'error.BANK_ACCOUNT_REQUIRED',
  [ErrorCodes.INSUFFICIENT_BALANCE]: 'error.INSUFFICIENT_BALANCE',

  // Server
  [ErrorCodes.INTERNAL_ERROR]: 'error.INTERNAL_ERROR',
}

export function getErrorMessage(error: unknown): string {
  const problem = error as ProblemDetails | undefined
  const code = problem?.code as ErrorCode | undefined

  if (code && code in errorCodeToKey) {
    const key = errorCodeToKey[code as keyof typeof errorCodeToKey]!
    return t(key)
  }

  if (problem?.detail) {
    return problem.detail
  }

  return t('error.default')
}

export function getErrorDetail(error: unknown): string | null {
  const problem = error as ProblemDetails | undefined
  return problem?.detail ?? null
}

export function getErrorCode(error: unknown): ErrorCode | null {
  const problem = error as ProblemDetails | undefined
  return (problem?.code as ErrorCode | undefined) ?? null
}
