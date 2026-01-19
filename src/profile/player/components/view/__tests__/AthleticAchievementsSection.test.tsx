import { render, screen } from '@testing-library/react';
import { AthleticAchievementsSection } from '../AthleticAchievementsSection';

describe('AthleticAchievementsSection', () => {
    const mockAchievements = [
        { id: '1', icon: 'trophy', title: 'All-State Selection', description: '1st Team WR (2023)', color: 'gold' },
        { id: '2', icon: 'medal', title: 'District MVP', description: 'Unanimous Choice', color: 'blue' },
    ];

    it('renders section title', () => {
        render(<AthleticAchievementsSection achievements={mockAchievements} />);

        expect(screen.getByText('Achievements & Honors')).toBeInTheDocument();
    });

    it('renders all achievements', () => {
        render(<AthleticAchievementsSection achievements={mockAchievements} />);

        expect(screen.getByText('All-State Selection')).toBeInTheDocument();
        expect(screen.getByText('1st Team WR (2023)')).toBeInTheDocument();
        expect(screen.getByText('District MVP')).toBeInTheDocument();
        expect(screen.getByText('Unanimous Choice')).toBeInTheDocument();
    });

    it('has correct section id for navigation', () => {
        const { container } = render(<AthleticAchievementsSection achievements={mockAchievements} />);

        const section = container.querySelector('section');
        expect(section).toHaveAttribute('id', 'achievements');
    });
});
