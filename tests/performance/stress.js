import http from 'k6/http';
import { check, sleep } from 'k6';

// Stress test configuration
export const options = {
    stages: [
        { duration: '2m', target: 20 },   // Ramp up to 20 users
        { duration: '3m', target: 50 },   // Ramp up to 50 users
        { duration: '2m', target: 100 },  // Ramp up to 100 users
        { duration: '3m', target: 100 },  // Stay at 100 users
        { duration: '2m', target: 0 },    // Ramp down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
        http_req_failed: ['rate<0.1'],     // Less than 10% of requests should fail
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
    const responses = http.batch([
        ['GET', `${BASE_URL}/`],
        ['GET', `${BASE_URL}/api/health`],
    ]);

    check(responses[0], {
        'home page status is 200': (r) => r.status === 200,
    });

    check(responses[1], {
        'health check status is 200': (r) => r.status === 200,
    });

    sleep(1);
}
