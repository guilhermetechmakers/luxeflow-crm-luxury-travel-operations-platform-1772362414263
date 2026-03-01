/**
 * Unit tests for resort-bible-utils
 */
import { describe, it, expect } from 'vitest'
import { safeArrayAccess, ensureArray, toNullableArray } from './resort-bible-utils'

describe('safeArrayAccess', () => {
  it('returns empty array for null', () => {
    expect(safeArrayAccess(null)).toEqual([])
  })

  it('returns empty array for undefined', () => {
    expect(safeArrayAccess(undefined)).toEqual([])
  })

  it('returns empty array for non-array', () => {
    expect(safeArrayAccess('not array' as unknown as unknown[])).toEqual([])
  })

  it('returns array for valid array', () => {
    const arr = [1, 2, 3]
    expect(safeArrayAccess(arr)).toBe(arr)
  })
})

describe('ensureArray', () => {
  it('returns empty array for null', () => {
    expect(ensureArray(null)).toEqual([])
  })

  it('returns empty array for undefined', () => {
    expect(ensureArray(undefined)).toEqual([])
  })

  it('returns empty array for non-array', () => {
    expect(ensureArray({} as unknown as unknown[])).toEqual([])
  })

  it('returns input for valid array', () => {
    const arr = ['a', 'b']
    expect(ensureArray(arr)).toBe(arr)
  })
})

describe('toNullableArray', () => {
  it('returns empty array for null', () => {
    expect(toNullableArray(null)).toEqual([])
  })

  it('returns empty array for undefined', () => {
    expect(toNullableArray(undefined)).toEqual([])
  })

  it('returns array for valid array', () => {
    const arr = [1, 2]
    expect(toNullableArray(arr)).toEqual([1, 2])
  })
})
