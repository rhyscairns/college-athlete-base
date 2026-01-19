import { render, screen } from '@testing-library/react';
import { AcademicProfileSection } from '../AcademicProfileSection';

describe('AcademicProfileSection', () => {
    const mockAcademic = {
        gpa: 3.8,
        gpaScale: '4.0 Scale',
        satScore: 1350,
        satMath: 680,
        satReading: 670,
        classRank: 'Top 10%',
        classRankDetail: '45 out of 450 Students',
        ncaaEligibilityCenter: '#2345678901',
        ncaaQualifier: true,
        coursework: ['AP Calculus AB', 'AP Physics', 'National Honor Society'],
    };

    it('renders section title', () => {
        render(<AcademicProfileSection academic={mockAcademic} />);

        expect(screen.getByText('Academic Profile')).toBeInTheDocument();
    });

    it('renders GPA information', () => {
        render(<AcademicProfileSection academic={mockAcademic} />);

        expect(screen.getByText('3.8')).toBeInTheDocument();
        expect(screen.getByText('4.0 Scale')).toBeInTheDocument();
    });

    it('renders test scores', () => {
        render(<AcademicProfileSection academic={mockAcademic} />);

        expect(screen.getByText(/SAT: 1350/)).toBeInTheDocument();
        expect(screen.getByText(/Math: 680/)).toBeInTheDocument();
    });

    it('renders class rank', () => {
        render(<AcademicProfileSection academic={mockAcademic} />);

        expect(screen.getByText('Top 10%')).toBeInTheDocument();
        expect(screen.getByText('45 out of 450 Students')).toBeInTheDocument();
    });

    it('renders NCAA eligibility', () => {
        render(<AcademicProfileSection academic={mockAcademic} />);

        expect(screen.getByText('NCAA Eligible')).toBeInTheDocument();
        expect(screen.getByText('#2345678901')).toBeInTheDocument();
    });

    it('renders coursework', () => {
        render(<AcademicProfileSection academic={mockAcademic} />);

        expect(screen.getByText('AP Calculus AB')).toBeInTheDocument();
        expect(screen.getByText('AP Physics')).toBeInTheDocument();
        expect(screen.getByText('National Honor Society')).toBeInTheDocument();
    });

    it('has correct section id for navigation', () => {
        const { container } = render(<AcademicProfileSection academic={mockAcademic} />);

        const section = container.querySelector('section');
        expect(section).toHaveAttribute('id', 'academics');
    });
});
