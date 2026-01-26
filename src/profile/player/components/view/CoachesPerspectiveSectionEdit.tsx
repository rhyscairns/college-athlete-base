import React from 'react';
import { TextInput } from '../edit/inputs/TextInput';
import { ActionButtons } from './ActionButtons';
import type { ValidationErrors } from '../../types';

interface Testimonial {
    id: string;
    quote: string;
    coachName: string;
    coachTitle: string;
    coachOrganization: string;
}

interface CoachesPerspectiveSectionEditProps {
    formData: Testimonial[];
    setFormData: React.Dispatch<React.SetStateAction<Testimonial[]>>;
    errors: ValidationErrors;
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
}

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
        <div className="space-y-4 p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10 animate-fade-in">
            <div className="space-y-6">
                {formData.map((testimonial, index) => (
                    <div
                        key={testimonial.id}
                        className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h4 className="text-sm font-semibold text-white">
                                Testimonial {index + 1}
                            </h4>
                            <button
                                type="button"
                                onClick={() => handleRemoveTestimonial(index)}
                                disabled={isSaving}
                                className="min-h-[44px] w-full sm:w-auto px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-semibold hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
                            >
                                Remove
                            </button>
                        </div>

                        <div>
                            <label
                                htmlFor={`testimonial-quote-${index}`}
                                className="block text-sm font-medium text-white/90 mb-2"
                            >
                                Testimonial <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                id={`testimonial-quote-${index}`}
                                value={testimonial.quote}
                                onChange={(e) => handleTestimonialChange(index, 'quote', e.target.value)}
                                disabled={isSaving}
                                placeholder="Enter the coach's testimonial..."
                                rows={4}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-vertical"
                            />
                            {errors[`testimonial-${index}-quote`] && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors[`testimonial-${index}-quote`]}
                                </p>
                            )}
                        </div>

                        <TextInput
                            label="Coach Name"
                            name={`testimonial-coachName-${index}`}
                            value={testimonial.coachName}
                            onChange={(value) => handleTestimonialChange(index, 'coachName', value)}
                            error={errors[`testimonial-${index}-coachName`]}
                            disabled={isSaving}
                            placeholder="e.g., Coach David Miller"
                            required
                        />

                        <TextInput
                            label="Coach Title"
                            name={`testimonial-coachTitle-${index}`}
                            value={testimonial.coachTitle}
                            onChange={(value) => handleTestimonialChange(index, 'coachTitle', value)}
                            error={errors[`testimonial-${index}-coachTitle`]}
                            disabled={isSaving}
                            placeholder="e.g., Head Football Coach"
                            required
                        />

                        <TextInput
                            label="Organization"
                            name={`testimonial-coachOrganization-${index}`}
                            value={testimonial.coachOrganization}
                            onChange={(value) => handleTestimonialChange(index, 'coachOrganization', value)}
                            error={errors[`testimonial-${index}-coachOrganization`]}
                            disabled={isSaving}
                            placeholder="e.g., Westlake High School"
                        />
                    </div>
                ))}
            </div>

            {formData.length === 0 && (
                <p className="text-center text-slate-400 py-8">
                    No testimonials added yet. Click "Add Testimonial" to get started.
                </p>
            )}

            <button
                type="button"
                onClick={handleAddTestimonial}
                disabled={isSaving}
                className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-semibold hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
            >
                + Add Testimonial
            </button>

            {errors.testimonials && (
                <p className="text-sm text-red-400">{errors.testimonials}</p>
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
