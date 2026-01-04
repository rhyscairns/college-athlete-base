import { NextResponse } from 'next/server';

interface HealthCheckResponse {
    status: 'ok' | 'degraded' | 'error';
    timestamp: string;
    uptime: number;
    version: string;
    environment: string;
    checks: {
        server: {
            status: 'ok' | 'error';
            message: string;
        };
        memory: {
            status: 'ok' | 'warning' | 'error';
            usage: number;
            limit: number;
            percentage: number;
        };
    };
}

export async function GET() {
    try {
        // Get memory usage
        const memoryUsage = process.memoryUsage();
        const totalMemory = memoryUsage.heapTotal;
        const usedMemory = memoryUsage.heapUsed;
        const memoryPercentage = (usedMemory / totalMemory) * 100;

        // Determine memory status
        let memoryStatus: 'ok' | 'warning' | 'error' = 'ok';
        if (memoryPercentage > 90) {
            memoryStatus = 'error';
        } else if (memoryPercentage > 75) {
            memoryStatus = 'warning';
        }

        // Determine overall status
        let overallStatus: 'ok' | 'degraded' | 'error' = 'ok';
        if (memoryStatus === 'error') {
            overallStatus = 'error';
        } else if (memoryStatus === 'warning') {
            overallStatus = 'degraded';
        }

        const healthCheck: HealthCheckResponse = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '0.1.0',
            environment: process.env.NODE_ENV || 'development',
            checks: {
                server: {
                    status: 'ok',
                    message: 'Server is running',
                },
                memory: {
                    status: memoryStatus,
                    usage: Math.round(usedMemory / 1024 / 1024), // MB
                    limit: Math.round(totalMemory / 1024 / 1024), // MB
                    percentage: Math.round(memoryPercentage),
                },
            },
        };

        // Return appropriate status code based on health
        const statusCode = overallStatus === 'ok' ? 200 : overallStatus === 'degraded' ? 200 : 503;

        return NextResponse.json(healthCheck, { status: statusCode });
    } catch (error) {
        // Return error response if health check fails
        return NextResponse.json(
            {
                status: 'error',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 503 }
        );
    }
}
