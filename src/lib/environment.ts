/**
 * Runtime environment detection utilities.
 *
 * RUNTIME_ENV controls how the application routes auth and payment calls:
 *   - 'local'       — local DB directly, payment simulation UI, no Lambda/Stripe
 *   - 'development' — Auth Lambda + Payment Lambda, Stripe test mode
 *   - 'production'  — Auth Lambda + Payment Lambda, Stripe live mode
 */

export type RuntimeEnv = 'local' | 'development' | 'production';

/**
 * Returns the current runtime environment.
 * Defaults to 'local' when RUNTIME_ENV is not set.
 */
export function getRuntimeEnv(): RuntimeEnv {
    const env = process.env.RUNTIME_ENV as RuntimeEnv;
    if (env === 'development' || env === 'production') {
        return env;
    }
    return 'local';
}

/**
 * Returns true when running in a cloud environment (development or production).
 * Use this to decide whether to invoke Lambdas or handle requests locally.
 */
export function isCloudEnvironment(): boolean {
    return getRuntimeEnv() !== 'local';
}
