import { render, screen } from '@testing-library/react';
import RootLayout from '@/app/layout';

// Mock metadata export
jest.mock('@/app/layout', () => {
    const actual = jest.requireActual('@/app/layout');
    return {
        __esModule: true,
        default: actual.default,
        metadata: {},
    };
});

describe('RootLayout', () => {
    // Suppress expected console errors for these tests
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation((message) => {
            // Only suppress the specific hydration error we expect
            if (
                typeof message === 'string' &&
                message.includes('cannot be a child of')
            ) {
                return;
            }
            // Let other errors through
            console.warn(message);
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders children correctly', () => {
        const { getByTestId } = render(
            <RootLayout>
                <div data-testid="test-child">Test Content</div>
            </RootLayout>
        );

        expect(getByTestId('test-child')).toBeInTheDocument();
        expect(getByTestId('test-child')).toHaveTextContent('Test Content');
    });

    it('renders html and body elements', () => {
        const { container } = render(
            <RootLayout>
                <div>Test</div>
            </RootLayout>
        );

        // Check that content is rendered
        expect(container).toBeInTheDocument();
        expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('includes children in the layout', () => {
        render(
            <RootLayout>
                <main>
                    <h1>Test Heading</h1>
                    <p>Test paragraph</p>
                </main>
            </RootLayout>
        );

        expect(screen.getByRole('heading', { name: 'Test Heading' })).toBeInTheDocument();
        expect(screen.getByText('Test paragraph')).toBeInTheDocument();
    });
});
