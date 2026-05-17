'use client';

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import type { MonthlyDataPoint } from '../types';

interface EarningsChartsProps {
    monthlySeries: MonthlyDataPoint[];
}

/**
 * Renders two charts:
 * 1. Stacked bar chart — players signed up per month, broken down by tier.
 * 2. Line chart — monthly earnings over time.
 * Requirements: 4.3, 4.4
 */
export function EarningsCharts({ monthlySeries }: EarningsChartsProps) {
    const hasData = monthlySeries.length > 0;

    const emptyStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-lo)',
        fontSize: '0.875rem',
    };

    return (
        <div className="flex flex-col gap-6" data-testid="earnings-charts">
            {/* Bar chart — players per month */}
            <div
                className="rounded-xl p-4"
                style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}
            >
                <h3
                    className="text-sm font-semibold mb-4"
                    style={{ color: 'var(--text-mid)' }}
                >
                    Players signed up per month
                </h3>
                <div style={{ height: 220 }} data-testid="players-bar-chart">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlySeries} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-3)" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: 'var(--text-lo)', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fill: 'var(--text-lo)', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--ink-2)',
                                        border: '1px solid var(--ink-3)',
                                        borderRadius: 8,
                                        color: 'var(--text-hi)',
                                        fontSize: 12,
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: 12, color: 'var(--text-mid)' }}
                                />
                                <Bar dataKey="tier1Players" name="Tier 1" stackId="a" fill="oklch(68% 0.22 150)" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="tier2Players" name="Tier 2" stackId="a" fill="oklch(68% 0.22 220)" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="tier3Players" name="Tier 3" stackId="a" fill="oklch(68% 0.22 280)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={emptyStyle}>No data yet</div>
                    )}
                </div>
            </div>

            {/* Line chart — monthly earnings */}
            <div
                className="rounded-xl p-4"
                style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}
            >
                <h3
                    className="text-sm font-semibold mb-4"
                    style={{ color: 'var(--text-mid)' }}
                >
                    Monthly earnings
                </h3>
                <div style={{ height: 220 }} data-testid="earnings-line-chart">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlySeries} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-3)" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: 'var(--text-lo)', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                                    tick={{ fill: 'var(--text-lo)', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Earnings']}
                                    contentStyle={{
                                        background: 'var(--ink-2)',
                                        border: '1px solid var(--ink-3)',
                                        borderRadius: 8,
                                        color: 'var(--text-hi)',
                                        fontSize: 12,
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="earnings"
                                    name="Earnings"
                                    stroke="oklch(68% 0.22 150)"
                                    strokeWidth={2}
                                    dot={{ fill: 'oklch(68% 0.22 150)', r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={emptyStyle}>No data yet</div>
                    )}
                </div>
            </div>
        </div>
    );
}
