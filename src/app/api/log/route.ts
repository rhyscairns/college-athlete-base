import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * API endpoint for client-side error logging
 * Allows client-side errors to be sent to server for centralized logging
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { level, message, context, error } = body;

        // Validate log level
        const validLevels = ['debug', 'info', 'warn', 'error'];
        if (!validLevels.includes(level)) {
            return NextResponse.json(
                { error: 'Invalid log level' },
                { status: 400 }
            );
        }

        // Add client information to context
        const enrichedContext = {
            ...context,
            userAgent: request.headers.get('user-agent'),
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
            referer: request.headers.get('referer'),
            clientSide: true,
        };

        // Log based on level
        switch (level) {
            case 'debug':
                logger.debug(message, enrichedContext);
                break;
            case 'info':
                logger.info(message, enrichedContext);
                break;
            case 'warn':
                logger.warn(message, enrichedContext);
                break;
            case 'error':
                if (error) {
                    const errorObj = new Error(error.message);
                    errorObj.name = error.name;
                    errorObj.stack = error.stack;
                    logger.error(message, errorObj, enrichedContext);
                } else {
                    logger.error(message, undefined, enrichedContext);
                }
                break;
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        logger.error('Failed to process log request', error instanceof Error ? error : undefined);
        return NextResponse.json(
            { error: 'Failed to process log request' },
            { status: 500 }
        );
    }
}
