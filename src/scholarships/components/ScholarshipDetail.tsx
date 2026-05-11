'use client';

import { useState } from 'react';
import { ScholarshipStatusBadge } from './ScholarshipStatusBadge';
import type { ScholarshipDetailProps, Scholarship, CounterFormData, CounterFormErrors } from '../types';

function validateCounter(data: CounterFormData): CounterFormErrors {
    const errors: CounterFormErrors = {};
    if (data.counterAmount !== '' && Number(data.counterAmount) <= 0) {
        errors.counterAmount = 'Amount must be greater than 0.';
    }
    if (data.counterGpa !== '') {
        const gpa = Number(data.counterGpa);
        if (gpa < 0 || gpa > 4.0) errors.counterGpa = 'GPA must be between 0.0 and 4.0.';
    }
    return errors;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-6 py-3" style={{ borderBottom: '1px solid var(--ink-3)' }}>
            <dt className="text-sm font-medium shrink-0" style={{ color: 'var(--text-mid)' }}>{label}</dt>
            <dd className="text-sm text-right" style={{ color: 'var(--text-hi)', wordBreak: 'break-word' }}>{value ?? '—'}</dd>
        </div>
    );
}

const STATUS_BANNERS = {
    accepted: {
        text: '✓ Scholarship Accepted',
        background: 'oklch(68% 0.22 150 / 0.12)',
        border: 'oklch(68% 0.22 150 / 0.3)',
        color: 'oklch(68% 0.22 150)',
    },
    rejected: {
        text: '✗ Scholarship Rejected',
        background: 'oklch(65% 0.24 25 / 0.12)',
        border: 'oklch(65% 0.24 25 / 0.3)',
        color: 'var(--status-danger)',
    },
    countered: {
        text: 'Counter offer sent — awaiting coach response.',
        background: 'oklch(75% 0.18 85 / 0.12)',
        border: 'oklch(75% 0.18 85 / 0.3)',
        color: 'oklch(75% 0.18 85)',
    },
} as const;

export function ScholarshipDetail({ scholarship: initialScholarship, playerId, coachId, onStatusChange, userType = 'player' }: ScholarshipDetailProps & { userType?: 'coach' | 'player' }) {
    const [scholarship, setScholarship] = useState<Scholarship>(initialScholarship);
    const [showCounterForm, setShowCounterForm] = useState(false);
    const [counterForm, setCounterForm] = useState<CounterFormData>({ counterAmount: '', counterGpa: '', counterNotes: '' });
    const [counterErrors, setCounterErrors] = useState<CounterFormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const isPending = scholarship.status === 'pending';
    const bannerConfig = STATUS_BANNERS[scholarship.status as keyof typeof STATUS_BANNERS];

    const handleAction = async (action: 'accepted' | 'rejected') => {
        setSubmitting(true);
        setServerError(null);
        try {
            const res = await fetch(`/api/player/${playerId}/scholarships/${coachId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action }),
            });
            const json = await res.json();
            if (!res.ok) {
                setServerError(json.error ?? 'Something went wrong.');
                return;
            }
            setScholarship(json.data);
            onStatusChange?.(json.data);
        } catch {
            setServerError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCounterChange = (field: keyof CounterFormData, value: string) => {
        setCounterForm((prev) => ({ ...prev, [field]: value }));
        if (counterErrors[field as keyof CounterFormErrors]) {
            setCounterErrors((prev) => { const next = { ...prev }; delete next[field as keyof CounterFormErrors]; return next; });
        }
    };

    const handleCounterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateCounter(counterForm);
        if (Object.keys(errors).length > 0) {
            setCounterErrors(errors);
            return;
        }

        setSubmitting(true);
        setServerError(null);
        try {
            const body: Record<string, unknown> = { status: 'countered', counterNotes: counterForm.counterNotes };
            if (counterForm.counterAmount !== '') body.counterAmount = Number(counterForm.counterAmount);
            if (counterForm.counterGpa !== '') body.counterGpa = Number(counterForm.counterGpa);

            const res = await fetch(`/api/player/${playerId}/scholarships/${coachId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (!res.ok) {
                setServerError(json.error ?? 'Something went wrong.');
                return;
            }
            setScholarship(json.data);
            onStatusChange?.(json.data);
            setShowCounterForm(false);
        } catch {
            setServerError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rounded-xl p-6" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-hi)' }}>
                        {scholarship.schoolName}
                    </h2>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-lo)' }}>
                        {scholarship.coachFirstName} {scholarship.coachLastName}
                    </p>
                </div>
                <ScholarshipStatusBadge status={scholarship.status} />
            </div>

            {/* Status banner for non-pending states */}
            {bannerConfig && (
                <div
                    role="status"
                    data-testid={`status-banner-${scholarship.status}`}
                    className="mb-6 p-3 rounded-lg text-sm font-medium"
                    style={{
                        background: bannerConfig.background,
                        border: `1px solid ${bannerConfig.border}`,
                        color: bannerConfig.color,
                    }}
                >
                    {bannerConfig.text}
                </div>
            )}

            {serverError && (
                <div
                    role="alert"
                    className="mb-4 p-3 rounded-lg text-sm"
                    style={{
                        background: 'oklch(65% 0.24 25 / 0.12)',
                        border: '1px solid oklch(65% 0.24 25 / 0.3)',
                        color: 'var(--status-danger)',
                    }}
                >
                    {serverError}
                </div>
            )}

            {/* Offer details */}
            <dl>
                <DetailRow label="Sport" value={scholarship.sport} />
                <DetailRow label="Division" value={scholarship.division} />
                <DetailRow
                    label={userType === 'player' ? 'Contribution Required' : 'Scholarship Amount'}
                    value={
                        userType === 'player'
                            ? `$${scholarship.scholarshipAmount.toLocaleString()} / year`
                            : `$${scholarship.scholarshipAmount.toLocaleString()}`
                    }
                />
                <DetailRow label="Required GPA" value={scholarship.requiredGpa} />
                <DetailRow label="Start Year" value={scholarship.startYear} />
                <DetailRow label="Duration" value={scholarship.durationYears ? `${scholarship.durationYears} ${scholarship.durationYears === 1 ? 'year' : 'years'}` : null} />
                {scholarship.notes && <DetailRow label="Notes" value={scholarship.notes} />}
                {scholarship.counterNotes && (
                    <DetailRow
                        label="Counter Notes"
                        value={
                            <span style={{ color: 'oklch(75% 0.18 85)' }}>{scholarship.counterNotes}</span>
                        }
                    />
                )}
                {scholarship.counterAmount != null && (
                    <DetailRow label="Counter Amount" value={`$${scholarship.counterAmount.toLocaleString()}`} />
                )}
                {scholarship.counterGpa != null && (
                    <DetailRow label="Counter GPA" value={scholarship.counterGpa} />
                )}
            </dl>

            {/* Action buttons — only shown when pending */}
            {isPending && !showCounterForm && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3" data-testid="action-buttons">
                    <button
                        onClick={() => handleAction('accepted')}
                        disabled={submitting}
                        aria-label="Accept scholarship offer"
                        className="px-5 py-2 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'oklch(68% 0.22 150 / 0.2)', border: '1px solid oklch(68% 0.22 150 / 0.4)', color: 'oklch(68% 0.22 150)' }}
                    >
                        Accept
                    </button>
                    <button
                        onClick={() => handleAction('rejected')}
                        disabled={submitting}
                        aria-label="Reject scholarship offer"
                        className="px-5 py-2 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'oklch(65% 0.24 25 / 0.12)', border: '1px solid oklch(65% 0.24 25 / 0.3)', color: 'var(--status-danger)' }}
                    >
                        Reject
                    </button>
                    <button
                        onClick={() => setShowCounterForm(true)}
                        disabled={submitting}
                        aria-label="Counter scholarship offer"
                        className="px-5 py-2 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'oklch(75% 0.18 85 / 0.15)', border: '1px solid oklch(75% 0.18 85 / 0.4)', color: 'oklch(75% 0.18 85)' }}
                    >
                        Counter Offer
                    </button>
                </div>
            )}

            {/* Inline counter form */}
            {isPending && showCounterForm && (
                <form
                    onSubmit={handleCounterSubmit}
                    data-testid="counter-form"
                    className="mt-6 p-4 rounded-lg"
                    style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}
                    aria-label="Counter offer form"
                >
                    <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-hi)' }}>Counter Offer</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="counterAmount" className="block text-xs font-medium mb-1" style={{ color: 'var(--text-mid)' }}>
                                Proposed Amount ($)
                            </label>
                            <input
                                id="counterAmount"
                                type="number"
                                value={counterForm.counterAmount}
                                onChange={(e) => handleCounterChange('counterAmount', e.target.value)}
                                placeholder={String(scholarship.scholarshipAmount)}
                                min="0.01"
                                step="0.01"
                                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                                style={{
                                    background: 'var(--ink-1)',
                                    border: `1px solid ${counterErrors.counterAmount ? 'var(--status-danger)' : 'var(--ink-3)'}`,
                                    color: 'var(--text-hi)',
                                }}
                            />
                            {counterErrors.counterAmount && (
                                <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>
                                    {counterErrors.counterAmount}
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="counterGpa" className="block text-xs font-medium mb-1" style={{ color: 'var(--text-mid)' }}>
                                Proposed GPA
                            </label>
                            <input
                                id="counterGpa"
                                type="number"
                                value={counterForm.counterGpa}
                                onChange={(e) => handleCounterChange('counterGpa', e.target.value)}
                                placeholder={String(scholarship.requiredGpa)}
                                min="0"
                                max="4.0"
                                step="0.01"
                                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                                style={{
                                    background: 'var(--ink-1)',
                                    border: `1px solid ${counterErrors.counterGpa ? 'var(--status-danger)' : 'var(--ink-3)'}`,
                                    color: 'var(--text-hi)',
                                }}
                            />
                            {counterErrors.counterGpa && (
                                <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>
                                    {counterErrors.counterGpa}
                                </p>
                            )}
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="counterNotes" className="block text-xs font-medium mb-1" style={{ color: 'var(--text-mid)' }}>
                                Counter Notes
                            </label>
                            <textarea
                                id="counterNotes"
                                value={counterForm.counterNotes}
                                onChange={(e) => handleCounterChange('counterNotes', e.target.value)}
                                placeholder="Explain your counter offer…"
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg text-sm resize-none focus:outline-none focus:ring-2"
                                style={{
                                    background: 'var(--ink-1)',
                                    border: '1px solid var(--ink-3)',
                                    color: 'var(--text-hi)',
                                }}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                        >
                            {submitting ? 'Sending…' : 'Send Counter'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowCounterForm(false)}
                            className="px-5 py-2 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                            style={{ background: 'var(--ink-3)', color: 'var(--text-mid)' }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
