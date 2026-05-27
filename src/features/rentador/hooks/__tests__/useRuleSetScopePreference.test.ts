import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRuleSetScopePreference } from '../useRuleSetScopePreference'

const STORAGE_KEY = 'rocket.preferences.ruleSetScopeDefault'

describe('useRuleSetScopePreference', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('devuelve null cuando nunca se guardó preferencia', () => {
    const { result } = renderHook(() => useRuleSetScopePreference())
    expect(result.current.get()).toBeNull()
  })

  it('persiste y recupera SHARED', () => {
    const { result } = renderHook(() => useRuleSetScopePreference())
    result.current.set('SHARED')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('SHARED')
    expect(result.current.get()).toBe('SHARED')
  })

  it('persiste y recupera PRIVATE', () => {
    const { result } = renderHook(() => useRuleSetScopePreference())
    result.current.set('PRIVATE')
    expect(result.current.get()).toBe('PRIVATE')
  })

  it('clear() borra la preferencia', () => {
    const { result } = renderHook(() => useRuleSetScopePreference())
    result.current.set('PRIVATE')
    result.current.clear()
    expect(result.current.get()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('devuelve null cuando localStorage tiene un valor inválido', () => {
    localStorage.setItem(STORAGE_KEY, 'GARBAGE')
    const { result } = renderHook(() => useRuleSetScopePreference())
    expect(result.current.get()).toBeNull()
  })
})
