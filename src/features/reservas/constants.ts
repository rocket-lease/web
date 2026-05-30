/**
 * Cota dura para el largo del campo `reason` cuando el rentador rechaza una
 * reserva o una extensión. Igual al `.max(280)` del schema en contracts
 * (`RejectReservationRequestSchema`). Si la validación de contracts cambia,
 * sincronizar acá.
 */
export const RESERVATION_REJECT_REASON_MAX_CHARS = 280
