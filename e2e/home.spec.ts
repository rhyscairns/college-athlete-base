import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
    test('should load successfully', async ({ page }) => {
        await page.goto('/')

        // Wait for the page to be fully loaded
        await page.waitForLoadState('networkidle')

        // Check that the page loaded
        expect(page.url()).toBe('http://localhost:3000/')
    })

    test('should have correct title', async ({ page }) => {
        await page.goto('/')

        // Check page title or heading
        await expect(page).toHaveTitle(/College Athlete Base|Next.js/)
    })

    test('should render main content', async ({ page }) => {
        await page.goto('/')

        // Check that main element exists
        const main = page.locator('main')
        await expect(main).toBeVisible()
    })
})
