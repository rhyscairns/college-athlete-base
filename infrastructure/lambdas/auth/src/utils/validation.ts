export function validateRequired(value: string | undefined | null): boolean {
    return value !== undefined && value !== null && value.trim().length > 0;
}

export function validateEmail(email: string): boolean {
    if (!validateRequired(email)) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
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
