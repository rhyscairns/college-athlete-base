import { test, expect } from '@playwright/test'

test.describe('Health Check API', () => {
    test('should return healthy status', async ({ request }) => {
        const response = await request.get('/api/health')

        expect(response.ok()).toBeTruthy()
        expect(response.status()).toBe(200)

        const data = await response.json()
        expect(data).toHaveProperty('status', 'ok')
        expect(data).toHaveProperty('timestamp')
    })

    test('should return valid timestamp', async ({ request }) => {
        const response = await request.get('/api/health')
        const data = await response.json()

        const timestamp = new Date(data.timestamp)
        expect(timestamp.toString()).not.toBe('Invalid Date')
    })
})
