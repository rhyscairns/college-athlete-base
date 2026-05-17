import { render, screen } from '@testing-library/react';
import { EarningsCharts } from '@/earnings/components/EarningsCharts';
import type { MonthlyDataPoint } from '@/earnings/types';

// Recharts uses ResizeObserver — polyfill for jsdom
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

const mockSeries: MonthlyDataPoint[] = [
    { month: '2025-01', tier1Players: 5, tier2Players: 2, tier3Players: 1, earnings: 6.5 },
    { month: '2025-02', tier1Players: 8, tier2Players: 3, tier3Players: 2, earnings: 10.5 },
];

describe('EarningsCharts', () => {
    it('renders without crashing with empty data', () => {
        render(<EarningsCharts monthlySeries={[]} />);
        expect(screen.getByTestId('earnings-charts')).toBeInTheDocument();
    });

    it('shows "No data yet" placeholders when series is empty', () => {
        render(<EarningsCharts monthlySeries={[]} />);
        const noDataMessages = screen.getAllByText('No data yet');
        expect(noDataMessages).toHaveLength(2);
    });

    it('renders without crashing with populated data', () => {
        render(<EarningsCharts monthlySeries={mockSeries} />);
        expect(screen.getByTestId('earnings-charts')).toBeInTheDocument();
    });

    it('renders the bar chart container with populated data', () => {
        render(<EarningsCharts monthlySeries={mockSeries} />);
        expect(screen.getByTestId('players-bar-chart')).toBeInTheDocument();
    });

    it('renders the line chart container with populated data', () => {
        render(<EarningsCharts monthlySeries={mockSeries} />);
        expect(screen.getByTestId('earnings-line-chart')).toBeInTheDocument();
    });

    it('renders section headings', () => {
        render(<EarningsCharts monthlySeries={mockSeries} />);
        expect(screen.getByText('Players signed up per month')).toBeInTheDocument();
        expect(screen.getByText('Monthly earnings')).toBeInTheDocument();
    });

    it('does not show "No data yet" when data is present', () => {
        render(<EarningsCharts monthlySeries={mockSeries} />);
        expect(screen.queryByText('No data yet')).not.toBeInTheDocument();
    });
});
