'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllSportNames } from '@/constants/sports';
import { getAllDivisions } from '@/constants/divisions';
import type { ScholarshipFormProps, ScholarshipFormData, FieldProps, FormTextInputProps, FormSelectInputProps } from '../types';

const CURRENT_YEAR = new Date().getFullYear();
const START_YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR + i);
const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6];

type FormErrors = Partial<Record<keyof ScholarshipFormData, string>>;

function validateForm(data: ScholarshipFormData): FormErrors {
    const errors: FormErrors = {};

    if (!data.playerEmail.trim()) {
        errors.playerEmail = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.playerEmail)) {
        errors.playerEmail = 'Enter a valid email address.';
    }
    if (!data.playerId) errors.playerEmail = 'Player not found — enter a registered player email.';
    if (!data.schoolName.trim()) errors.schoolName = 'School name is required.';
    if (!data.sport) errors.sport = 'Sport is required.';

    if (data.scholarshipAmount === '') {
        errors.scholarshipAmount = 'Scholarship amount is required.';
    } else if (Number(data.scholarshipAmount) <= 0) {
        errors.scholarshipAmount = 'Scholarship amount must be greater than 0.';
    }

    if (data.requiredGpa === '') {
        errors.requiredGpa = 'Required GPA is required.';
    } else {
        const gpa = Number(data.requiredGpa);
        if (gpa < 0 || gpa > 4.0) errors.requiredGpa = 'GPA must be between 0.0 and 4.0.';
    }

    if (!data.startYear) errors.startYear = 'Start year is required.';
    if (!data.durationYears) errors.durationYears = 'Duration is required.';

    return errors;
}

const EMPTY_FORM: ScholarshipFormData = {
    playerId: '',
    playerFirstName: '',
    playerLastName: '',
    playerEmail: '',
    schoolName: '',
    sport: '',
    scholarshipAmount: '',
    requiredGpa: '',
    division: '',
    startYear: '',
    durationYears: '',
    notes: '',
};

type LookupState = 'idle' | 'loading' | 'found' | 'not_found' | 'error';

export function ScholarshipForm({ coachId, initialData, existingScholarship, onSuccess }: ScholarshipFormProps) {
    const router = useRouter();
    const isEditing = Boolean(existingScholarship);

    const [formData, setFormData] = useState<ScholarshipFormData>(() => ({
        ...EMPTY_FORM,
        ...(existingScholarship
            ? {
                playerId: existingScholarship.playerId,
                playerFirstName: existingScholarship.playerFirstName ?? '',
                playerLastName: existingScholarship.playerLastName ?? '',
                playerEmail: existingScholarship.playerEmail ?? '',
                schoolName: existingScholarship.schoolName,
                sport: existingScholarship.sport,
                scholarshipAmount: existingScholarship.scholarshipAmount,
                requiredGpa: existingScholarship.requiredGpa,
                division: existingScholarship.division ?? '',
                startYear: existingScholarship.startYear ?? '',
                durationYears: existingScholarship.durationYears ?? '',
                notes: existingScholarship.notes ?? '',
            }
            : initialData ?? {}),
    }));

    // When pre-populated from a player card, the player is already resolved
    const [lookupState, setLookupState] = useState<LookupState>(
        existingScholarship || initialData?.playerId ? 'found' : 'idle'
    );

    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const handleChange = (field: keyof ScholarshipFormData, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
        }
    };

    // When the email field changes, clear the resolved player so the coach must re-lookup
    const handleEmailChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            playerEmail: value,
            playerId: '',
            playerFirstName: '',
            playerLastName: '',
        }));
        setLookupState('idle');
        if (errors.playerEmail) {
            setErrors((prev) => { const next = { ...prev }; delete next.playerEmail; return next; });
        }
    };

    // Lookup player by email on blur
    const handleEmailBlur = async () => {
        const email = formData.playerEmail.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
        // Already resolved for this email (e.g. editing mode)
        if (formData.playerId) return;

        setLookupState('loading');
        try {
            const res = await fetch(`/api/players/lookup?email=${encodeURIComponent(email)}`);
            const json = await res.json();

            if (res.ok && json.success) {
                setFormData((prev) => ({
                    ...prev,
                    playerId: json.data.id,
                    playerFirstName: json.data.firstName,
                    playerLastName: json.data.lastName,
                }));
                setLookupState('found');
                // Clear any prior email error
                setErrors((prev) => { const next = { ...prev }; delete next.playerEmail; return next; });
            } else if (res.status === 404) {
                setLookupState('not_found');
            } else {
                setLookupState('error');
            }
        } catch {
            setLookupState('error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setSubmitting(true);
        setServerError(null);

        try {
            const url = isEditing
                ? `/api/coach/${coachId}/scholarships/${existingScholarship!.playerId}`
                : `/api/coach/${coachId}/scholarships`;
            const method = isEditing ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const json = await res.json();
            if (!res.ok) {
                setServerError(json.error ?? 'Something went wrong. Please try again.');
                return;
            }

            onSuccess?.(json.data);
            router.push(`/coach/${coachId}/scholarships`);
        } catch {
            setServerError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const sportNames = getAllSportNames();
    const divisions = getAllDivisions();

    return (
        <form onSubmit={handleSubmit} noValidate aria-label="Scholarship offer form">
            {serverError && (
                <div
                    role="alert"
                    className="mb-6 p-3 rounded-lg text-sm"
                    style={{
                        background: 'oklch(65% 0.24 25 / 0.12)',
                        border: '1px solid oklch(65% 0.24 25 / 0.3)',
                        color: 'var(--status-danger)',
                    }}
                >
                    {serverError}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* ── Email lookup — always first ── */}
                <div className="md:col-span-2">
                    <label
                        htmlFor="playerEmail"
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: 'var(--text-mid)' }}
                    >
                        Player Email
                        <span className="ml-0.5" style={{ color: 'var(--status-danger)' }} aria-hidden="true">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="playerEmail"
                            type="email"
                            value={formData.playerEmail}
                            onChange={(e) => handleEmailChange(e.target.value)}
                            onBlur={isEditing ? undefined : handleEmailBlur}
                            placeholder="player@example.com"
                            readOnly={isEditing}
                            aria-invalid={Boolean(errors.playerEmail)}
                            aria-describedby={errors.playerEmail ? 'playerEmail-error' : 'playerEmail-hint'}
                            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
                            style={{
                                background: isEditing ? 'var(--ink-3)' : 'var(--ink-2)',
                                border: `1px solid ${errors.playerEmail ? 'var(--status-danger)' : 'var(--ink-3)'}`,
                                color: 'var(--text-hi)',
                                paddingRight: lookupState !== 'idle' ? '2.5rem' : undefined,
                            }}
                        />
                        {/* Lookup status icon */}
                        {lookupState === 'loading' && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Looking up player…">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--text-lo)' }}>
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                            </span>
                        )}
                        {lookupState === 'found' && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Player found">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--brand-500)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </span>
                        )}
                        {(lookupState === 'not_found' || lookupState === 'error') && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Player not found">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--status-danger)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </span>
                        )}
                    </div>
                    {errors.playerEmail && (
                        <p id="playerEmail-error" role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>
                            {errors.playerEmail}
                        </p>
                    )}
                    {!errors.playerEmail && lookupState === 'not_found' && (
                        <p className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>
                            No player found with that email address.
                        </p>
                    )}
                    {!errors.playerEmail && lookupState === 'error' && (
                        <p className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>
                            Lookup failed — please try again.
                        </p>
                    )}
                    {!errors.playerEmail && lookupState === 'idle' && !isEditing && (
                        <p id="playerEmail-hint" className="mt-1 text-xs" style={{ color: 'var(--text-lo)' }}>
                            Enter the player&apos;s registered email to auto-fill their details.
                        </p>
                    )}
                </div>

                {/* ── Auto-filled name fields ── */}
                <Field label="Player First Name" id="playerFirstName" error={errors.playerFirstName}>
                    <input
                        id="playerFirstName"
                        type="text"
                        value={formData.playerFirstName}
                        readOnly
                        placeholder="Auto-filled from email lookup"
                        aria-readonly="true"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                            background: 'var(--ink-3)',
                            border: '1px solid var(--ink-3)',
                            color: lookupState === 'found' ? 'var(--text-hi)' : 'var(--text-lo)',
                            cursor: 'default',
                        }}
                    />
                </Field>

                <Field label="Player Last Name" id="playerLastName" error={errors.playerLastName}>
                    <input
                        id="playerLastName"
                        type="text"
                        value={formData.playerLastName}
                        readOnly
                        placeholder="Auto-filled from email lookup"
                        aria-readonly="true"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                            background: 'var(--ink-3)',
                            border: '1px solid var(--ink-3)',
                            color: lookupState === 'found' ? 'var(--text-hi)' : 'var(--text-lo)',
                            cursor: 'default',
                        }}
                    />
                </Field>

                {/* ── Offer terms ── */}
                <Field label="School Name" id="schoolName" required error={errors.schoolName} className="md:col-span-2">
                    <TextInput
                        id="schoolName"
                        value={formData.schoolName}
                        onChange={(v) => handleChange('schoolName', v)}
                        placeholder="University name"
                        hasError={Boolean(errors.schoolName)}
                    />
                </Field>

                <Field label="Sport" id="sport" required error={errors.sport}>
                    <SelectInput
                        id="sport"
                        value={formData.sport}
                        onChange={(v) => handleChange('sport', v)}
                        hasError={Boolean(errors.sport)}
                    >
                        <option value="">Select sport</option>
                        {sportNames.map((s) => <option key={s} value={s}>{s}</option>)}
                    </SelectInput>
                </Field>

                <Field label="Division" id="division" error={errors.division}>
                    <SelectInput
                        id="division"
                        value={formData.division}
                        onChange={(v) => handleChange('division', v)}
                        hasError={Boolean(errors.division)}
                    >
                        <option value="">Select division (optional)</option>
                        {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                    </SelectInput>
                </Field>

                <Field label="Scholarship Amount ($)" id="scholarshipAmount" required error={errors.scholarshipAmount}>
                    <TextInput
                        id="scholarshipAmount"
                        type="number"
                        value={formData.scholarshipAmount === '' ? '' : String(formData.scholarshipAmount)}
                        onChange={(v) => handleChange('scholarshipAmount', v === '' ? '' : Number(v))}
                        placeholder="e.g. 25000"
                        min="0.01"
                        step="0.01"
                        hasError={Boolean(errors.scholarshipAmount)}
                    />
                </Field>

                <Field label="Required GPA" id="requiredGpa" required error={errors.requiredGpa}>
                    <TextInput
                        id="requiredGpa"
                        type="number"
                        value={formData.requiredGpa === '' ? '' : String(formData.requiredGpa)}
                        onChange={(v) => handleChange('requiredGpa', v === '' ? '' : Number(v))}
                        placeholder="e.g. 3.0"
                        min="0"
                        max="4.0"
                        step="0.01"
                        hasError={Boolean(errors.requiredGpa)}
                    />
                </Field>

                <Field label="Start Year" id="startYear" required error={errors.startYear}>
                    <SelectInput
                        id="startYear"
                        value={formData.startYear === '' ? '' : String(formData.startYear)}
                        onChange={(v) => handleChange('startYear', v === '' ? '' : Number(v))}
                        hasError={Boolean(errors.startYear)}
                    >
                        <option value="">Select year</option>
                        {START_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </SelectInput>
                </Field>

                <Field label="Duration (years)" id="durationYears" required error={errors.durationYears}>
                    <SelectInput
                        id="durationYears"
                        value={formData.durationYears === '' ? '' : String(formData.durationYears)}
                        onChange={(v) => handleChange('durationYears', v === '' ? '' : Number(v))}
                        hasError={Boolean(errors.durationYears)}
                    >
                        <option value="">Select duration</option>
                        {DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d} {d === 1 ? 'year' : 'years'}</option>)}
                    </SelectInput>
                </Field>

                <Field label="Notes" id="notes" error={errors.notes} className="md:col-span-2">
                    <textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="Additional notes or conditions (optional)"
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg text-sm resize-none focus:outline-none focus:ring-2"
                        style={{
                            background: 'var(--ink-2)',
                            border: '1px solid var(--ink-3)',
                            color: 'var(--text-hi)',
                        }}
                    />
                </Field>
            </div>

            <div className="mt-8 flex items-center gap-3">
                <button
                    type="submit"
                    disabled={submitting || (!isEditing && lookupState !== 'found')}
                    className="px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                    onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = 'var(--brand-600)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand-500)'; }}
                >
                    {submitting ? 'Saving…' : isEditing ? 'Update Offer' : 'Send Offer'}
                </button>
                <button
                    type="button"
                    onClick={() => router.push(`/coach/${coachId}/scholarships`)}
                    className="px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                    style={{ background: 'var(--ink-3)', color: 'var(--text-mid)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink-3)')}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

// ── Internal sub-components ──────────────────────────────────────────────────

function Field({ label, id, required, error, children, className = '' }: FieldProps) {
    return (
        <div className={className}>
            <label htmlFor={id} className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-mid)' }}>
                {label}{required && <span className="ml-0.5" style={{ color: 'var(--status-danger)' }} aria-hidden="true">*</span>}
            </label>
            {children}
            {error && (
                <p id={`${id}-error`} role="alert" className="mt-1 text-xs" style={{ color: 'var(--status-danger)' }}>
                    {error}
                </p>
            )}
        </div>
    );
}

function TextInput({ id, value, onChange, placeholder, type = 'text', min, max, step, hasError }: FormTextInputProps) {
    return (
        <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            aria-invalid={hasError}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{
                background: 'var(--ink-2)',
                border: `1px solid ${hasError ? 'var(--status-danger)' : 'var(--ink-3)'}`,
                color: 'var(--text-hi)',
            }}
        />
    );
}

function SelectInput({ id, value, onChange, hasError, children }: FormSelectInputProps) {
    return (
        <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={hasError}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{
                background: 'var(--ink-2)',
                border: `1px solid ${hasError ? 'var(--status-danger)' : 'var(--ink-3)'}`,
                color: 'var(--text-hi)',
            }}
        >
            {children}
        </select>
    );
}
