import http from 'k6/http';
import { check, sleep } from 'k6';

// Load test configuration
export const options = {
    stages: [
        { duration: '1m', target: 10 },  // Ramp up to 10 users
        { duration: '3m', target: 10 },  // Stay at 10 users
        { duration: '1m', target: 0 },   // Ramp down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1s
        http_req_failed: ['rate<0.05'],    // Less than 5% of requests should fail
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
    // Simulate user browsing behavior

    // Visit home page
    const homeRes = http.get(BASE_URL);
    check(homeRes, {
        'home page loaded': (r) => r.status === 200,
    });
    sleep(2);

    // Check health endpoint
    const healthRes = http.get(`${BASE_URL}/api/health`);
    check(healthRes, {
        'health check passed': (r) => r.status === 200,
    });
    sleep(1);

    // Simulate API calls
    const apiRes = http.get(`${BASE_URL}/api/log`, {
        headers: { 'Content-Type': 'application/json' },
    });
    check(apiRes, {
        'api responded': (r) => r.status === 200 || r.status === 405,
    });
    sleep(3);
}
