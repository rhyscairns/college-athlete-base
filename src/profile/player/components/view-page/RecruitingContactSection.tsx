'use client';

import { useState, useEffect, useRef } from 'react';
import type { RecruitingContactSectionProps, ValidationErrors } from '../../types';
import { RecruitingContactSectionEdit } from '../edit/components/sections/RecruitingContactSectionEdit';
import type { Contact } from '../../types';
import { hasSectionData } from '../../utils/profile-helpers';
import { EmptySection } from '../EmptySection';

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
    const [formData, setFormData] = useState<Contact>({
        email: contact.email,
        phone: contact.phone,
        parentGuardianName: contact.parentGuardianName,
        parentGuardianPhone: contact.parentGuardianPhone,
        parentGuardianEmail: contact.parentGuardianEmail,
        socialMedia: {
            twitter: contact.socialMedia.twitter,
            instagram: contact.socialMedia.instagram,
            youtube: contact.socialMedia.youtube,
            tiktok: contact.socialMedia.tiktok,
        },
        preferredContactMethod: contact.preferredContactMethod,
        headCoach: contact.headCoach,
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSaving, setIsSaving] = useState(false);

    // Reset form data when contact data changes or when exiting edit mode
    useEffect(() => {
        if (!isEditing) {
            setFormData({
                email: contact.email,
                phone: contact.phone,
                parentGuardianName: contact.parentGuardianName,
                parentGuardianPhone: contact.parentGuardianPhone,
                parentGuardianEmail: contact.parentGuardianEmail,
                socialMedia: {
                    twitter: contact.socialMedia.twitter,
                    instagram: contact.socialMedia.instagram,
                    youtube: contact.socialMedia.youtube,
                    tiktok: contact.socialMedia.tiktok,
                },
                preferredContactMethod: contact.preferredContactMethod,
                headCoach: contact.headCoach,
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
                contact: formData as any,
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
            parentGuardianName: contact.parentGuardianName,
            parentGuardianPhone: contact.parentGuardianPhone,
            parentGuardianEmail: contact.parentGuardianEmail,
            socialMedia: {
                twitter: contact.socialMedia.twitter,
                instagram: contact.socialMedia.instagram,
                youtube: contact.socialMedia.youtube,
                tiktok: contact.socialMedia.tiktok,
            },
            preferredContactMethod: contact.preferredContactMethod,
            headCoach: contact.headCoach,
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
            className={`max-w-6xl mx-auto px-4 py-8 ${isEditing ? 'bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6' : ''}`}
        >
            {isEditing ? (
                <RecruitingContactSectionEdit
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    isSaving={isSaving}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            ) : !hasSectionData(contact, 'contact') ? (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <EmptySection
                        title="No Contact Information Yet"
                        description="Add your contact details, social media links, and coach information to make it easy for recruiters to reach you."
                        isOwner={isOwner}
                        showEditButton={true}
                        onEdit={onEdit}
                        icon="📞"
                    />
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-6 sm:px-8 relative">
                        {isOwner && (
                            <button
                                onClick={() => onEdit?.()}
                                disabled={isAnyOtherSectionEditing}
                                className="absolute top-4 right-4 px-4 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </button>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">📞</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Get In Touch</h2>
                                <p className="text-green-100">Ready to recruit? Let&apos;s connect</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                            {/* Player Contact */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 md:p-8 border border-gray-200">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Player Contact</h3>

                                <div className="space-y-4">
                                    {/* Email - Required field, always show */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Email</p>
                                            {contact.email ? (
                                                <a href={`mailto:${contact.email}`} className="text-gray-900 hover:text-yellow-600 transition-colors break-all font-medium">
                                                    {contact.email}
                                                </a>
                                            ) : (
                                                <p className="text-gray-400 italic">Not provided</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Phone - Optional field */}
                                    {(contact.phone || isOwner) && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Phone</p>
                                                {contact.phone ? (
                                                    <a href={`tel:${contact.phone}`} className="text-gray-900 hover:text-yellow-600 transition-colors font-medium">
                                                        {contact.phone}
                                                    </a>
                                                ) : (
                                                    <p className="text-gray-400 italic">Not provided</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Parent/Guardian Info - Optional */}
                                    {((contact.parentGuardianName || contact.parentGuardianPhone || contact.parentGuardianEmail) || isOwner) && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <p className="text-sm text-gray-600 mb-4 font-semibold">Parent/Guardian Contact</p>
                                            <div className="space-y-3">
                                                {(contact.parentGuardianName || isOwner) && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Name</p>
                                                        {contact.parentGuardianName ? (
                                                            <p className="text-gray-900 font-medium">{contact.parentGuardianName}</p>
                                                        ) : (
                                                            <p className="text-gray-400 italic text-sm">Not provided</p>
                                                        )}
                                                    </div>
                                                )}
                                                {(contact.parentGuardianEmail || isOwner) && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Email</p>
                                                        {contact.parentGuardianEmail ? (
                                                            <a href={`mailto:${contact.parentGuardianEmail}`} className="text-gray-900 hover:text-yellow-600 transition-colors break-all text-sm font-medium">
                                                                {contact.parentGuardianEmail}
                                                            </a>
                                                        ) : (
                                                            <p className="text-gray-400 italic text-sm">Not provided</p>
                                                        )}
                                                    </div>
                                                )}
                                                {(contact.parentGuardianPhone || isOwner) && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                                                        {contact.parentGuardianPhone ? (
                                                            <a href={`tel:${contact.parentGuardianPhone}`} className="text-gray-900 hover:text-yellow-600 transition-colors text-sm font-medium">
                                                                {contact.parentGuardianPhone}
                                                            </a>
                                                        ) : (
                                                            <p className="text-gray-400 italic text-sm">Not provided</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Preferred Contact Method - Optional */}
                                    {(contact.preferredContactMethod || isOwner) && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1">Preferred Contact Method</p>
                                            {contact.preferredContactMethod ? (
                                                <p className="text-gray-900 font-medium">{contact.preferredContactMethod}</p>
                                            ) : (
                                                <p className="text-gray-400 italic">Not specified</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Social Media - Optional */}
                                {((contact.socialMedia.twitter || contact.socialMedia.instagram || contact.socialMedia.youtube || contact.socialMedia.tiktok) || isOwner) && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <p className="text-sm text-gray-600 mb-4 font-semibold">Follow on social media</p>
                                        {(contact.socialMedia.twitter || contact.socialMedia.instagram || contact.socialMedia.youtube || contact.socialMedia.tiktok) ? (
                                            <div className="flex gap-3">
                                                {contact.socialMedia.twitter && (
                                                    <a href={contact.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 hover:bg-yellow-100 rounded-lg flex items-center justify-center transition-all hover:scale-110 border border-gray-200">
                                                        <span className="text-xl">𝕏</span>
                                                    </a>
                                                )}
                                                {contact.socialMedia.instagram && (
                                                    <a href={contact.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 hover:bg-yellow-100 rounded-lg flex items-center justify-center transition-all hover:scale-110 border border-gray-200">
                                                        <span className="text-xl">📷</span>
                                                    </a>
                                                )}
                                                {contact.socialMedia.youtube && (
                                                    <a href={contact.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 hover:bg-yellow-100 rounded-lg flex items-center justify-center transition-all hover:scale-110 border border-gray-200">
                                                        <span className="text-xl">🎥</span>
                                                    </a>
                                                )}
                                                {contact.socialMedia.tiktok && (
                                                    <a href={contact.socialMedia.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 hover:bg-yellow-100 rounded-lg flex items-center justify-center transition-all hover:scale-110 border border-gray-200">
                                                        <span className="text-xl">🎵</span>
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 italic">No social media links added</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Coach Contact */}
                            {((contact.headCoach && (contact.headCoach.name || contact.headCoach.email || contact.headCoach.phone)) || isOwner) && (
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 md:p-8 border border-gray-200">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Head Coach</h3>

                                    <div className="space-y-4">
                                        {(contact.headCoach?.name || isOwner) && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Name</p>
                                                {contact.headCoach?.name ? (
                                                    <p className="text-xl font-semibold text-gray-900">{contact.headCoach.name}</p>
                                                ) : (
                                                    <p className="text-gray-400 italic">Not provided</p>
                                                )}
                                            </div>
                                        )}

                                        {(contact.headCoach?.email || isOwner) && (
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">Email</p>
                                                    {contact.headCoach?.email ? (
                                                        <a href={`mailto:${contact.headCoach.email}`} className="text-gray-900 hover:text-blue-600 transition-colors break-all font-medium">
                                                            {contact.headCoach.email}
                                                        </a>
                                                    ) : (
                                                        <p className="text-gray-400 italic">Not provided</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {(contact.headCoach?.phone || isOwner) && (
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                                                    {contact.headCoach?.phone ? (
                                                        <a href={`tel:${contact.headCoach.phone}`} className="text-gray-900 hover:text-blue-600 transition-colors font-medium">
                                                            {contact.headCoach.phone}
                                                        </a>
                                                    ) : (
                                                        <p className="text-gray-400 italic">Not provided</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

