import jwt from 'jsonwebtoken';
import { TokenPayload } from '@/authentication/types';

/**
 * Get JWT secret from environment variables
 * @throws Error if JWT_SECRET is not set
 */
function getJWTSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set');
    }
    return secret;
}

/**
 * Get token expiration time in seconds
 * Default: 7 days (604800 seconds)
 */
export function getTokenExpiration(): number {
    const expiration = process.env.JWT_EXPIRATION || '7d';

    // Convert string format to seconds
    if (typeof expiration === 'string') {
        const match = expiration.match(/^(\d+)([smhd])$/);
        if (match) {
            const value = parseInt(match[1], 10);
            const unit = match[2];

            switch (unit) {
                case 's': return value;
                case 'm': return value * 60;
                case 'h': return value * 3600;
                case 'd': return value * 86400;
                default: return 604800; // 7 days default
            }
        }
    }

    return 604800; // 7 days default
}

/**
 * Generate a JWT token for a user
 * @param userId - The user's ID (player or coach)
 * @param email - The user's email
 * @param type - The user type ('player' or 'coach')
 * @returns Promise resolving to the JWT token string
 */
export async function generateToken(
    userId: string,
    email: string,
    type: 'player' | 'coach' = 'player'
): Promise<string> {
    try {
        const secret = getJWTSecret();
        const expiresIn = getTokenExpiration();

        const payload = {
            playerId: userId,
            email,
            type,
        };

        return new Promise((resolve, reject) => {
            jwt.sign(
                payload,
                secret,
                {
                    algorithm: 'HS256',
                    expiresIn
                },
                (err, token) => {
                    if (err || !token) {
                        reject(err || new Error('Failed to generate token'));
                    } else {
                        resolve(token);
                    }
                }
            );
        });
    } catch (error) {
        throw new Error(`Token generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Verify and decode a JWT token
 * @param token - The JWT token string to verify
 * @returns Promise resolving to the decoded token payload or null if invalid
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
    try {
        const secret = getJWTSecret();

        return new Promise((resolve) => {
            jwt.verify(token, secret, { algorithms: ['HS256'] }, (err, decoded) => {
                if (err || !decoded || typeof decoded === 'string') {
                    resolve(null);
                } else {
                    resolve(decoded as TokenPayload);
                }
            });
        });
    } catch (error) {
        return null;
    }
}
