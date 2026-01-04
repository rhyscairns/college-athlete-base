import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders the home page', () => {
    render(<Home />)
    
    // Check if the page renders without crashing
    expect(document.body).toBeInTheDocument()
  })

  it('contains expected content', () => {
    render(<Home />)
    
    // Add specific assertions based on your page content
    // This is a basic example that should be updated based on actual content
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
  })
})
