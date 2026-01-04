import http from 'k6/http';
import { check, sleep } from 'k6';

// Smoke test configuration
export const options = {
    vus: 1,
    duration: '1m',
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
        http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
    // Test health endpoint
    const healthRes = http.get(`${BASE_URL}/api/health`);
    check(healthRes, {
        'health check status is 200': (r) => r.status === 200,
        'health check response time < 200ms': (r) => r.timings.duration < 200,
    });

    sleep(1);

    // Test home page
    const homeRes = http.get(BASE_URL);
    check(homeRes, {
        'home page status is 200': (r) => r.status === 200,
        'home page response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);
}
