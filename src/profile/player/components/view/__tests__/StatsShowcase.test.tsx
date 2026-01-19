import { render, screen } from '@testing-library/react';
import { StatsShowcase } from '../StatsShowcase';

describe('StatsShowcase', () => {
    const mockStats = {
        receivingYards: 1250,
        touchdowns: 12,
        receptions: 68,
        yardsPerCatch: 18.4,
        longestReception: 78,
    };

    it('renders section title', () => {
        render(<StatsShowcase stats={mockStats} />);

        expect(screen.getByText('Season Statistics')).toBeInTheDocument();
    });

    it('renders all stat cards', () => {
        render(<StatsShowcase stats={mockStats} />);

        expect(screen.getByText('1,250')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('68')).toBeInTheDocument();
        expect(screen.getByText('18.4')).toBeInTheDocument();
        expect(screen.getByText('78')).toBeInTheDocument();
    });

    it('renders stat labels', () => {
        render(<StatsShowcase stats={mockStats} />);

        expect(screen.getByText('Receiving Yards')).toBeInTheDocument();
        expect(screen.getByText('Touchdowns')).toBeInTheDocument();
        expect(screen.getByText('Receptions')).toBeInTheDocument();
        expect(screen.getByText('Yards/Catch')).toBeInTheDocument();
        expect(screen.getByText('Longest Reception')).toBeInTheDocument();
    });

    it('has correct section id for navigation', () => {
        const { container } = render(<StatsShowcase stats={mockStats} />);

        const section = container.querySelector('section');
        expect(section).toHaveAttribute('id', 'stats');
    });
});
