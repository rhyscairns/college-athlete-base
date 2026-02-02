import React from 'react';
import { TextInput } from '../inputs/TextInput';
import { ActionButtons } from './ActionButtons';
import type { Academic, AcademicProfileSectionEditProps } from '../../../../types';

export function AcademicProfileSectionEdit({
    formData,
    setFormData,
    errors,
    isSaving,
    onSave,
    onCancel,
}: AcademicProfileSectionEditProps) {
    const handleFieldChange = (field: keyof Academic, value: string | number | undefined) => {
        setFormData((prev: Academic) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCourseworkAdd = () => {
        setFormData((prev: Academic) => ({
            ...prev,
            coursework: [...prev.coursework, ''],
        }));
    };

    const handleCourseworkRemove = (index: number) => {
        setFormData((prev: Academic) => ({
            ...prev,
            coursework: prev.coursework.filter((_: string, idx: number) => idx !== index),
        }));
    };

    const handleCourseworkChange = (index: number, value: string) => {
        setFormData((prev: Academic) => ({
            ...prev,
            coursework: prev.coursework.map((course: string, idx: number) =>
                idx === index ? value : course
            ),
        }));
    };

    return (
        <div className="space-y-4 p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/10 animate-fade-in text-white">
            {/* GPA Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="GPA"
                    name="gpa"
                    type="number"
                    value={String(formData.gpa)}
                    onChange={(value: string) => handleFieldChange('gpa', parseFloat(value) || 0)}
                    error={errors.gpa}
                    required
                    disabled={isSaving}
                    min={0}
                    max={4.0}
                    step={0.01}
                    placeholder="e.g., 3.8"
                />
                <TextInput
                    label="GPA Scale"
                    name="gpaScale"
                    value={formData.gpaScale}
                    onChange={(value: string) => handleFieldChange('gpaScale', value)}
                    error={errors.gpaScale}
                    disabled={isSaving}
                    placeholder="e.g., 4.0 Scale"
                />
            </div>

            {/* Test Scores - SAT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextInput
                    label="SAT Total"
                    name="satScore"
                    type="number"
                    value={formData.satScore ? String(formData.satScore) : ''}
                    onChange={(value: string) => handleFieldChange('satScore', value ? parseInt(value) : undefined)}
                    error={errors.satScore}
                    disabled={isSaving}
                    min={400}
                    max={1600}
                    placeholder="e.g., 1350"
                />
                <TextInput
                    label="SAT Math"
                    name="satMath"
                    type="number"
                    value={formData.satMath ? String(formData.satMath) : ''}
                    onChange={(value: string) => handleFieldChange('satMath', value ? parseInt(value) : undefined)}
                    error={errors.satMath}
                    disabled={isSaving}
                    min={200}
                    max={800}
                    placeholder="e.g., 680"
                />
                <TextInput
                    label="SAT Reading"
                    name="satReading"
                    type="number"
                    value={formData.satReading ? String(formData.satReading) : ''}
                    onChange={(value: string) => handleFieldChange('satReading', value ? parseInt(value) : undefined)}
                    error={errors.satReading}
                    disabled={isSaving}
                    min={200}
                    max={800}
                    placeholder="e.g., 670"
                />
            </div>

            {/* ACT Score */}
            <TextInput
                label="ACT Score"
                name="actScore"
                type="number"
                value={formData.actScore ? String(formData.actScore) : ''}
                onChange={(value: string) => handleFieldChange('actScore', value ? parseInt(value) : undefined)}
                error={errors.actScore}
                disabled={isSaving}
                min={1}
                max={36}
                placeholder="e.g., 28"
            />

            {/* Class Rank */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="Class Rank"
                    name="classRank"
                    value={formData.classRank || ''}
                    onChange={(value: string) => handleFieldChange('classRank', value)}
                    error={errors.classRank}
                    disabled={isSaving}
                    placeholder="e.g., Top 10%"
                />
                <TextInput
                    label="Class Rank Detail"
                    name="classRankDetail"
                    value={formData.classRankDetail || ''}
                    onChange={(value: string) => handleFieldChange('classRankDetail', value)}
                    error={errors.classRankDetail}
                    disabled={isSaving}
                    placeholder="e.g., 45 out of 450 Students"
                />
            </div>

            {/* NCAA Eligibility Center */}
            <TextInput
                label="NCAA Eligibility Center ID"
                name="ncaaEligibilityCenter"
                value={formData.ncaaEligibilityCenter || ''}
                onChange={(value: string) => handleFieldChange('ncaaEligibilityCenter', value)}
                error={errors.ncaaEligibilityCenter}
                disabled={isSaving}
                placeholder="e.g., #2345678901"
            />

            {/* Coursework List */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Advanced Coursework
                </label>
                <div className="space-y-3">
                    {formData.coursework.map((course, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={course}
                                    onChange={(e) => handleCourseworkChange(idx, e.target.value)}
                                    disabled={isSaving}
                                    placeholder="e.g., AP Calculus AB"
                                    className="w-full h-12 px-4 bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 border-2 border-white/80 rounded-xl focus:outline-none focus:bg-white/80 focus:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => handleCourseworkRemove(idx)}
                                disabled={isSaving}
                                className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-semibold hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={handleCourseworkAdd}
                        disabled={isSaving}
                        className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-semibold hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
                    >
                        + Add Course
                    </button>
                </div>
                {errors.coursework && (
                    <p className="mt-1 text-sm text-red-600">{errors.coursework}</p>
                )}
            </div>

            {/* Action Buttons */}
            <ActionButtons
                onSave={onSave}
                onCancel={onCancel}
                isSaving={isSaving}
                disabled={isSaving}
            />
        </div>
    );
}
