import React from 'react';
import { TextInput } from '../inputs/TextInput';
import { ActionButtons } from './ActionButtons';
import type { CoachesPerspectiveSectionEditProps, Testimonial } from '../../../../types';

export function CoachesPerspectiveSectionEdit({
    formData,
    setFormData,
    errors,
    isSaving,
    onSave,
    onCancel,
}: CoachesPerspectiveSectionEditProps) {
    const handleTestimonialChange = (index: number, field: keyof Testimonial, value: string) => {
        setFormData((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: value,
            };
            return updated;
        });
    };

    const handleAddTestimonial = () => {
        const newTestimonial: Testimonial = {
            id: `testimonial-${Date.now()}`,
            quote: '',
            coachName: '',
            coachTitle: '',
            coachOrganization: '',
        };
        setFormData((prev) => [...prev, newTestimonial]);
    };

    const handleRemoveTestimonial = (index: number) => {
        setFormData((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4 p-6 sm:p-8 rounded-2xl animate-fade-in" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>
            <div className="space-y-4">
                {formData.map((testimonial, index) => (
                    <div
                        key={testimonial.id}
                        className="space-y-3 p-6 rounded-xl"
                        style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h4 className="text-sm font-semibold" style={{ color: 'var(--text-hi)' }}>
                                Testimonial {index + 1}
                            </h4>
                            <button
                                type="button"
                                onClick={() => handleRemoveTestimonial(index)}
                                disabled={isSaving}
                                className="min-h-[44px] w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                                style={{ background: 'oklch(60% 0.22 25 / 0.1)', color: 'var(--status-danger)', border: '1px solid oklch(60% 0.22 25 / 0.3)' }}
                            >
                                Remove
                            </button>
                        </div>

                        <div>
                            <label
                                htmlFor={`testimonial-quote-${index}`}
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--text-mid)' }}
                            >
                                Testimonial <span style={{ color: 'var(--status-danger)' }}>*</span>
                            </label>
                            <textarea
                                id={`testimonial-quote-${index}`}
                                value={testimonial.quote}
                                onChange={(e) => handleTestimonialChange(index, 'quote', e.target.value)}
                                disabled={isSaving}
                                placeholder="Enter the coach's testimonial..."
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-vertical"
                                style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)', color: 'var(--text-hi)' }}
                            />
                            {errors[`testimonial-${index}-quote`] && (
                                <p className="mt-1 text-sm" style={{ color: 'var(--status-danger)' }}>
                                    {errors[`testimonial-${index}-quote`]}
                                </p>
                            )}
                        </div>

                        <TextInput
                            label="Coach Name"
                            name={`testimonial-coachName-${index}`}
                            value={testimonial.coachName}
                            onChange={(value: string) => handleTestimonialChange(index, 'coachName', value)}
                            error={errors[`testimonial-${index}-coachName`]}
                            disabled={isSaving}
                            placeholder="e.g., Coach David Miller"
                            required
                        />

                        <TextInput
                            label="Coach Title"
                            name={`testimonial-coachTitle-${index}`}
                            value={testimonial.coachTitle}
                            onChange={(value: string) => handleTestimonialChange(index, 'coachTitle', value)}
                            error={errors[`testimonial-${index}-coachTitle`]}
                            disabled={isSaving}
                            placeholder="e.g., Head Football Coach"
                            required
                        />

                        <TextInput
                            label="Organization"
                            name={`testimonial-coachOrganization-${index}`}
                            value={testimonial.coachOrganization}
                            onChange={(value: string) => handleTestimonialChange(index, 'coachOrganization', value)}
                            error={errors[`testimonial-${index}-coachOrganization`]}
                            disabled={isSaving}
                            placeholder="e.g., Westlake High School"
                        />
                    </div>
                ))}
            </div>

            {formData.length === 0 && (
                <p className="text-center py-8" style={{ color: 'var(--text-lo)' }}>
                    No testimonials added yet. Click "Add Testimonial" to get started.
                </p>
            )}

            <button
                type="button"
                onClick={handleAddTestimonial}
                disabled={isSaving}
                className="min-h-[44px] w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                style={{ background: 'oklch(68% 0.22 150 / 0.1)', color: 'var(--brand-500)', border: '1px solid oklch(68% 0.22 150 / 0.3)' }}
            >
                + Add Testimonial
            </button>

            {errors.testimonials && (
                <p className="text-sm" style={{ color: 'var(--status-danger)' }}>{errors.testimonials}</p>
            )}

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
