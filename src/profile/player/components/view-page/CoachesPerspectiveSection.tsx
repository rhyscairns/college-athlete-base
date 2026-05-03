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
            className="max-w-6xl mx-auto px-4 py-8"
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
                <div className="rounded-2xl p-8" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>
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
                <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>
                    {/* Header */}
                    <div
                        className="px-6 py-6 sm:px-8 relative"
                        style={{
                            background: `radial-gradient(ellipse 80% 120% at 0% 50%, oklch(68% 0.22 150 / 0.15) 0%, transparent 60%), var(--ink-2)`,
                            borderBottom: '1px solid var(--ink-3)',
                        }}
                    >
                        {isOwner && (
                            <button
                                onClick={() => onEdit?.()}
                                disabled={isAnyOtherSectionEditing}
                                className="absolute top-4 right-4 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                style={{ background: 'var(--ink-3)', color: 'var(--text-hi)' }}
                                onMouseEnter={e => !isAnyOtherSectionEditing && (e.currentTarget.style.background = 'var(--ink-0)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink-3)')}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </button>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--ink-3)' }}>
                                <span className="text-2xl">💬</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-hi)' }}>Coaches&apos; Perspective</h2>
                                <p style={{ color: 'var(--text-lo)' }}>What the coaches say</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {testimonials.map((testimonial) => (
                                <div
                                    key={testimonial.id}
                                    className="group relative rounded-2xl p-6 md:p-8 transition-all"
                                    style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}
                                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand-500)')}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--ink-3)')}
                                >
                                    {/* Quote Icon */}
                                    <div className="text-5xl mb-4" style={{ color: 'oklch(68% 0.22 150 / 0.4)' }}>&ldquo;</div>

                                    {/* Quote */}
                                    <p className="text-base md:text-lg mb-6 leading-relaxed italic" style={{ color: 'var(--text-mid)' }}>
                                        {testimonial.quote}
                                    </p>

                                    {/* Coach Info */}
                                    <div className="pt-4" style={{ borderTop: '1px solid var(--ink-3)' }}>
                                        <p className="font-bold mb-1" style={{ color: 'var(--text-hi)' }}>{testimonial.coachName}</p>
                                        <p className="text-sm" style={{ color: 'var(--text-mid)' }}>{testimonial.coachTitle}</p>
                                        <p className="text-sm" style={{ color: 'var(--text-lo)' }}>{testimonial.coachOrganization}</p>
                                    </div>

                                    {/* Decorative element */}
                                    <div className="absolute bottom-0 right-0 w-20 h-20 rounded-tl-3xl" style={{ background: 'oklch(68% 0.22 150 / 0.06)' }}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
