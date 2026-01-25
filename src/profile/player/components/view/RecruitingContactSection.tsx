'use client';

import { useState, useEffect, useRef } from 'react';
import type { RecruitingContactSectionProps, ValidationErrors } from '../../types';
import { EditButton } from './EditButton';
import { RecruitingContactSectionEdit, type ContactFormData } from './RecruitingContactSectionEdit';

export function RecruitingContactSection({
    contact,
    isOwner = false,
    isEditing = false,
    isAnyOtherSectionEditing = false,
    onEdit,
    onSave,
    onCancel,
}: RecruitingContactSectionProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const [formData, setFormData] = useState<ContactFormData>({
        email: contact.email,
        phone: contact.phone,
        parentGuardianName: (contact as any).parentGuardianName,
        parentGuardianPhone: (contact as any).parentGuardianPhone,
        parentGuardianEmail: (contact as any).parentGuardianEmail,
        socialMedia: {
            twitter: contact.socialMedia.twitter,
            instagram: contact.socialMedia.instagram,
            youtube: (contact.socialMedia as any).youtube,
            tiktok: (contact.socialMedia as any).tiktok,
        },
        preferredContactMethod: (contact as any).preferredContactMethod || '',
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSaving, setIsSaving] = useState(false);

    // Reset form data when contact data changes or when exiting edit mode
    useEffect(() => {
        if (!isEditing) {
            setFormData({
                email: contact.email,
                phone: contact.phone,
                parentGuardianName: (contact as any).parentGuardianName,
                parentGuardianPhone: (contact as any).parentGuardianPhone,
                parentGuardianEmail: (contact as any).parentGuardianEmail,
                socialMedia: {
                    twitter: contact.socialMedia.twitter,
                    instagram: contact.socialMedia.instagram,
                    youtube: (contact.socialMedia as any).youtube,
                    tiktok: (contact.socialMedia as any).tiktok,
                },
                preferredContactMethod: (contact as any).preferredContactMethod || '',
            });
            setErrors({});
        }
    }, [isEditing, contact]);

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
        // Validation will be added in task 18
        const validationErrors: ValidationErrors = {};

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSaving(true);
        // Simulate save delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (onSave) {
            onSave({
                contact: {
                    ...contact,
                    email: formData.email,
                    phone: formData.phone,
                    ...(formData.parentGuardianName && { parentGuardianName: formData.parentGuardianName }),
                    ...(formData.parentGuardianPhone && { parentGuardianPhone: formData.parentGuardianPhone }),
                    ...(formData.parentGuardianEmail && { parentGuardianEmail: formData.parentGuardianEmail }),
                    socialMedia: {
                        ...contact.socialMedia,
                        twitter: formData.socialMedia.twitter,
                        instagram: formData.socialMedia.instagram,
                        ...(formData.socialMedia.youtube && { youtube: formData.socialMedia.youtube }),
                        ...(formData.socialMedia.tiktok && { tiktok: formData.socialMedia.tiktok }),
                    },
                    ...(formData.preferredContactMethod && { preferredContactMethod: formData.preferredContactMethod }),
                } as any,
            });
        }

        setIsSaving(false);
        setErrors({});
    };

    const handleCancel = () => {
        // Reset form data to original contact data
        setFormData({
            email: contact.email,
            phone: contact.phone,
            parentGuardianName: (contact as any).parentGuardianName,
            parentGuardianPhone: (contact as any).parentGuardianPhone,
            parentGuardianEmail: (contact as any).parentGuardianEmail,
            socialMedia: {
                twitter: contact.socialMedia.twitter,
                instagram: contact.socialMedia.instagram,
                youtube: (contact.socialMedia as any).youtube,
                tiktok: (contact.socialMedia as any).tiktok,
            },
            preferredContactMethod: (contact as any).preferredContactMethod || '',
        });
        setErrors({});
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <section
            id="contact"
            ref={sectionRef}
            className={`relative min-h-[calc(100vh-80px)] flex items-center px-6 py-12 transition-all duration-300 ease-in-out ${isEditing ? 'bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6' : ''
                }`}
        >
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white">Get In Touch</h2>
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
                    <p className="text-lg md:text-xl text-slate-400">Ready to recruit? Let&apos;s connect</p>
                </div>

                {isEditing ? (
                    <RecruitingContactSectionEdit
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                        isSaving={isSaving}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                ) : (
                    <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
                        {/* Player Contact */}
                        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
                            <h3 className="text-2xl font-bold text-white mb-6">Player Contact</h3>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 mb-1">Email</p>
                                        <a href={`mailto:${contact.email}`} className="text-white hover:text-yellow-400 transition-colors break-all">
                                            {contact.email}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 mb-1">Phone</p>
                                        <a href={`tel:${contact.phone}`} className="text-white hover:text-yellow-400 transition-colors">
                                            {contact.phone}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <p className="text-sm text-slate-400 mb-4">Follow on social media</p>
                                <div className="flex gap-3">
                                    {contact.socialMedia.twitter && (
                                        <a href={contact.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-yellow-400/20 rounded-lg flex items-center justify-center transition-all hover:scale-110">
                                            <span className="text-xl">𝕏</span>
                                        </a>
                                    )}
                                    {contact.socialMedia.instagram && (
                                        <a href={contact.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-yellow-400/20 rounded-lg flex items-center justify-center transition-all hover:scale-110">
                                            <span className="text-xl">📷</span>
                                        </a>
                                    )}
                                    {contact.socialMedia.youtube && (
                                        <a href={contact.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-yellow-400/20 rounded-lg flex items-center justify-center transition-all hover:scale-110">
                                            <span className="text-xl">🎥</span>
                                        </a>
                                    )}
                                    {contact.socialMedia.tiktok && (
                                        <a href={contact.socialMedia.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-yellow-400/20 rounded-lg flex items-center justify-center transition-all hover:scale-110">
                                            <span className="text-xl">🎵</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Coach Contact */}
                        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
                            <h3 className="text-2xl font-bold text-white mb-6">Head Coach</h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Name</p>
                                    <p className="text-xl font-semibold text-white">{contact.headCoach.name}</p>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 mb-1">Email</p>
                                        <a href={`mailto:${contact.headCoach.email}`} className="text-white hover:text-blue-400 transition-colors break-all">
                                            {contact.headCoach.email}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 mb-1">Phone</p>
                                        <a href={`tel:${contact.headCoach.phone}`} className="text-white hover:text-blue-400 transition-colors">
                                            {contact.headCoach.phone}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
