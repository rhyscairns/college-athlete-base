import { isCloudEnvironment } from './environment';

/**
 * Invokes the Auth Lambda via API Gateway when running in a cloud environment.
 *
 * The Lambda URL is read from AUTH_LAMBDA_URL, which is injected into the ECS
 * task environment by the CDK stack at deploy time.
 *
 * Requirements: 2.1, 2.2, 2.8, 2.10
 */
export async function invokeAuthLambda(
    path: string,
    body: unknown
): Promise<Response> {
    const lambdaUrl = process.env.AUTH_LAMBDA_URL;
    if (!lambdaUrl) {
        throw new Error('AUTH_LAMBDA_URL is not configured');
    }

    const url = `${lambdaUrl.replace(/\/$/, '')}${path}`;

    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

/**
 * Returns true when the current environment should proxy auth requests to the Lambda.
 * Convenience re-export so callers only need to import from auth-client.
 */
export { isCloudEnvironment };
