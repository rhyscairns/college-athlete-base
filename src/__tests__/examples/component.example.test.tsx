/**
 * Example test file demonstrating best practices for component testing
 * This file serves as a template for writing new component tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Example component (would be imported from actual component file)
function ExampleComponent({ onSubmit }: { onSubmit?: (value: string) => void }) {
  const [value, setValue] = React.useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(value)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter text"
        data-testid="text-input"
      />
      <button type="submit" data-testid="submit-button">
        Submit
      </button>
    </form>
  )
}

describe('ExampleComponent', () => {
  // Test 1: Basic rendering
  it('renders without crashing', () => {
    render(<ExampleComponent />)
    expect(screen.getByTestId('text-input')).toBeInTheDocument()
  })
  
  // Test 2: User interaction with fireEvent
  it('updates input value on change', () => {
    render(<ExampleComponent />)
    const input = screen.getByTestId('text-input') as HTMLInputElement
    
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(input.value).toBe('test value')
  })
  
  // Test 3: User interaction with userEvent (preferred)
  it('handles user typing', async () => {
    const user = userEvent.setup()
    render(<ExampleComponent />)
    const input = screen.getByTestId('text-input')
    
    await user.type(input, 'Hello World')
    
    expect(input).toHaveValue('Hello World')
  })
  
  // Test 4: Testing callbacks
  it('calls onSubmit with correct value', async () => {
    const handleSubmit = jest.fn()
    const user = userEvent.setup()
    render(<ExampleComponent onSubmit={handleSubmit} />)
    
    const input = screen.getByTestId('text-input')
    const button = screen.getByTestId('submit-button')
    
    await user.type(input, 'test')
    await user.click(button)
    
    expect(handleSubmit).toHaveBeenCalledWith('test')
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })
  
  // Test 5: Async operations with waitFor
  it('handles async operations', async () => {
    render(<ExampleComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('text-input')).toBeInTheDocument()
    })
  })
  
  // Test 6: Testing accessibility
  it('has accessible form elements', () => {
    render(<ExampleComponent />)
    
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    
    const button = screen.getByRole('button', { name: /submit/i })
    expect(button).toBeInTheDocument()
  })
})

// Mock React for this example
const React = {
  useState: (initial: any) => [initial, () => {}],
  FormEvent: {} as any,
}
