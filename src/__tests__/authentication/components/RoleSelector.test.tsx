import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoleSelector } from '@/authentication/components/RoleSelector';

describe('RoleSelector', () => {
    it('renders the role selection label', () => {
        const mockOnSelectRole = jest.fn();
        render(<RoleSelector onSelectRole={mockOnSelectRole} />);

        expect(screen.getByText('I am a...')).toBeInTheDocument();
        expect(screen.getByText('OR, SIGN UP WITH EMAIL')).toBeInTheDocument();
    });

    it('renders both Player and Coach role options', () => {
        const mockOnSelectRole = jest.fn();
        render(<RoleSelector onSelectRole={mockOnSelectRole} />);

        expect(screen.getByRole('button', { name: /register as player/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /register as coach/i })).toBeInTheDocument();
    });

    it('displays Player role label', () => {
        const mockOnSelectRole = jest.fn();
        render(<RoleSelector onSelectRole={mockOnSelectRole} />);

        const playerLabel = screen.getByText('Player');
        expect(playerLabel).toBeInTheDocument();
        expect(playerLabel).toHaveClass('font-bold');
    });

    it('displays Coach role label', () => {
        const mockOnSelectRole = jest.fn();
        render(<RoleSelector onSelectRole={mockOnSelectRole} />);

        const coachLabel = screen.getByText('Coach');
        expect(coachLabel).toBeInTheDocument();
        expect(coachLabel).toHaveClass('font-bold');
    });

    it('calls onSelectRole with "player" when Player button is clicked', async () => {
        const user = userEvent.setup();
        const mockOnSelectRole = jest.fn();
        render(<RoleSelector onSelectRole={mockOnSelectRole} />);

        const playerButton = screen.getByRole('button', { name: /register as player/i });
        await user.click(playerButton);

        expect(mockOnSelectRole).toHaveBeenCalledTimes(1);
        expect(mockOnSelectRole).toHaveBeenCalledWith('player');
    });

    it('calls onSelectRole with "coach" when Coach button is clicked', async () => {
        const user = userEvent.setup();
        const mockOnSelectRole = jest.fn();
        render(<RoleSelector onSelectRole={mockOnSelectRole} />);

        const coachButton = screen.getByRole('button', { name: /register as coach/i });
        await user.click(coachButton);

        expect(mockOnSelectRole).toHaveBeenCalledTimes(1);
        expect(mockOnSelectRole).toHaveBeenCalledWith('coach');
    });

    it('has proper accessibility attributes', () => {
        const mockOnSelectRole = jest.fn();
        render(<RoleSelector onSelectRole={mockOnSelectRole} />);

        const playerButton = screen.getByRole('button', { name: /register as player/i });
        const coachButton = screen.getByRole('button', { name: /register as coach/i });

        expect(playerButton).toHaveAttribute('aria-label', 'Register as Player');
        expect(coachButton).toHaveAttribute('aria-label', 'Register as Coach');
    });

    it('renders role icons', () => {
        const mockOnSelectRole = jest.fn();
        render(<RoleSelector onSelectRole={mockOnSelectRole} />);

        // Check for the presence of the role headings which indicate the cards are rendered
        expect(screen.getByText('Player')).toBeInTheDocument();
        expect(screen.getByText('Coach')).toBeInTheDocument();
    });
});
