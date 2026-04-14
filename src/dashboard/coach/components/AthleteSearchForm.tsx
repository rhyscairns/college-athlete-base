'use client';

import { useState, useEffect } from 'react';
import { AthleteSearchFormProps, SearchCriteria, FormErrors } from '../types';
import { getAllSportNames, getPositionsForSport } from '@/constants/sports';
import { getAllDivisions } from '@/constants/divisions';
import { heightToInches } from '../utils/search';

export function AthleteSearchForm({ onSubmit, onCancel, isSubmitting }: AthleteSearchFormProps) {
    const [formData, setFormData] = useState<SearchCriteria>({});
    const [errors, setErrors] = useState<FormErrors>({});
    const [positions, setPositions] = useState<string[]>([]);

    const sportOptions = getAllSportNames();
    const divisionOptions = getAllDivisions();

    // Update positions when sport changes
    useEffect(() => {
        if (formData.sport) {
            const sportPositions = getPositionsForSport(formData.sport);
            setPositions(sportPositions);

            // Clear position if it's not valid for the new sport
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

        // GPA validation
        if (formData.gpaMin !== undefined && formData.gpaMax !== undefined) {
            if (formData.gpaMin > formData.gpaMax) {
                newErrors.gpa = 'Minimum GPA cannot be greater than maximum GPA';
            }
        }
        if (formData.gpaMin !== undefined && (formData.gpaMin < 0 || formData.gpaMin > 4.0)) {
            newErrors.gpa = 'GPA must be between 0.0 and 4.0';
        }
        if (formData.gpaMax !== undefined && (formData.gpaMax < 0 || formData.gpaMax > 4.0)) {
            newErrors.gpa = 'GPA must be between 0.0 and 4.0';
        }

        // Height validation
        if (formData.heightMin || formData.heightMax) {
            const minInches = formData.heightMin ? heightToInches(formData.heightMin) : null;
            const maxInches = formData.heightMax ? heightToInches(formData.heightMax) : null;

            if (formData.heightMin && minInches === null) {
                newErrors.height = 'Invalid height format. Use format like 5\'10" or 70';
            }
            if (formData.heightMax && maxInches === null) {
                newErrors.height = 'Invalid height format. Use format like 5\'10" or 70';
            }
            if (minInches !== null && maxInches !== null && minInches > maxInches) {
                newErrors.height = 'Minimum height cannot be greater than maximum height';
            }
        }

        // Weight validation
        if (formData.weightMin !== undefined && formData.weightMax !== undefined) {
            if (formData.weightMin > formData.weightMax) {
                newErrors.weight = 'Minimum weight cannot be greater than maximum weight';
            }
        }
        if (formData.weightMin !== undefined && formData.weightMin < 0) {
            newErrors.weight = 'Weight must be a positive number';
        }
        if (formData.weightMax !== undefined && formData.weightMax < 0) {
            newErrors.weight = 'Weight must be a positive number';
        }

        // Affordable amount validation
        if (formData.affordableAmount !== undefined && formData.affordableAmount < 0) {
            newErrors.affordableAmount = 'Affordable amount must be non-negative';
        }

        // Check if at least one filter is selected
        const hasFilters = Object.values(formData).some(value =>
            value !== undefined && value !== '' && value !== null
        );
        if (!hasFilters) {
            newErrors.general = 'Please select at least one search filter';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        await onSubmit(formData);
    };

    const handleClearAll = () => {
        setFormData({});
        setErrors({});
        setPositions([]);
    };

    const isFormValid = () => {
        // Check if at least one filter is set
        const hasFilters = Object.values(formData).some(value =>
            value !== undefined && value !== '' && value !== null
        );
        return hasFilters;
    };


    return (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {errors.general}
                </div>
            )}

            {/* Sport and Position - Side by side on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Sport Selection */}
                <div className="w-full">
                    <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-1">
                        Sport
                    </label>
                    <select
                        id="sport"
                        name="sport"
                        value={formData.sport || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, sport: e.target.value || undefined }))}
                        disabled={isSubmitting}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <option value="">Select a sport</option>
                        {sportOptions.map((sport) => (
                            <option key={sport} value={sport}>
                                {sport}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Position Selection (conditional) */}
                {formData.sport && positions.length > 0 && (
                    <div className="w-full">
                        <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                            Position
                        </label>
                        <select
                            id="position"
                            name="position"
                            value={formData.position || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value || undefined }))}
                            disabled={isSubmitting}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <option value="">Select a position</option>
                            {positions.map((position) => (
                                <option key={position} value={position}>
                                    {position}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Desired Division Selection */}
            <div className="w-full">
                <label htmlFor="desiredDivision" className="block text-sm font-medium text-gray-700 mb-1">
                    Desired Division
                </label>
                <select
                    id="desiredDivision"
                    name="desiredDivision"
                    value={formData.desiredDivision || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, desiredDivision: e.target.value || undefined }))}
                    disabled={isSubmitting}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <option value="">Select a division</option>
                    {divisionOptions.map((division) => (
                        <option key={division} value={division}>
                            {division}
                        </option>
                    ))}
                </select>
            </div>

            {/* GPA and Affordable Amount - Side by side on tablet+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GPA Range */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">GPA Range</label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div>
                            <input
                                type="number"
                                placeholder="Min"
                                value={formData.gpaMin ?? ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    gpaMin: e.target.value ? parseFloat(e.target.value) : undefined
                                }))}
                                disabled={isSubmitting}
                                min="0"
                                max="4.0"
                                step="0.1"
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                        </div>
                        <div>
                            <input
                                type="number"
                                placeholder="Max"
                                value={formData.gpaMax ?? ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    gpaMax: e.target.value ? parseFloat(e.target.value) : undefined
                                }))}
                                disabled={isSubmitting}
                                min="0"
                                max="4.0"
                                step="0.1"
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                        </div>
                    </div>
                    {errors.gpa && (
                        <p className="text-sm text-red-600 mt-1">{errors.gpa}</p>
                    )}
                </div>

                {/* Affordable Amount */}
                <div className="w-full">
                    <label htmlFor="affordableAmount" className="block text-sm font-medium text-gray-700 mb-1">
                        Affordable Amount ($)
                    </label>
                    <input
                        id="affordableAmount"
                        type="number"
                        placeholder="e.g., 10000"
                        value={formData.affordableAmount ?? ''}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            affordableAmount: e.target.value ? parseFloat(e.target.value) : undefined
                        }))}
                        disabled={isSubmitting}
                        min="0"
                        step="1000"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    />
                    {errors.affordableAmount && (
                        <p className="text-sm text-red-600 mt-1">{errors.affordableAmount}</p>
                    )}
                </div>
            </div>

            {/* Height and Weight - Side by side on tablet+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Height Range */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Height (e.g., 5&apos;10&quot;)
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div>
                            <input
                                type="text"
                                placeholder="Min"
                                value={formData.heightMin ?? ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    heightMin: e.target.value || undefined
                                }))}
                                disabled={isSubmitting}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Max"
                                value={formData.heightMax ?? ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    heightMax: e.target.value || undefined
                                }))}
                                disabled={isSubmitting}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                        </div>
                    </div>
                    {errors.height && (
                        <p className="text-sm text-red-600 mt-1">{errors.height}</p>
                    )}
                </div>

                {/* Weight Range */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Weight (lbs)</label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div>
                            <input
                                type="number"
                                placeholder="Min"
                                value={formData.weightMin ?? ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    weightMin: e.target.value ? parseFloat(e.target.value) : undefined
                                }))}
                                disabled={isSubmitting}
                                min="0"
                                step="1"
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                        </div>
                        <div>
                            <input
                                type="number"
                                placeholder="Max"
                                value={formData.weightMax ?? ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    weightMax: e.target.value ? parseFloat(e.target.value) : undefined
                                }))}
                                disabled={isSubmitting}
                                min="0"
                                step="1"
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                        </div>
                    </div>
                    {errors.weight && (
                        <p className="text-sm text-red-600 mt-1">{errors.weight}</p>
                    )}
                </div>
            </div>

            {/* Action Buttons - Stacked on mobile, side by side on tablet+ */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Clear All
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid()}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isSubmitting ? 'Searching...' : 'Search'}
                </button>
            </div>
        </form>
    );
}
