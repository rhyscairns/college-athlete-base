export function validateRequired(value: string | undefined | null): boolean {
    return value !== undefined && value !== null && value.trim().length > 0;
}

export function validateEmail(email: string): boolean {
    if (!validateRequired(email)) return false;

    const trimmed = email.trim();

    // Split-based validation — avoids ReDoS from nested quantifiers
    const atIndex = trimmed.indexOf('@');
    if (atIndex <= 0 || atIndex !== trimmed.lastIndexOf('@')) return false;

    const local = trimmed.slice(0, atIndex);
    const domain = trimmed.slice(atIndex + 1);

    if (!local || /\s/.test(local)) return false;

    const dotIndex = domain.lastIndexOf('.');
    if (dotIndex <= 0 || dotIndex === domain.length - 1) return false;
    if (/\s/.test(domain)) return false;

    return true;
}

export function validatePassword(password: string): boolean {
    if (!validateRequired(password)) return false;
    return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    );
}

export function validateGPA(gpa: string | number): boolean {
    const n = typeof gpa === 'string' ? parseFloat(gpa) : gpa;
    return !isNaN(n) && n >= 0.0 && n <= 4.0;
}

export function normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
}
