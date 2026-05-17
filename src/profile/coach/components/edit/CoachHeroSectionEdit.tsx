import React, { useCallback, useRef, useEffect, useState } from 'react';
import { TextInput } from '../../../../authentication/components/TextInput';
import { EmailInput } from '../../../../authentication/components/EmailInput';
import type { CoachHeroSectionEditProps, CoachProfile, Achievement } from '../../types';

export const CoachHeroSectionEdit = React.memo(function CoachHeroSectionEdit({
    formData,
    setFormData,
    errors,
    isSaving,
    onSave,
    onCancel,
}: CoachHeroSectionEditProps) {
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [newAchievement, setNewAchievement] = useState({ title: '', year: '' });

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const handleFieldChange = useCallback((field: keyof CoachProfile, value: string) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, [setFormData]);

    const handleAddAchievement = useCallback(() => {
        if (!newAchievement.title.trim()) return;

        const achievement: Achievement = {
            title: newAchievement.title.trim(),
            year: newAchievement.year ? parseInt(newAchievement.year) : undefined,
        };

        setFormData((prev) => ({
            ...prev,
            achievements: [...(prev.achievements || []), achievement],
        }));

        setNewAchievement({ title: '', year: '' });
    }, [newAchievement, setFormData]);

    const handleRemoveAchievement = useCallback((index: number) => {
        setFormData((prev) => ({
            ...prev,
            achievements: prev.achievements?.filter((_, i) => i !== index) || [],
        }));
    }, [setFormData]);

    const handleSaveKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' && !isSaving) {
            e.preventDefault();
            onSave();
        }
    };

    const handleCancelKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' && !isSaving) {
            e.preventDefault();
            onCancel();
        }
    };

    const initials = `${formData.firstName?.charAt(0) || 'F'}${formData.lastName?.charAt(0) || 'L'}`;

    const sectionHeadingStyle: React.CSSProperties = {
        color: 'var(--text-hi)',
        fontSize: '1.1rem',
        fontWeight: 700,
    };

    const iconBoxStyle: React.CSSProperties = {
        background: 'var(--ink-3)',
        width: 32,
        height: 32,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    };

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
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ border: '3px solid var(--brand-500)', background: 'var(--ink-3)' }}
                        >
                            <span className="text-2xl font-bold" style={{ color: 'var(--brand-500)' }}>{initials}</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-hi)' }}>Edit Profile</h2>
                            <p style={{ color: 'var(--text-lo)' }}>Update your coaching profile information</p>
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

                    {/* Contact Information Section */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2" style={sectionHeadingStyle}>
                            <div style={iconBoxStyle}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--brand-500)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            Contact Information
                        </h3>
                        <div className="space-y-4">
                            <EmailInput
                                value={formData.email}
                                onChange={(value: string) => handleFieldChange('email', value)}
                                error={errors.email}
                                disabled={isSaving}
                            />
                            <TextInput
                                label="Phone"
                                name="phone"
                                type="text"
                                value={formData.phone || ''}
                                onChange={(value: string) => handleFieldChange('phone', value)}
                                error={errors.phone}
                                placeholder="e.g., +1 (310) 825-4321"
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    {/* Professional Information Section */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2" style={sectionHeadingStyle}>
                            <div style={iconBoxStyle}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--brand-500)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            Professional Information
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextInput
                                    label="University"
                                    name="university"
                                    value={formData.university || ''}
                                    onChange={(value: string) => handleFieldChange('university', value)}
                                    error={errors.university}
                                    placeholder="e.g., Duke University"
                                    disabled={isSaving}
                                />
                                <TextInput
                                    label="Position"
                                    name="position"
                                    value={formData.position || ''}
                                    onChange={(value: string) => handleFieldChange('position', value)}
                                    error={errors.position}
                                    placeholder="e.g., Assistant Coach"
                                    disabled={isSaving}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextInput
                                    label="Sport"
                                    name="sport"
                                    value={formData.sport || ''}
                                    onChange={(value: string) => handleFieldChange('sport', value)}
                                    error={errors.sport}
                                    placeholder="e.g., Basketball"
                                    disabled={isSaving}
                                />
                                <TextInput
                                    label="Years of Experience"
                                    name="yearsExperience"
                                    type="number"
                                    value={formData.yearsExperience?.toString() || ''}
                                    onChange={(value: string) => handleFieldChange('yearsExperience', value ? parseInt(value) : undefined as any)}
                                    error={errors.yearsExperience}
                                    placeholder="e.g., 8"
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                    </div>

                    {/* University Information Section */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2" style={sectionHeadingStyle}>
                            <div style={iconBoxStyle}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--brand-500)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            University Details
                        </h3>
                        <div className="space-y-4">
                            <TextInput
                                label="University Logo URL"
                                name="universityLogoUrl"
                                type="text"
                                value={formData.universityLogoUrl || ''}
                                onChange={(value: string) => handleFieldChange('universityLogoUrl', value)}
                                error={errors.universityLogoUrl}
                                placeholder="https://example.com/logo.png"
                                disabled={isSaving}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <TextInput
                                    label="Conference"
                                    name="conference"
                                    value={formData.conference || ''}
                                    onChange={(value: string) => handleFieldChange('conference', value)}
                                    error={errors.conference}
                                    placeholder="e.g., ACC"
                                    disabled={isSaving}
                                />
                                <TextInput
                                    label="Division"
                                    name="division"
                                    value={formData.division || ''}
                                    onChange={(value: string) => handleFieldChange('division', value)}
                                    error={errors.division}
                                    placeholder="e.g., NCAA Division I"
                                    disabled={isSaving}
                                />
                                <TextInput
                                    label="Team Name"
                                    name="teamName"
                                    value={formData.teamName || ''}
                                    onChange={(value: string) => handleFieldChange('teamName', value)}
                                    error={errors.teamName}
                                    placeholder="e.g., Duke Blue Devils"
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Office Information Section */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2" style={sectionHeadingStyle}>
                            <div style={iconBoxStyle}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--brand-500)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            Office Information
                        </h3>
                        <div className="space-y-4">
                            <TextInput
                                label="Office Location"
                                name="officeLocation"
                                value={formData.officeLocation || ''}
                                onChange={(value: string) => handleFieldChange('officeLocation', value)}
                                error={errors.officeLocation}
                                placeholder="e.g., Cameron Indoor Stadium, Room 201"
                                disabled={isSaving}
                            />
                            <TextInput
                                label="Office Hours"
                                name="officeHours"
                                value={formData.officeHours || ''}
                                onChange={(value: string) => handleFieldChange('officeHours', value)}
                                error={errors.officeHours}
                                placeholder="e.g., Mon-Fri: 10:00 AM - 4:00 PM"
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    {/* Media & Links Section */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2" style={sectionHeadingStyle}>
                            <div style={iconBoxStyle}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--brand-500)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            Media & Links
                        </h3>
                        <div className="space-y-4">
                            <TextInput
                                label="Profile Image URL"
                                name="profileImage"
                                type="text"
                                value={formData.profileImage || ''}
                                onChange={(value: string) => handleFieldChange('profileImage', value)}
                                error={errors.profileImage}
                                placeholder="https://example.com/profile-image.jpg"
                                disabled={isSaving}
                            />
                            <TextInput
                                label="Team Website URL"
                                name="teamWebsiteUrl"
                                type="text"
                                value={formData.teamWebsiteUrl || ''}
                                onChange={(value: string) => handleFieldChange('teamWebsiteUrl', value)}
                                error={errors.teamWebsiteUrl}
                                placeholder="https://uclabruins.com/sports/basketball"
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    {/* Financials Section */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2" style={sectionHeadingStyle}>
                            <div style={iconBoxStyle}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--brand-500)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            Financials
                        </h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-lo)' }}>
                            These figures appear on your scholarships page and help you track your remaining budget when creating offers.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextInput
                                label="Annual Scholarship Budget ($)"
                                name="scholarshipBudget"
                                type="number"
                                value={formData.scholarshipBudget?.toString() || ''}
                                onChange={(value: string) => handleFieldChange('scholarshipBudget', value ? parseFloat(value) : undefined as any)}
                                error={errors.scholarshipBudget}
                                placeholder="e.g. 500000"
                                disabled={isSaving}
                            />
                            <TextInput
                                label="Annual Cost Per Academic Year($)"
                                name="annualCostPerPlayer"
                                type="number"
                                value={formData.annualCostPerPlayer?.toString() || ''}
                                onChange={(value: string) => handleFieldChange('annualCostPerPlayer', value ? parseFloat(value) : undefined as any)}
                                error={errors.annualCostPerPlayer}
                                placeholder="e.g. 55000"
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    {/* Achievements Section */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2" style={sectionHeadingStyle}>
                            <span className="text-2xl">🏆</span>
                            Recent Achievements
                        </h3>

                        {/* Existing Achievements List */}
                        {formData.achievements && formData.achievements.length > 0 && (
                            <div className="mb-4 space-y-2">
                                {formData.achievements.map((achievement, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 rounded-lg"
                                        style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-medium" style={{ color: 'var(--text-hi)' }}>{achievement.title}</p>
                                            {achievement.year && (
                                                <p className="text-xs" style={{ color: 'var(--text-lo)' }}>Year: {achievement.year}</p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAchievement(index)}
                                            disabled={isSaving}
                                            className="ml-3 p-2 rounded-lg transition-colors disabled:opacity-50"
                                            style={{ color: 'var(--status-danger)' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'oklch(60% 0.22 25 / 0.1)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                            aria-label="Remove achievement"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add New Achievement */}
                        <div className="space-y-3 p-4 rounded-lg" style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-mid)' }}>Add New Achievement</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        placeholder="Achievement title (e.g., Conference Champion 2023)"
                                        value={newAchievement.title}
                                        onChange={(e) => setNewAchievement(prev => ({ ...prev, title: e.target.value }))}
                                        disabled={isSaving}
                                        className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50"
                                        style={{
                                            background: 'var(--ink-1)',
                                            border: '1px solid var(--ink-3)',
                                            color: 'var(--text-hi)',
                                        }}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Year (optional)"
                                        value={newAchievement.year}
                                        onChange={(e) => setNewAchievement(prev => ({ ...prev, year: e.target.value }))}
                                        disabled={isSaving}
                                        min="1900"
                                        max="2100"
                                        className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50"
                                        style={{
                                            background: 'var(--ink-1)',
                                            border: '1px solid var(--ink-3)',
                                            color: 'var(--text-hi)',
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddAchievement}
                                        disabled={isSaving || !newAchievement.title.trim()}
                                        className="px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6" style={{ borderTop: '1px solid var(--ink-3)' }}>
                        <button
                            onClick={onSave}
                            onKeyDown={handleSaveKeyDown}
                            disabled={isSaving}
                            className="min-h-[44px] w-full sm:flex-1 px-6 py-3 rounded-lg font-semibold disabled:opacity-60 transition-all touch-manipulation flex items-center justify-center gap-2"
                            style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                            type="button"
                        >
                            {isSaving && (
                                <svg
                                    className="animate-spin h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
                        </button>
                        <button
                            onClick={onCancel}
                            onKeyDown={handleCancelKeyDown}
                            disabled={isSaving}
                            className="min-h-[44px] w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ background: 'var(--ink-3)', color: 'var(--text-mid)' }}
                            onMouseEnter={e => !isSaving && (e.currentTarget.style.background = 'var(--ink-2)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink-3)')}
                            type="button"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});
