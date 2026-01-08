import { hashPassword, verifyPassword } from '@/authentication/utils/password';

describe('Password Utilities', () => {
    describe('hashPassword', () => {
        it('should hash a password', async () => {
            const password = 'TestPassword123!';
            const hash = await hashPassword(password);

            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(0);
        });

        it('should generate different hashes for the same password', async () => {
            const password = 'TestPassword123!';
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);

            expect(hash1).not.toBe(hash2);
        });

        it('should use configurable bcrypt rounds from environment', async () => {
            const originalRounds = process.env.BCRYPT_ROUNDS;
            process.env.BCRYPT_ROUNDS = '10';

            const password = 'TestPassword123!';
            const hash = await hashPassword(password);

            expect(hash).toBeDefined();
            expect(hash.startsWith('$2b$10$')).toBe(true);

            if (originalRounds) {
                process.env.BCRYPT_ROUNDS = originalRounds;
            } else {
                delete process.env.BCRYPT_ROUNDS;
            }
        });

        it('should default to 10 rounds if BCRYPT_ROUNDS is not set', async () => {
            const originalRounds = process.env.BCRYPT_ROUNDS;
            delete process.env.BCRYPT_ROUNDS;

            const password = 'TestPassword123!';
            const hash = await hashPassword(password);

            expect(hash).toBeDefined();
            expect(hash.startsWith('$2b$10$')).toBe(true);

            if (originalRounds) {
                process.env.BCRYPT_ROUNDS = originalRounds;
            }
        });

        it('should handle short passwords', async () => {
            const password = 'Short1!';
            const hash = await hashPassword(password);

            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
        });

        it('should handle long passwords', async () => {
            const password = 'ThisIsAVeryLongPasswordWithLotsOfCharacters123!@#$%^&*()';
            const hash = await hashPassword(password);

            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
        });

        it('should handle passwords with special characters', async () => {
            const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            const hash = await hashPassword(password);

            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
        });

        it('should handle passwords with unicode characters', async () => {
            const password = 'Pässwörd123!';
            const hash = await hashPassword(password);

            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
        });

        it('should handle passwords with spaces', async () => {
            const password = 'Password With Spaces 123!';
            const hash = await hashPassword(password);

            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
        });
    });

    describe('verifyPassword', () => {
        it('should verify a correct password', async () => {
            const password = 'TestPassword123!';
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(password, hash);

            expect(isValid).toBe(true);
        });

        it('should reject an incorrect password', async () => {
            const password = 'TestPassword123!';
            const wrongPassword = 'WrongPassword123!';
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(wrongPassword, hash);

            expect(isValid).toBe(false);
        });

        it('should reject a password with different case', async () => {
            const password = 'TestPassword123!';
            const wrongPassword = 'testpassword123!';
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(wrongPassword, hash);

            expect(isValid).toBe(false);
        });

        it('should reject a password with extra characters', async () => {
            const password = 'TestPassword123!';
            const wrongPassword = 'TestPassword123!extra';
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(wrongPassword, hash);

            expect(isValid).toBe(false);
        });

        it('should reject a password with missing characters', async () => {
            const password = 'TestPassword123!';
            const wrongPassword = 'TestPassword123';
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(wrongPassword, hash);

            expect(isValid).toBe(false);
        });

        it('should handle empty password verification', async () => {
            const password = 'TestPassword123!';
            const hash = await hashPassword(password);
            const isValid = await verifyPassword('', hash);

            expect(isValid).toBe(false);
        });

        it('should verify passwords with special characters', async () => {
            const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(password, hash);

            expect(isValid).toBe(true);
        });

        it('should verify passwords with unicode characters', async () => {
            const password = 'Pässwörd123!';
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(password, hash);

            expect(isValid).toBe(true);
        });

        it('should verify passwords with spaces', async () => {
            const password = 'Password With Spaces 123!';
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(password, hash);

            expect(isValid).toBe(true);
        });

        it('should return false for invalid hash format', async () => {
            const password = 'TestPassword123!';
            const invalidHash = 'not-a-valid-hash';

            // bcrypt returns false for invalid hashes instead of throwing
            const isValid = await verifyPassword(password, invalidHash);
            expect(isValid).toBe(false);
        });
    });

    describe('Integration tests', () => {
        it('should work with multiple password hashing and verification cycles', async () => {
            const passwords = [
                'Password1!',
                'AnotherPass2@',
                'ThirdPassword3#',
            ];

            for (const password of passwords) {
                const hash = await hashPassword(password);
                const isValid = await verifyPassword(password, hash);
                expect(isValid).toBe(true);

                // Verify wrong passwords don't match
                const wrongPassword = password + 'wrong';
                const isInvalid = await verifyPassword(wrongPassword, hash);
                expect(isInvalid).toBe(false);
            }
        });

        it('should maintain security with concurrent hashing', async () => {
            const password = 'TestPassword123!';

            const hashes = await Promise.all([
                hashPassword(password),
                hashPassword(password),
                hashPassword(password),
            ]);

            // All hashes should be different
            expect(hashes[0]).not.toBe(hashes[1]);
            expect(hashes[1]).not.toBe(hashes[2]);
            expect(hashes[0]).not.toBe(hashes[2]);

            // But all should verify correctly
            const verifications = await Promise.all(
                hashes.map((hash) => verifyPassword(password, hash))
            );

            expect(verifications.every((v) => v === true)).toBe(true);
        });
    });
});
