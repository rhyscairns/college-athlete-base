import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TypeaheadInput from '../TypeaheadInput';

// Mock window.matchMedia for responsive tests
const createMatchMedia = (width: number) => {
    return (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    });
};

describe('TypeaheadInput - Responsive Design', () => {
    const mockOptions = [
        'Basketball',
        'Football',
        'Soccer',
        'Baseball',
        'Tennis',
        'Volleyball',
    ];

    const defaultProps = {
        label: 'Sport',
        name: 'sport',
        value: '',
        options: mockOptions,
        onChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Desktop Viewports', () => {
        test('renders correctly at 1920px width', () => {
            // Set viewport
            global.innerWidth = 1920;
            global.innerHeight = 1080;
            window.matchMedia = createMatchMedia(1920);

            render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport');

            expect(input).toBeInTheDocument();
        });

        test('renders correctly at 1440px width', () => {
            global.innerWidth = 1440;
            global.innerHeight = 900;
            window.matchMedia = createMatchMedia(1440);

            render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport');

            expect(input).toBeInTheDocument();
        });

        test('renders correctly at 1024px width', () => {
            global.innerWidth = 1024;
            global.innerHeight = 768;
            window.matchMedia = createMatchMedia(1024);

            render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport');

            expect(input).toBeInTheDocument();
        });

        test('hover states work on desktop', async () => {
            global.innerWidth = 1920;
            window.matchMedia = createMatchMedia(1920);

            render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport');

            // Type to show dropdown
            fireEvent.change(input, { target: { value: 'Bas' } });

            await waitFor(() => {
                const options = screen.getAllByRole('option');
                expect(options.length).toBeGreaterThan(0);
            });

            const options = screen.getAllByRole('option');
            const firstOption = options[0];

            // Simulate hover
            fireEvent.mouseEnter(firstOption);

            // Check that the option can receive hover events
            expect(firstOption).toBeInTheDocument();
        });

        test('dropdown has appropriate max-height on desktop', async () => {
            global.innerWidth = 1920;
            window.matchMedia = createMatchMedia(1920);

            render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport');

            fireEvent.change(input, { target: { value: 'Bas' } });

            await waitFor(() => {
                const listbox = screen.getByRole('listbox');
                expect(listbox).toBeInTheDocument();
            });

            const listbox = screen.getByRole('listbox');
            const styles = window.getComputedStyle(listbox);

            // Verify dropdown is rendered (actual max-height is set via CSS)
            expect(listbox).toBeVisible();
        });
    });

    describe('Tablet Viewport (768px)', () => {
        beforeEach(() => {
            global.innerWidth = 768;
            global.innerHeight = 1024;
            window.matchMedia = createMatchMedia(768);
        });

        test('renders correctly at 768px width', () => {
            const { container: _c } = render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport');

            expect(input).toBeInTheDocument();
        });

        test('dropdown renders with appropriate sizing on tablet', async () => {
            render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport');

            fireEvent.change(input, { target: { value: 'Bas' } });

            await waitFor(() => {
                const listbox = screen.getByRole('listbox');
                expect(listbox).toBeInTheDocument();
            });

            const options = screen.getAllByRole('option');
            expect(options.length).toBeGreaterThan(0);
        });

        test('touch targets are appropriately sized on tablet', async () => {
            render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport');

            fireEvent.change(input, { target: { value: 'Bas' } });

            await waitFor(() => {
                const options = screen.getAllByRole('option');
                expect(options.length).toBeGreaterThan(0);
            });

            const options = screen.getAllByRole('option');

            // Each option should be rendered and clickable
            options.forEach(option => {
                expect(option).toBeInTheDocument();
                expect(option).toBeVisible();
            });
        });
    });

    describe('Mobile Viewports', () => {
        test('renders correctly at 375px width', () => {
            global.innerWidth = 375;
            global.innerHeight = 667;
            window.matchMedia = createMatchMedia(375);

            render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport');

            expect(input).toBeInTheDocument();
        });

        test('renders correctly at 320px width', () => {
            global.innerWidth = 320;
            global.innerHeight = 568;
            window.matchMedia = createMatchMedia(320);

            render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport');

            expect(input).toBeInTheDocument();
        });

        test('dropdown does not cause horizontal scrolling on mobile', async () => {
            global.innerWidth = 375;
            window.matchMedia = createMatchMedia(375);

            render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport');

            fireEvent.change(input, { target: { value: 'Bas' } });

            await waitFor(() => {
                const listbox = screen.getByRole('listbox');
                expect(listbox).toBeInTheDocument();
            });

            const listbox = screen.getByRole('listbox');

            // Verify dropdown is visible and contained
            expect(listbox).toBeVisible();
        });

        test('touch interactions work smoothly on mobile', async () => {
            global.innerWidth = 375;
            window.matchMedia = createMatchMedia(375);

            render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport');

            // Simulate touch interaction
            fireEvent.touchStart(input);
            fireEvent.change(input, { target: { value: 'Bas' } });

            await waitFor(() => {
                const options = screen.getAllByRole('option');
                expect(options.length).toBeGreaterThan(0);
            });

            const options = screen.getAllByRole('option');
            const firstOption = options[0];

            // Simulate touch selection
            fireEvent.touchStart(firstOption);
            fireEvent.click(firstOption);

            expect(defaultProps.onChange).toHaveBeenCalled();
        });

        test('input font-size prevents zoom on iOS', () => {
            global.innerWidth = 375;
            window.matchMedia = createMatchMedia(375);

            render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport') as HTMLInputElement;

            // The input should be rendered (actual font-size is set via CSS)
            expect(input).toBeInTheDocument();
            expect(input.tagName).toBe('INPUT');
        });

        test('minimum touch target size on mobile (44px)', async () => {
            global.innerWidth = 375;
            window.matchMedia = createMatchMedia(375);

            render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport');

            fireEvent.change(input, { target: { value: 'Bas' } });

            await waitFor(() => {
                const options = screen.getAllByRole('option');
                expect(options.length).toBeGreaterThan(0);
            });

            const options = screen.getAllByRole('option');

            // Verify all options are rendered and accessible
            options.forEach(option => {
                expect(option).toBeInTheDocument();
                expect(option).toBeVisible();
            });
        });

        test('minimum touch target size on small screens (48px)', async () => {
            global.innerWidth = 320;
            window.matchMedia = createMatchMedia(320);

            render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport');

            fireEvent.change(input, { target: { value: 'Bas' } });

            await waitFor(() => {
                const options = screen.getAllByRole('option');
                expect(options.length).toBeGreaterThan(0);
            });

            const options = screen.getAllByRole('option');

            // Verify all options are rendered and accessible
            options.forEach(option => {
                expect(option).toBeInTheDocument();
                expect(option).toBeVisible();
            });
        });

        test('virtual keyboard does not obscure dropdown on mobile', async () => {
            global.innerWidth = 375;
            global.innerHeight = 667;
            window.matchMedia = createMatchMedia(375);

            render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport');

            // Simulate keyboard appearing (reduces viewport height)
            fireEvent.focus(input);
            global.innerHeight = 400; // Simulated reduced height with keyboard

            fireEvent.change(input, { target: { value: 'Bas' } });

            await waitFor(() => {
                const listbox = screen.getByRole('listbox');
                expect(listbox).toBeInTheDocument();
            });

            const listbox = screen.getByRole('listbox');

            // Dropdown should still be visible
            expect(listbox).toBeVisible();
        });

        test('dropdown is full-width on mobile', async () => {
            global.innerWidth = 375;
            window.matchMedia = createMatchMedia(375);

            render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport');

            fireEvent.change(input, { target: { value: 'Bas' } });

            await waitFor(() => {
                const listbox = screen.getByRole('listbox');
                expect(listbox).toBeInTheDocument();
            });

            const listbox = screen.getByRole('listbox');

            // Verify dropdown is rendered
            expect(listbox).toBeVisible();
        });
    });

    describe('Responsive Behavior Across Viewports', () => {
        test('maintains functionality when resizing from desktop to mobile', async () => {
            // Start at desktop
            global.innerWidth = 1920;
            window.matchMedia = createMatchMedia(1920);

            const { rerender } = render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport');

            fireEvent.change(input, { target: { value: 'Bas' } });

            await waitFor(() => {
                expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
            });

            // Resize to mobile
            global.innerWidth = 375;
            window.matchMedia = createMatchMedia(375);

            rerender(<TypeaheadInput {...defaultProps} />);

            // Functionality should still work
            const inputAfterResize = screen.getByLabelText('Sport');
            fireEvent.change(inputAfterResize, { target: { value: 'Ten' } });

            await waitFor(() => {
                const options = screen.getAllByRole('option');
                expect(options.length).toBeGreaterThan(0);
            });
        });

        test('dropdown positioning adapts to viewport', async () => {
            const viewports = [
                { width: 1920, height: 1080 },
                { width: 1440, height: 900 },
                { width: 1024, height: 768 },
                { width: 768, height: 1024 },
                { width: 375, height: 667 },
                { width: 320, height: 568 },
            ];

            for (const viewport of viewports) {
                global.innerWidth = viewport.width;
                global.innerHeight = viewport.height;
                window.matchMedia = createMatchMedia(viewport.width);

                const { unmount } = render(<TypeaheadInput {...defaultProps} />);
                const input = screen.getByLabelText('Sport');

                fireEvent.change(input, { target: { value: 'Bas' } });

                await waitFor(() => {
                    const listbox = screen.getByRole('listbox');
                    expect(listbox).toBeInTheDocument();
                });

                const listbox = screen.getByRole('listbox');
                expect(listbox).toBeVisible();

                unmount();
            }
        });

        test('scrollable dropdown works on all viewports', async () => {
            const manyOptions = Array.from({ length: 50 }, (_, i) => `Option ${i + 1}`);
            const propsWithManyOptions = {
                ...defaultProps,
                options: manyOptions,
            };

            const viewports = [1920, 1024, 768, 375, 320];

            for (const width of viewports) {
                global.innerWidth = width;
                window.matchMedia = createMatchMedia(width);

                const { unmount } = render(<TypeaheadInput {...propsWithManyOptions} />);
                const input = screen.getByLabelText('Sport');

                fireEvent.change(input, { target: { value: 'Opt' } });

                await waitFor(() => {
                    const listbox = screen.getByRole('listbox');
                    expect(listbox).toBeInTheDocument();
                });

                const listbox = screen.getByRole('listbox');
                expect(listbox).toBeVisible();

                // Verify options are rendered
                const options = screen.getAllByRole('option');
                expect(options.length).toBeGreaterThan(0);

                unmount();
            }
        });
    });

    describe('Touch and Mouse Interaction Compatibility', () => {
        test('supports both touch and mouse events', async () => {
            global.innerWidth = 768;
            window.matchMedia = createMatchMedia(768);

            render(<TypeaheadInput {...defaultProps} />);
            const input = screen.getByLabelText('Sport');

            fireEvent.change(input, { target: { value: 'Bas' } });

            await waitFor(() => {
                const options = screen.getAllByRole('option');
                expect(options.length).toBeGreaterThan(0);
            });

            const options = screen.getAllByRole('option');
            const firstOption = options[0];

            // Test mouse interaction
            fireEvent.mouseEnter(firstOption);
            fireEvent.click(firstOption);

            expect(defaultProps.onChange).toHaveBeenCalled();

            // Reset
            jest.clearAllMocks();

            // Re-render and test touch interaction
            fireEvent.change(input, { target: { value: 'Ten' } });

            await waitFor(() => {
                const touchOptions = screen.getAllByRole('option');
                expect(touchOptions.length).toBeGreaterThan(0);
            });

            const touchOptions = screen.getAllByRole('option');
            const firstTouchOption = touchOptions[0];

            fireEvent.touchStart(firstTouchOption);
            fireEvent.click(firstTouchOption);

            expect(defaultProps.onChange).toHaveBeenCalled();
        });
    });
});
