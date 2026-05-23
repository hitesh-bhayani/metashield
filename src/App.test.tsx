import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders landing state with drop zone', () => {
    render(<App />)
    expect(screen.getByText(/MetaShield/i)).toBeInTheDocument()
    expect(screen.getByText(/Drop an image or PDF/i)).toBeInTheDocument()
    expect(screen.getByText(/100% in your browser/i)).toBeInTheDocument()
  })
})
