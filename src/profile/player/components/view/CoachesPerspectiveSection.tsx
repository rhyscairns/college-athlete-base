'use client';

import { useState, useEffect, useRef } from 'react';
import type { CoachesPerspectiveSectionProps, ValidationErrors } from '../../types';
import { EditButton } from './EditButton';
import { CoachesPerspectiveSectionEdit } from './CoachesPerspectiveSectionEdit';

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

    return (
        <section
            id="coaches"
            ref={sectionRef}
            className={`relative min-h-[calc(100vh-80px)] flex items-center px-6 py-12 transition-all duration-300 ease-in-out ${isEditing ? 'bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6' : ''
                }`}
        >
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white">
                            Coaches&apos; Perspective
                        </h2>
                        {isOwner && !isEditing && (
                            <EditButton
                                onClick={() => onEdit?.()}
                                disabled={isAnyOtherSectionEditing}
                                tooltip={
                                    isAnyOtherSectionEditing
                                        ? 'Another section is being edited'
                                        : undefined
                                }
                            />
                        )}
                    </div>
                    <p className="text-lg md:text-xl text-slate-400">What the coaches say</p>
                </div>

                {isEditing ? (
                    <CoachesPerspectiveSectionEdit
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                        isSaving={isSaving}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 hover:bg-white/10 hover:border-yellow-400/50 transition-all"
                            >
                                {/* Quote Icon */}
                                <div className="text-5xl text-yellow-400/30 mb-4">&ldquo;</div>

                                {/* Quote */}
                                <p className="text-base md:text-lg text-slate-200 mb-6 leading-relaxed italic">
                                    {testimonial.quote}
                                </p>

                                {/* Coach Info */}
                                <div className="border-t border-white/10 pt-4">
                                    <p className="text-white font-bold mb-1">{testimonial.coachName}</p>
                                    <p className="text-sm text-slate-400">{testimonial.coachTitle}</p>
                                    <p className="text-sm text-slate-500">{testimonial.coachOrganization}</p>
                                </div>

                                {/* Decorative element */}
                                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-yellow-400/5 to-transparent rounded-tl-3xl"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
