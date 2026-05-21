import jwt from 'jsonwebtoken';

function getJWTSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET environment variable is not set');
    return secret;
}

function getTokenExpiration(): number {
    const expiration = process.env.JWT_EXPIRATION || '7d';
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (match) {
        const value = parseInt(match[1], 10);
        switch (match[2]) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 3600;
            case 'd': return value * 86400;
        }
    }
    return 604800; // 7 days default
}

export async function generateToken(
    userId: string,
    email: string,
    type: 'player' | 'coach'
): Promise<string> {
    const secret = getJWTSecret();
    const expiresIn = getTokenExpiration();

    return new Promise((resolve, reject) => {
        jwt.sign(
            { playerId: userId, email, type },
            secret,
            { algorithm: 'HS256', expiresIn },
            (err, token) => {
                if (err || !token) reject(err || new Error('Failed to generate token'));
                else resolve(token);
            }
        );
    });
}
