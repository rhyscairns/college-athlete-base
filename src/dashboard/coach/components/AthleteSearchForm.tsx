'use client';

import { useState, useEffect } from 'react';
import { AthleteSearchFormProps, SearchCriteria, FormErrors } from '../types';
import { getAllSportNames, getPositionsForSport } from '@/constants/sports';
import { getAllDivisions } from '@/constants/divisions';
import { US_STATES_LIST } from '@/authentication/constants';
import { CountrySelect } from '@/authentication/components/CountrySelect';
import { heightToInches } from '../utils/search';

const inputCls = 'w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';
const inputStyle = { background: 'var(--ink-2)', border: '1px solid var(--ink-3)', color: 'var(--text-hi)' };
const inputErrorStyle = { ...inputStyle, border: '1px solid var(--status-danger)' };
const labelStyle = { color: 'var(--text-mid)' };
const errorStyle = { color: 'var(--status-danger)' };

function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
    return (
        <label htmlFor={htmlFor} className="block text-sm font-medium mb-1.5" style={labelStyle}>
            {children}
        </label>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 text-xs" style={errorStyle} role="alert">{message}</p>;
}

export function AthleteSearchForm({ onSubmit, onCancel, isSubmitting }: AthleteSearchFormProps) {
    const [formData, setFormData] = useState<SearchCriteria>({ country: 'USA' });
    const [errors, setErrors] = useState<FormErrors>({});
    const [positions, setPositions] = useState<string[]>([]);

    const sportOptions = getAllSportNames();
    const divisionOptions = getAllDivisions();

    useEffect(() => {
        if (formData.sport) {
            const sportPositions = getPositionsForSport(formData.sport);
            setPositions(sportPositions);
            if (formData.position && !sportPositions.includes(formData.position)) {
                setFormData(prev => ({ ...prev, position: undefined }));
            }
        } else {
            setPositions([]);
            setFormData(prev => ({ ...prev, position: undefined }));
        }
    }, [formData.sport, formData.position]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (formData.gpaMin !== undefined && formData.gpaMax !== undefined && formData.gpaMin > formData.gpaMax) {
            newErrors.gpa = 'Min GPA cannot exceed max GPA';
        }
        if (formData.gpaMin !== undefined && (formData.gpaMin < 0 || formData.gpaMin > 4.0)) {
            newErrors.gpa = 'GPA must be between 0.0 and 4.0';
        }
        if (formData.gpaMax !== undefined && (formData.gpaMax < 0 || formData.gpaMax > 4.0)) {
            newErrors.gpa = 'GPA must be between 0.0 and 4.0';
        }
        if (formData.heightMin || formData.heightMax) {
            const minIn = formData.heightMin ? heightToInches(formData.heightMin) : null;
            const maxIn = formData.heightMax ? heightToInches(formData.heightMax) : null;
            if (formData.heightMin && minIn === null) newErrors.height = "Invalid height format — use 5'10\" or 70";
            if (formData.heightMax && maxIn === null) newErrors.height = "Invalid height format — use 5'10\" or 70";
            if (minIn !== null && maxIn !== null && minIn > maxIn) newErrors.height = 'Min height cannot exceed max height';
        }
        if (formData.weightMin !== undefined && formData.weightMax !== undefined && formData.weightMin > formData.weightMax) {
            newErrors.weight = 'Min weight cannot exceed max weight';
        }
        if (formData.affordableAmount !== undefined && formData.affordableAmount < 0) {
            newErrors.affordableAmount = 'Amount must be non-negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        await onSubmit(formData);
    };

    const handleClearAll = () => {
        setFormData({ country: 'USA' });
        setErrors({});
        setPositions([]);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">

            {/* Sport + Position */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="sport">Sport</Label>
                    <select
                        id="sport"
                        value={formData.sport || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, sport: e.target.value || undefined }))}
                        disabled={isSubmitting}
                        className={inputCls}
                        style={inputStyle}
                    >
                        <option value="">All sports</option>
                        {sportOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {formData.sport && positions.length > 0 && (
                    <div>
                        <Label htmlFor="position">Position</Label>
                        <select
                            id="position"
                            value={formData.position || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value || undefined }))}
                            disabled={isSubmitting}
                            className={inputCls}
                            style={inputStyle}
                        >
                            <option value="">All positions</option>
                            {positions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Division */}
            <div>
                <Label htmlFor="desiredDivision">Desired Division</Label>
                <select
                    id="desiredDivision"
                    value={formData.desiredDivision || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, desiredDivision: e.target.value || undefined }))}
                    disabled={isSubmitting}
                    className={inputCls}
                    style={inputStyle}
                >
                    <option value="">Any division</option>
                    {divisionOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            {/* GPA + Affordable Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label>GPA Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={formData.gpaMin ?? ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, gpaMin: e.target.value ? parseFloat(e.target.value) : undefined }))}
                            disabled={isSubmitting}
                            min="0" max="4.0" step="0.1"
                            className={inputCls}
                            style={errors.gpa ? inputErrorStyle : inputStyle}
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            value={formData.gpaMax ?? ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, gpaMax: e.target.value ? parseFloat(e.target.value) : undefined }))}
                            disabled={isSubmitting}
                            min="0" max="4.0" step="0.1"
                            className={inputCls}
                            style={errors.gpa ? inputErrorStyle : inputStyle}
                        />
                    </div>
                    <FieldError message={errors.gpa} />
                </div>

                <div>
                    <Label htmlFor="affordableAmount">Scholarship Needed ($)</Label>
                    <input
                        id="affordableAmount"
                        type="number"
                        placeholder="e.g. 10,000"
                        value={formData.affordableAmount ?? ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, affordableAmount: e.target.value ? parseFloat(e.target.value) : undefined }))}
                        disabled={isSubmitting}
                        min="0" step="1000"
                        className={inputCls}
                        style={errors.affordableAmount ? inputErrorStyle : inputStyle}
                    />
                    <FieldError message={errors.affordableAmount} />
                </div>
            </div>

            {/* Height + Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label>Height (e.g. 5&apos;10&quot;)</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            placeholder="Min"
                            value={formData.heightMin ?? ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, heightMin: e.target.value || undefined }))}
                            disabled={isSubmitting}
                            className={inputCls}
                            style={errors.height ? inputErrorStyle : inputStyle}
                        />
                        <input
                            type="text"
                            placeholder="Max"
                            value={formData.heightMax ?? ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, heightMax: e.target.value || undefined }))}
                            disabled={isSubmitting}
                            className={inputCls}
                            style={errors.height ? inputErrorStyle : inputStyle}
                        />
                    </div>
                    <FieldError message={errors.height} />
                </div>

                <div>
                    <Label>Weight (lbs)</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={formData.weightMin ?? ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, weightMin: e.target.value ? parseFloat(e.target.value) : undefined }))}
                            disabled={isSubmitting}
                            min="0" step="1"
                            className={inputCls}
                            style={errors.weight ? inputErrorStyle : inputStyle}
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            value={formData.weightMax ?? ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, weightMax: e.target.value ? parseFloat(e.target.value) : undefined }))}
                            disabled={isSubmitting}
                            min="0" step="1"
                            className={inputCls}
                            style={errors.weight ? inputErrorStyle : inputStyle}
                        />
                    </div>
                    <FieldError message={errors.weight} />
                </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CountrySelect
                    label="Country"
                    name="country"
                    value={formData.country || 'USA'}
                    onChange={(val) => setFormData(prev => ({ ...prev, country: val, state: undefined }))}
                    disabled={isSubmitting}
                    extraOptions={[{ value: 'international', label: 'All International' }]}
                />

                {formData.country === 'USA' && (
                    <div>
                        <Label htmlFor="state">State</Label>
                        <select
                            id="state"
                            value={formData.state || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value || undefined }))}
                            disabled={isSubmitting}
                            className={inputCls}
                            style={inputStyle}
                        >
                            <option value="">All States</option>
                            {US_STATES_LIST.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid var(--ink-3)' }} />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'var(--ink-3)', color: 'var(--text-mid)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink-3)')}
                >
                    Clear All
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'transparent', color: 'var(--text-mid)', border: '1px solid var(--ink-3)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-3)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                    onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = 'var(--brand-600)'; }}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--brand-500)')}
                >
                    {isSubmitting ? 'Searching…' : 'Search'}
                </button>
            </div>
        </form>
    );
}
