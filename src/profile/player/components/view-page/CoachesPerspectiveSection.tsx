'use client';

import { useState, useEffect, useRef } from 'react';
import type { CoachesPerspectiveSectionProps, ValidationErrors } from '../../types';
import { CoachesPerspectiveSectionEdit } from '../edit/components/sections/CoachesPerspectiveSectionEdit';
import { hasSectionData } from '../../utils/profile-helpers';
import { EmptySection } from '../EmptySection';

interface Testimonial {
    id: string;
    quote: string;
    coachName: string;
    coachTitle: string;
    coachOrganization: string;
}

export function CoachesPerspectiveSection({
    testimonials,
    isOwner = false,
    isEditing = false,
    isAnyOtherSectionEditing = false,
    onEdit,
    onSave,
    onCancel,
}: CoachesPerspectiveSectionProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const [formData, setFormData] = useState<Testimonial[]>(testimonials);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSaving, setIsSaving] = useState(false);

    // Reset form data when testimonials data changes or when exiting edit mode
    useEffect(() => {
        if (!isEditing) {
            setFormData(testimonials);
            setErrors({});
        }
    }, [isEditing, testimonials]);

    // Scroll into view when entering edit mode and set focus
    useEffect(() => {
        if (isEditing && sectionRef.current) {
            sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Focus the first input field after a short delay to allow for scroll
            setTimeout(() => {
                const firstInput = sectionRef.current?.querySelector('input, textarea, select') as HTMLElement;
                if (firstInput) {
                    firstInput.focus();
                }
            }, 300);
        }
    }, [isEditing]);

    // Handle Escape key to cancel editing
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isEditing) {
                e.preventDefault();
                handleCancel();
            }
        };

        if (isEditing) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing]);

    const handleSave = async () => {
        // Validate testimonials
        const validationErrors: ValidationErrors = {};

        formData.forEach((testimonial, index) => {
            if (!testimonial.quote.trim()) {
                validationErrors[`testimonial-${index}-quote`] = 'Testimonial is required';
            }
            if (!testimonial.coachName.trim()) {
                validationErrors[`testimonial-${index}-coachName`] = 'Coach name is required';
            }
            if (!testimonial.coachTitle.trim()) {
                validationErrors[`testimonial-${index}-coachTitle`] = 'Coach title is required';
            }
        });

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSaving(true);
        // Simulate save delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (onSave) {
            onSave({
                coachTestimonials: formData,
            });
        }

        setIsSaving(false);
        setErrors({});
    };

    const handleCancel = () => {
        // Reset form data to original testimonials data
        setFormData(testimonials);
        setErrors({});
        if (onCancel) {
            onCancel();
        }
    };

    // Check if testimonials section has data
    const hasTestimonials = hasSectionData(testimonials, 'testimonials');

    // If no testimonials and not owner, hide the section
    if (!hasTestimonials && !isOwner) {
        return null;
    }

    return (
        <section
            id="coaches"
            ref={sectionRef}
            className={`max-w-6xl mx-auto px-4 py-8 ${isEditing ? 'bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6' : ''}`}
        >
            {isEditing ? (
                <CoachesPerspectiveSectionEdit
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    isSaving={isSaving}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            ) : !hasTestimonials ? (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <EmptySection
                        title="No Testimonials Yet"
                        description="Add testimonials from coaches who have worked with you to build credibility with college recruiters."
                        isOwner={isOwner}
                        showEditButton={true}
                        onEdit={onEdit}
                        icon="💬"
                    />
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 px-6 py-6 sm:px-8 relative">
                        {isOwner && (
                            <button
                                onClick={() => onEdit?.()}
                                disabled={isAnyOtherSectionEditing}
                                className="absolute top-4 right-4 px-4 py-2 bg-white text-yellow-600 rounded-lg font-semibold hover:bg-yellow-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </button>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">💬</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Coaches' Perspective</h2>
                                <p className="text-yellow-100">What the coaches say</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {testimonials.map((testimonial) => (
                                <div
                                    key={testimonial.id}
                                    className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 md:p-8 border border-gray-200 hover:border-yellow-400 hover:shadow-lg transition-all"
                                >
                                    {/* Quote Icon */}
                                    <div className="text-5xl text-yellow-500/40 mb-4">&ldquo;</div>

                                    {/* Quote */}
                                    <p className="text-base md:text-lg text-gray-700 mb-6 leading-relaxed italic">
                                        {testimonial.quote}
                                    </p>

                                    {/* Coach Info */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <p className="text-gray-900 font-bold mb-1">{testimonial.coachName}</p>
                                        <p className="text-sm text-gray-600">{testimonial.coachTitle}</p>
                                        <p className="text-sm text-gray-500">{testimonial.coachOrganization}</p>
                                    </div>

                                    {/* Decorative element */}
                                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-yellow-400/10 to-transparent rounded-tl-3xl"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
