import { describe, it, expect } from 'vitest'
import { LEVEL_DISCOUNT_PCT } from '../constants'

describe('LEVEL_DISCOUNT_PCT', () => {
  it('bronze da 0% de descuento', () => {
    expect(LEVEL_DISCOUNT_PCT.bronze).toBe(0)
  })

  it('silver da 5%', () => {
    expect(LEVEL_DISCOUNT_PCT.silver).toBe(5)
  })

  it('gold da 10%', () => {
    expect(LEVEL_DISCOUNT_PCT.gold).toBe(10)
  })

  it('platinum da 15%', () => {
    expect(LEVEL_DISCOUNT_PCT.platinum).toBe(15)
  })
})
