import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

/**
 * Custom render function that wraps components with common providers
 * Extend this as needed when you add providers like Redux, Theme, etc.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

/**
 * Re-export everything from React Testing Library
 */
export * from '@testing-library/react'
export { renderWithProviders as render }
