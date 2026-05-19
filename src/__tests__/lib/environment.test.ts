import { getRuntimeEnv, isCloudEnvironment } from '@/lib/environment';

describe('environment utilities', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
        originalEnv = process.env.RUNTIME_ENV;
    });

    afterEach(() => {
        if (originalEnv === undefined) {
            delete process.env.RUNTIME_ENV;
        } else {
            process.env.RUNTIME_ENV = originalEnv;
        }
    });

    describe('getRuntimeEnv()', () => {
        it('returns "local" when RUNTIME_ENV is not set', () => {
            delete process.env.RUNTIME_ENV;
            expect(getRuntimeEnv()).toBe('local');
        });

        it('returns "local" when RUNTIME_ENV=local', () => {
            process.env.RUNTIME_ENV = 'local';
            expect(getRuntimeEnv()).toBe('local');
        });

        it('returns "development" when RUNTIME_ENV=development', () => {
            process.env.RUNTIME_ENV = 'development';
            expect(getRuntimeEnv()).toBe('development');
        });

        it('returns "production" when RUNTIME_ENV=production', () => {
            process.env.RUNTIME_ENV = 'production';
            expect(getRuntimeEnv()).toBe('production');
        });

        it('defaults to "local" for unrecognised values', () => {
            process.env.RUNTIME_ENV = 'staging';
            expect(getRuntimeEnv()).toBe('local');
        });
    });

    describe('isCloudEnvironment()', () => {
        it('returns false when RUNTIME_ENV is not set', () => {
            delete process.env.RUNTIME_ENV;
            expect(isCloudEnvironment()).toBe(false);
        });

        it('returns false when RUNTIME_ENV=local', () => {
            process.env.RUNTIME_ENV = 'local';
            expect(isCloudEnvironment()).toBe(false);
        });

        it('returns true when RUNTIME_ENV=development', () => {
            process.env.RUNTIME_ENV = 'development';
            expect(isCloudEnvironment()).toBe(true);
        });

        it('returns true when RUNTIME_ENV=production', () => {
            process.env.RUNTIME_ENV = 'production';
            expect(isCloudEnvironment()).toBe(true);
        });
    });
});
