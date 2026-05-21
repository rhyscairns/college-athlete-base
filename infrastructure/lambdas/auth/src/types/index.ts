/**
 * Shared types for the Auth Lambda handlers.
 */

export interface LoginBody {
    email?: string;
    password?: string;
}

export interface UserRow {
    id: string;
    email: string;
    password_hash: string;
}

export interface RegisterPlayerBody {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    email?: string;
    password?: string;
    sex?: string;
    sport?: string;
    position?: string;
    event?: string;
    gpa?: number | string;
    country?: string;
    state?: string;
    region?: string;
    scholarshipAmount?: number;
    testScores?: string;
    referralPromoCode?: string;
    secondaryReferralPromoCode?: string | null;
    tertiaryReferralPromoCode?: string | null;
    subscriptionPlan?: string;
}

export interface RegisterCoachBody {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    coachingCategory?: string;
    sports?: string[];
    university?: string;
    referralPromoCode?: string;
    secondaryReferralPromoCode?: string | null;
    tertiaryReferralPromoCode?: string | null;
}
