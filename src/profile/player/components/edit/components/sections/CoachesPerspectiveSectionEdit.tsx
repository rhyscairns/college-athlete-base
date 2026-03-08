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
        <div className="space-y-4 p-6 sm:p-8 bg-white rounded-2xl shadow-lg animate-fade-in">
            <div className="space-y-4">
                {formData.map((testimonial, index) => (
                    <div
                        key={testimonial.id}
                        className="space-y-3 p-6 bg-gray-50 rounded-xl border border-gray-200"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">
                                Testimonial {index + 1}
                            </h4>
                            <button
                                type="button"
                                onClick={() => handleRemoveTestimonial(index)}
                                disabled={isSaving}
                                className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                            >
                                Remove
                            </button>
                        </div>

                        <div>
                            <label
                                htmlFor={`testimonial-quote-${index}`}
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Testimonial <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                id={`testimonial-quote-${index}`}
                                value={testimonial.quote}
                                onChange={(e) => handleTestimonialChange(index, 'quote', e.target.value)}
                                disabled={isSaving}
                                placeholder="Enter the coach's testimonial..."
                                rows={4}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-vertical"
                            />
                            {errors[`testimonial-${index}-quote`] && (
                                <p className="mt-1 text-sm text-red-600">
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
                <p className="text-center text-gray-500 py-8">
                    No testimonials added yet. Click "Add Testimonial" to get started.
                </p>
            )}

            <button
                type="button"
                onClick={handleAddTestimonial}
                disabled={isSaving}
                className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-sm font-semibold hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
            >
                + Add Testimonial
            </button>

            {errors.testimonials && (
                <p className="text-sm text-red-600">{errors.testimonials}</p>
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
