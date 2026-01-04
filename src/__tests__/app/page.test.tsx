import { redirect } from 'next/navigation';
import Home from '@/app/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login page', () => {
    Home();

    expect(redirect).toHaveBeenCalledWith('/login');
  });
})
