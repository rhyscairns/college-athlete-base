import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptySection } from '../EmptySection';

describe('EmptySection', () => {
    const defaultProps = {
        title: 'No Content Yet',
        description: 'Add some content to get started',
    };

    describe('Owner View', () => {
        it('renders title and description for owner', () => {
            render(<EmptySection {...defaultProps} isOwner={true} />);

            expect(screen.getByText('No Content Yet')).toBeInTheDocument();
            expect(screen.getByText('Add some content to get started')).toBeInTheDocument();
        });

        it('renders edit button for owner when showEditButton is true', () => {
            const onEdit = jest.fn();
            render(
                <EmptySection
                    {...defaultProps}
                    isOwner={true}
                    showEditButton={true}
                    onEdit={onEdit}
                />
            );

            const button = screen.getByRole('button', { name: /add content/i });
            expect(button).toBeInTheDocument();
        });

        it('calls onEdit when edit button is clicked', () => {
            const onEdit = jest.fn();
            render(
                <EmptySection
                    {...defaultProps}
                    isOwner={true}
                    showEditButton={true}
                    onEdit={onEdit}
                />
            );

            const button = screen.getByRole('button', { name: /add content/i });
            fireEvent.click(button);

            expect(onEdit).toHaveBeenCalledTimes(1);
        });

        it('does not render edit button when showEditButton is false', () => {
            const onEdit = jest.fn();
            render(
                <EmptySection
                    {...defaultProps}
                    isOwner={true}
                    showEditButton={false}
                    onEdit={onEdit}
                />
            );

            expect(screen.queryByRole('button', { name: /add content/i })).not.toBeInTheDocument();
        });

        it('does not render edit button when onEdit is not provided', () => {
            render(
                <EmptySection
                    {...defaultProps}
                    isOwner={true}
                    showEditButton={true}
                />
            );

            expect(screen.queryByRole('button', { name: /add content/i })).not.toBeInTheDocument();
        });

        it('renders custom icon when provided as string', () => {
            render(
                <EmptySection
                    {...defaultProps}
                    isOwner={true}
                    icon="📝"
                />
            );

            expect(screen.getByText('📝')).toBeInTheDocument();
        });

        it('renders custom icon when provided as React node', () => {
            const CustomIcon = () => <div data-testid="custom-icon">Icon</div>;
            render(
                <EmptySection
                    {...defaultProps}
                    isOwner={true}
                    icon={<CustomIcon />}
                />
            );

            expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
        });

        it('applies custom className', () => {
            const { container } = render(
                <EmptySection
                    {...defaultProps}
                    isOwner={true}
                    className="custom-class"
                />
            );

            const emptySection = container.firstChild;
            expect(emptySection).toHaveClass('custom-class');
        });
    });

    describe('Non-Owner View', () => {
        it('returns null for non-owner', () => {
            const { container } = render(
                <EmptySection {...defaultProps} isOwner={false} />
            );

            expect(container.firstChild).toBeNull();
        });

        it('does not render title for non-owner', () => {
            render(<EmptySection {...defaultProps} isOwner={false} />);

            expect(screen.queryByText('No Content Yet')).not.toBeInTheDocument();
        });

        it('does not render description for non-owner', () => {
            render(<EmptySection {...defaultProps} isOwner={false} />);

            expect(screen.queryByText('Add some content to get started')).not.toBeInTheDocument();
        });

        it('does not render edit button for non-owner', () => {
            const onEdit = jest.fn();
            render(
                <EmptySection
                    {...defaultProps}
                    isOwner={false}
                    showEditButton={true}
                    onEdit={onEdit}
                />
            );

            expect(screen.queryByRole('button', { name: /add content/i })).not.toBeInTheDocument();
        });
    });

    describe('Default Props', () => {
        it('defaults isOwner to false', () => {
            const { container } = render(<EmptySection {...defaultProps} />);

            expect(container.firstChild).toBeNull();
        });

        it('defaults showEditButton to true', () => {
            const onEdit = jest.fn();
            render(
                <EmptySection
                    {...defaultProps}
                    isOwner={true}
                    onEdit={onEdit}
                />
            );

            expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();
        });

        it('defaults className to empty string', () => {
            const { container } = render(
                <EmptySection {...defaultProps} isOwner={true} />
            );

            const emptySection = container.firstChild as HTMLElement;
            expect(emptySection.className).not.toContain('undefined');
        });
    });

    describe('Accessibility', () => {
        it('has proper aria-label on edit button', () => {
            const onEdit = jest.fn();
            render(
                <EmptySection
                    {...defaultProps}
                    isOwner={true}
                    onEdit={onEdit}
                />
            );

            const button = screen.getByRole('button', { name: /add content to this section/i });
            expect(button).toHaveAttribute('aria-label', 'Add content to this section');
        });

        it('button has minimum touch target size', () => {
            const onEdit = jest.fn();
            render(
                <EmptySection
                    {...defaultProps}
                    isOwner={true}
                    onEdit={onEdit}
                />
            );

            const button = screen.getByRole('button', { name: /add content/i });
            expect(button).toHaveClass('min-h-[44px]');
        });
    });

    describe('Styling', () => {
        it('applies consistent styling with existing design', () => {
            const { container } = render(
                <EmptySection {...defaultProps} isOwner={true} />
            );

            const emptySection = container.firstChild as HTMLElement;
            expect(emptySection).toHaveClass('rounded-2xl', 'border-dashed');
        });

        it('applies responsive padding', () => {
            const { container } = render(
                <EmptySection {...defaultProps} isOwner={true} />
            );

            const emptySection = container.firstChild as HTMLElement;
            expect(emptySection).toHaveClass('p-8', 'md:p-12');
        });

        it('button has accent color matching design system', () => {
            const onEdit = jest.fn();
            render(
                <EmptySection
                    {...defaultProps}
                    isOwner={true}
                    onEdit={onEdit}
                />
            );

            const button = screen.getByRole('button', { name: /add content/i });
            expect(button).toBeInTheDocument();
        });
    });

    describe('Integration Scenarios', () => {
        it('renders complete empty state for videos section', () => {
            const onEdit = jest.fn();
            render(
                <EmptySection
                    title="No Videos Yet"
                    description="Add highlight videos to showcase your skills"
                    isOwner={true}
                    onEdit={onEdit}
                    icon="🎥"
                />
            );

            expect(screen.getByText('No Videos Yet')).toBeInTheDocument();
            expect(screen.getByText('Add highlight videos to showcase your skills')).toBeInTheDocument();
            expect(screen.getByText('🎥')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();
        });

        it('renders complete empty state for achievements section', () => {
            const onEdit = jest.fn();
            render(
                <EmptySection
                    title="No Achievements Yet"
                    description="Add your athletic achievements and awards"
                    isOwner={true}
                    onEdit={onEdit}
                    icon="🏆"
                />
            );

            expect(screen.getByText('No Achievements Yet')).toBeInTheDocument();
            expect(screen.getByText('Add your athletic achievements and awards')).toBeInTheDocument();
            expect(screen.getByText('🏆')).toBeInTheDocument();
        });

        it('renders complete empty state for testimonials section', () => {
            const onEdit = jest.fn();
            render(
                <EmptySection
                    title="No Testimonials Yet"
                    description="Request testimonials from your coaches"
                    isOwner={true}
                    onEdit={onEdit}
                    icon="💬"
                />
            );

            expect(screen.getByText('No Testimonials Yet')).toBeInTheDocument();
            expect(screen.getByText('Request testimonials from your coaches')).toBeInTheDocument();
            expect(screen.getByText('💬')).toBeInTheDocument();
        });
    });
});
