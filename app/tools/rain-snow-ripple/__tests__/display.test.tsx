import { describe, it, expect } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import DisplayUI from '../DisplayUI'
import { DEFAULT_CONFIG } from '../config'

describe('RainSnowRipple DisplayUI', () => {
  it('renders without crash', () => {
    const { container } = render(<DisplayUI config={DEFAULT_CONFIG} />)
    expect(container.querySelector('canvas')).toBeTruthy()
  })
})
