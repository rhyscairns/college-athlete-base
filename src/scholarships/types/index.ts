import type React from 'react';

export type ScholarshipStatus = 'pending' | 'accepted' | 'rejected' | 'countered';

export interface Scholarship {
    id: string;
    coachId: string;
    playerId: string;
    status: ScholarshipStatus;
    schoolName: string;
    sport: string;
    scholarshipAmount: number;
    requiredGpa: number;
    division: string | null;
    startYear: number | null;
    durationYears: number | null;
    notes: string | null;
    counterAmount: number | null;
    counterGpa: number | null;
    counterNotes: string | null;
    // Joined fields for display
    playerFirstName?: string;
    playerLastName?: string;
    playerEmail?: string;
    coachFirstName?: string;
    coachLastName?: string;
    coachUniversity?: string;
    /** Annual cost of attendance at this university — joined from coaches table */
    annualCostPerPlayer?: number;
    createdAt: string;
    updatedAt: string;
}

export interface ScholarshipFormData {
    playerId: string;
    playerFirstName: string;
    playerLastName: string;
    playerEmail: string;
    schoolName: string;
    sport: string;
    scholarshipAmount: number | '';
    requiredGpa: number | '';
    division: string;
    startYear: number | '';
    durationYears: number | '';
    notes: string;
}

export interface ScholarshipsTableProps {
    scholarships: Scholarship[];
    userType: 'coach' | 'player';
    currentUserId: string;
    annualCostPerPlayer?: number;
}

export interface ScholarshipFormProps {
    coachId: string;
    initialData?: Partial<ScholarshipFormData>;
    existingScholarship?: Scholarship;
    onSuccess?: (scholarship: Scholarship) => void;
    /** Coach's total annual scholarship budget */
    scholarshipBudget?: number;
    /** Amount already committed to accepted offers */
    committedAmount?: number;
    /** Annual cost of attendance per player */
    annualCostPerPlayer?: number;
}

export interface ScholarshipDetailProps {
    scholarship: Scholarship;
    playerId: string;
    coachId: string;
    onStatusChange?: (updated: Scholarship) => void;
    /** Coach's annual cost per player — used to compute player out-of-pocket cost */
    annualCostPerPlayer?: number;
}

export interface ScholarshipStatusBadgeProps {
    status: ScholarshipStatus;
}

// ── ScholarshipDetail internal types ────────────────────────────────────────

export interface CounterFormData {
    counterAmount: string;
    counterGpa: string;
    counterNotes: string;
}

export interface CounterFormErrors {
    counterAmount?: string;
    counterGpa?: string;
}

// ── ScholarshipForm sub-component prop types ─────────────────────────────────

export interface FieldProps {
    label: string;
    id: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
    className?: string;
}

export interface FormTextInputProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    min?: string;
    max?: string;
    step?: string;
    hasError?: boolean;
}

export interface FormSelectInputProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    hasError?: boolean;
    children: React.ReactNode;
}
