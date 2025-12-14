import { describe, it, expect } from 'vitest'
import { DEFAULT_CONFIG } from '../config'

describe('RainSnowRipple config', () => {
  it('has essential keys', () => {
    expect(DEFAULT_CONFIG.text).toBeDefined()
    expect(DEFAULT_CONFIG.rainSpeed).toBeGreaterThan(0)
    expect(DEFAULT_CONFIG.snowDensity).toBeGreaterThanOrEqual(0)
  })
})
