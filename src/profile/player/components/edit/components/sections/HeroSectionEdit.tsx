import React, { useState, useEffect, useMemo } from 'react';
import { TextInput } from '../inputs/TextInput';
import { SelectInput } from '../inputs/SelectInput';
import { ActionButtons } from './ActionButtons';
import { TypeaheadInput } from '@/components/common/TypeaheadInput';
import {
    getAllSportNames,
    getPositionsForSport,
    getEventsForSport,
    hasSportPositions,
    hasSportEvents
} from '@/constants/sports';
import { getAllDivisions } from '@/constants/divisions';
import type { Hero, HeroSectionEditProps } from '../../../../types';

export function HeroSectionEdit({
    formData,
    setFormData,
    errors,
    isSaving,
    onSave,
    onCancel,
}: HeroSectionEditProps) {
    const [allSports] = useState<string[]>(getAllSportNames());
    const [sportError, setSportError] = useState<string | undefined>(errors.sport);
    const [positionEventError, setPositionEventError] = useState<string | undefined>(errors.position);

    // State for position/event field
    const [selectedSport, setSelectedSport] = useState(formData.sport || '');
    const [positionEventType, setPositionEventType] = useState<'position' | 'event'>('position');
    const [availablePositionsEvents, setAvailablePositionsEvents] = useState<string[]>([]);

    useEffect(() => {
        setSportError(errors.sport);
    }, [errors.sport]);

    useEffect(() => {
        setPositionEventError(errors.position);
    }, [errors.position]);

    // Initialize position/event options when component mounts with existing sport
    useEffect(() => {
        if (formData.sport) {
            const hasEvents = hasSportEvents(formData.sport);
            const hasPositions = hasSportPositions(formData.sport);

            if (hasEvents && !hasPositions) {
                setPositionEventType('event');
                setAvailablePositionsEvents(getEventsForSport(formData.sport));
            } else {
                setPositionEventType('position');
                setAvailablePositionsEvents(getPositionsForSport(formData.sport));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    // Determine field label and no results message
    const positionEventLabel = useMemo(() => {
        return positionEventType === 'event' ? 'Event' : 'Position';
    }, [positionEventType]);

    const positionEventPlaceholder = useMemo(() => {
        return positionEventType === 'event'
            ? 'e.g., 100m Freestyle, High Jump'
            : 'e.g., Point Guard, Quarterback';
    }, [positionEventType]);

    const positionEventNoResultsMessage = useMemo(() => {
        return positionEventType === 'event' ? 'No events found' : 'No positions found';
    }, [positionEventType]);

    const handleFieldChange = (field: keyof Hero, value: string | number) => {
        setFormData((prev) => {
            const next: Hero = { ...prev, [field]: value };

            // Auto-derive numeric search fields from display strings
            if (field === 'height' && typeof value === 'string') {
                const match = value.match(/^(\d+)'(\d+)/);
                if (match) {
                    next.heightInches = parseInt(match[1]) * 12 + parseInt(match[2]);
                } else {
                    const inches = parseInt(value);
                    if (!isNaN(inches)) next.heightInches = inches;
                }
            }
            if (field === 'weight' && typeof value === 'string') {
                const lbs = parseInt(value);
                if (!isNaN(lbs)) next.weightLbs = lbs;
            }

            return next;
        });
    };

    const handleSportChange = (sport: string) => {
        // Validate sport selection
        const isValidSport = allSports.some(s => s.toLowerCase() === sport.toLowerCase());

        if (sport && !isValidSport) {
            setSportError('Please select a sport from the list');
        } else {
            setSportError(undefined);
        }

        // Update selected sport state
        setSelectedSport(sport);

        // Clear position/event when sport changes
        handleFieldChange('sport', sport);
        handleFieldChange('position', '');
        setPositionEventError(undefined);

        // Determine if sport has positions or events
        if (sport) {
            const hasEvents = hasSportEvents(sport);
            const hasPositions = hasSportPositions(sport);

            if (hasEvents && !hasPositions) {
                // Sport has events (e.g., Swimming, Track & Field)
                setPositionEventType('event');
                setAvailablePositionsEvents(getEventsForSport(sport));
            } else {
                // Sport has positions (e.g., Soccer, Football) or both
                setPositionEventType('position');
                setAvailablePositionsEvents(getPositionsForSport(sport));
            }
        } else {
            // No sport selected, clear options
            setAvailablePositionsEvents([]);
        }
    };

    const handlePositionEventChange = (value: string) => {
        // Validate position/event selection
        if (value && selectedSport) {
            const isValid = availablePositionsEvents.some(
                opt => opt.toLowerCase() === value.toLowerCase()
            );

            if (!isValid) {
                setPositionEventError(`Please select a valid ${positionEventType} from the list`);
            } else {
                setPositionEventError(undefined);
            }
        } else {
            setPositionEventError(undefined);
        }

        handleFieldChange('position', value);
    };

    const initials = `${formData.firstName?.charAt(0) || 'F'}${formData.lastName?.charAt(0) || 'L'}`;

    const sectionHeadingStyle: React.CSSProperties = { color: 'var(--text-hi)', fontSize: '1.1rem', fontWeight: 700 };
    const iconBoxStyle: React.CSSProperties = { background: 'var(--ink-3)', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>
                {/* Header */}
                <div
                    className="px-6 py-8 sm:px-8 sm:py-10"
                    style={{
                        background: `radial-gradient(ellipse 80% 120% at 0% 50%, oklch(68% 0.22 150 / 0.15) 0%, transparent 60%), var(--ink-2)`,
                        borderBottom: '1px solid var(--ink-3)',
                    }}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ border: '3px solid var(--brand-500)', background: 'var(--ink-3)' }}>
                            <span className="text-2xl font-bold" style={{ color: 'var(--brand-500)' }}>{initials}</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-hi)' }}>Edit Profile</h2>
                            <p style={{ color: 'var(--text-lo)' }}>Update your athletic profile information</p>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-6 sm:p-8 space-y-6">
                    {/* Personal Information Section */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2" style={sectionHeadingStyle}>
                            <div style={iconBoxStyle}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--brand-500)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            Personal Information
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextInput
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={(value: string) => handleFieldChange('firstName', value)}
                                    error={errors.firstName}
                                    required
                                    disabled={isSaving}
                                />
                                <TextInput
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={(value: string) => handleFieldChange('lastName', value)}
                                    error={errors.lastName}
                                    required
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Athletic Information Section */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2" style={sectionHeadingStyle}>
                            <div style={iconBoxStyle}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--brand-500)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            Athletic Information
                        </h3>
                        <div className="space-y-4">
                            <TypeaheadInput
                                label="Sport"
                                name="sport"
                                value={formData.sport || ''}
                                options={allSports}
                                onChange={handleSportChange}
                                error={sportError}
                                disabled={isSaving}
                                placeholder="e.g., Basketball, Soccer, Football"
                                minChars={3}
                                noResultsMessage="No sports found"
                            />
                            <TypeaheadInput
                                label={positionEventLabel}
                                name="position"
                                value={formData.position || ''}
                                options={availablePositionsEvents}
                                onChange={handlePositionEventChange}
                                error={positionEventError}
                                disabled={isSaving || !selectedSport}
                                placeholder={!selectedSport ? 'Please select a sport first' : positionEventPlaceholder}
                                minChars={3}
                                noResultsMessage={positionEventNoResultsMessage}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextInput
                                    label="Height"
                                    name="height"
                                    value={formData.height}
                                    onChange={(value: string) => handleFieldChange('height', value)}
                                    error={errors.height}
                                    placeholder="e.g., 6'2&quot;"
                                    disabled={isSaving}
                                />
                                <TextInput
                                    label="Weight"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={(value: string) => handleFieldChange('weight', value)}
                                    error={errors.weight}
                                    placeholder="e.g., 185 lbs"
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                    </div>

                    {/* School Information Section */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2" style={sectionHeadingStyle}>
                            <div style={iconBoxStyle}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--brand-500)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                            </div>
                            School Information
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextInput
                                    label="School"
                                    name="school"
                                    value={formData.school}
                                    onChange={(value: string) => handleFieldChange('school', value)}
                                    error={errors.school}
                                    disabled={isSaving}
                                    placeholder="e.g., Lincoln High School"
                                />
                                <TextInput
                                    label="Location"
                                    name="location"
                                    value={formData.location}
                                    onChange={(value: string) => handleFieldChange('location', value)}
                                    error={errors.location}
                                    disabled={isSaving}
                                    placeholder="e.g., Los Angeles, CA"
                                />
                            </div>
                            <TextInput
                                label="Class Year"
                                name="classYear"
                                value={formData.classYear}
                                onChange={(value: string) => handleFieldChange('classYear', value)}
                                error={errors.classYear}
                                disabled={isSaving}
                                placeholder="e.g., 2025"
                            />
                        </div>
                    </div>

                    {/* Recruitment Information Section */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2" style={sectionHeadingStyle}>
                            <div style={iconBoxStyle}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--brand-500)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            Recruitment Information
                        </h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-mid)' }}>
                            This information helps coaches find you in their athlete search. All fields are optional but recommended for better visibility.
                        </p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectInput
                                    label="Desired Division"
                                    name="desiredDivision"
                                    value={formData.desiredDivision || ''}
                                    onChange={(value: string) => handleFieldChange('desiredDivision', value)}
                                    error={errors.desiredDivision}
                                    disabled={isSaving}
                                    options={getAllDivisions().map(d => ({ value: d, label: d }))}
                                    placeholder="Select a division"
                                />
                                <TextInput
                                    label="Affordable Amount ($)"
                                    name="affordableAmount"
                                    type="number"
                                    value={formData.affordableAmount?.toString() || ''}
                                    onChange={(value: string) => handleFieldChange('affordableAmount', value ? parseFloat(value) : undefined as any)}
                                    error={errors.affordableAmount}
                                    disabled={isSaving}
                                    placeholder="e.g., 10000"
                                    min={0}
                                    step={1000}
                                />
                            </div>
                            <div className="rounded-lg p-4" style={{ background: 'oklch(68% 0.22 150 / 0.08)', border: '1px solid oklch(68% 0.22 150 / 0.25)' }}>
                                <p className="text-sm" style={{ color: 'var(--text-mid)' }}>
                                    <strong>Note:</strong> The "Affordable Amount" is the amount you can afford to pay per year for college.
                                    This helps coaches understand your financial situation and match you with appropriate scholarship opportunities.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Status Information Section */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2" style={sectionHeadingStyle}>
                            <div style={iconBoxStyle}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--brand-500)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            Status Information
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextInput
                                    label="Academic Standing"
                                    name="academicStanding"
                                    value={formData.academicStanding || ''}
                                    onChange={(value: string) => handleFieldChange('academicStanding', value)}
                                    error={errors.academicStanding}
                                    disabled={isSaving}
                                    placeholder="e.g., Honor Roll, Dean's List, Good Standing"
                                />
                                <TextInput
                                    label="Recruitment Status"
                                    name="recruitmentStatus"
                                    value={formData.recruitmentStatus || ''}
                                    onChange={(value: string) => handleFieldChange('recruitmentStatus', value)}
                                    error={errors.recruitmentStatus}
                                    disabled={isSaving}
                                    placeholder="e.g., Open, Committed, Closed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Additional Information Section */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2" style={sectionHeadingStyle}>
                            <div style={iconBoxStyle}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--brand-500)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            Additional Information
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextInput
                                    label="Date of Birth"
                                    name="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth || ''}
                                    onChange={(value: string) => handleFieldChange('dateOfBirth', value)}
                                    error={errors.dateOfBirth}
                                    disabled={isSaving}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                <TextInput
                                    label="Profile Image URL"
                                    name="profileImage"
                                    value={formData.profileImage || ''}
                                    onChange={(value: string) => handleFieldChange('profileImage', value)}
                                    error={errors.profileImage}
                                    disabled={isSaving}
                                    placeholder="https://example.com/profile.jpg"
                                />
                            </div>
                            <div className="rounded-lg p-4" style={{ background: 'oklch(68% 0.22 150 / 0.08)', border: '1px solid oklch(68% 0.22 150 / 0.25)' }}>
                                <p className="text-sm" style={{ color: 'var(--text-mid)' }}>
                                    <strong>Note:</strong> Your age will be automatically calculated from your date of birth. You must be at least 13 years old to use this platform.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6" style={{ borderTop: '1px solid var(--ink-3)' }}>
                        <ActionButtons
                            onSave={onSave}
                            onCancel={onCancel}
                            isSaving={isSaving}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
