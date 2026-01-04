import http from 'k6/http';
import { check, sleep } from 'k6';

// Spike test configuration
export const options = {
    stages: [
        { duration: '1m', target: 10 },   // Normal load
        { duration: '30s', target: 100 }, // Sudden spike
        { duration: '1m', target: 100 },  // Maintain spike
        { duration: '30s', target: 10 },  // Return to normal
        { duration: '1m', target: 10 },   // Maintain normal
        { duration: '30s', target: 0 },   // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<3000'], // 95% of requests should be below 3s
        http_req_failed: ['rate<0.15'],    // Less than 15% of requests should fail
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
    const res = http.get(`${BASE_URL}/api/health`);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time acceptable': (r) => r.timings.duration < 5000,
    });

    sleep(0.5);
}
