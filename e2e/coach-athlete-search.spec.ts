import { test, expect } from '@playwright/test';

test.describe('Coach Athlete Search E2E Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Mock authentication
        await page.goto('/login');
        // Assume login flow is completed and coach is authenticated
        // This would need to be adjusted based on actual auth implementation
    });

    test('complete search flow from navbar to results', async ({ page }) => {
        // Navigate to coach dashboard
        await page.goto('/coach/coach-123/dashboard');

        // Click search button in navbar
        await page.click('[data-testid="search-button"]');

        // Wait for modal to open
        await expect(page.locator('[data-testid="athlete-search-modal"]')).toBeVisible();

        // Fill in search criteria
        await page.selectOption('[data-testid="sport-select"]', 'Basketball');
        await page.selectOption('[data-testid="position-select"]', 'Point Guard');
        await page.selectOption('[data-testid="division-select"]', 'NCAA D1');
        await page.fill('[data-testid="gpa-min-input"]', '3.0');
        await page.fill('[data-testid="gpa-max-input"]', '4.0');

        // Submit search
        await page.click('[data-testid="search-submit-button"]');

        // Wait for navigation to search results page
        await page.waitForURL('**/coach/coach-123/dashboard/search?**');

        // Verify URL contains search parameters
        const url = page.url();
        expect(url).toContain('sport=Basketball');
        expect(url).toContain('position=Point+Guard');
        expect(url).toContain('desiredDivision=NCAA+D1');
        expect(url).toContain('gpaMin=3');
        expect(url).toContain('gpaMax=4');

        // Verify search results page is displayed
        await expect(page.getByRole('heading', { level: 1 })).toContainText('Athlete Search Results');

        // Verify filters bar is displayed
        await expect(page.locator('[data-testid="search-filters-bar"]')).toBeVisible();

        // Verify results are displayed
        await expect(page.locator('[data-testid="athlete-search-results"]')).toBeVisible();
    });

    test('search with all filter types', async ({ page }) => {
        await page.goto('/coach/coach-123/dashboard');

        // Open search modal
        await page.click('[data-testid="search-button"]');
        await expect(page.locator('[data-testid="athlete-search-modal"]')).toBeVisible();

        // Fill all filter types
        await page.selectOption('[data-testid="sport-select"]', 'Football');
        await page.selectOption('[data-testid="position-select"]', 'Quarterback');
        await page.selectOption('[data-testid="division-select"]', 'NCAA D1');
        await page.fill('[data-testid="gpa-min-input"]', '3.5');
        await page.fill('[data-testid="gpa-max-input"]', '4.0');
        await page.fill('[data-testid="affordable-amount-input"]', '15000');
        await page.fill('[data-testid="height-min-input"]', '72');
        await page.fill('[data-testid="height-max-input"]', '78');
        await page.fill('[data-testid="weight-min-input"]', '200');
        await page.fill('[data-testid="weight-max-input"]', '220');

        // Submit search
        await page.click('[data-testid="search-submit-button"]');

        // Wait for results page
        await page.waitForURL('**/search?**');

        // Verify all parameters in URL
        const url = page.url();
        expect(url).toContain('sport=Football');
        expect(url).toContain('position=Quarterback');
        expect(url).toContain('desiredDivision=NCAA+D1');
        expect(url).toContain('gpaMin=3.5');
        expect(url).toContain('gpaMax=4');
        expect(url).toContain('affordableAmount=15000');
        expect(url).toContain('heightMin=72');
        expect(url).toContain('heightMax=78');
        expect(url).toContain('weightMin=200');
        expect(url).toContain('weightMax=220');
    });

    test('modify filters from results page', async ({ page }) => {
        // Start with a search
        await page.goto('/coach/coach-123/dashboard/search?sport=Basketball&gpaMin=3.0');

        // Wait for results to load
        await expect(page.locator('[data-testid="athlete-search-results"]')).toBeVisible();

        // Click on a filter chip to remove it
        await page.click('[data-testid="filter-chip-sport"]');

        // Verify URL updated
        await page.waitForURL('**/search?gpaMin=3.0');
        expect(page.url()).not.toContain('sport=Basketball');

        // Click "Clear All" button
        await page.click('[data-testid="clear-all-filters"]');

        // Verify all filters cleared
        await page.waitForURL('**/search');
        const url = page.url();
        expect(url).not.toContain('sport=');
        expect(url).not.toContain('gpaMin=');
    });

    test('pagination navigation', async ({ page }) => {
        // Navigate to search results with many results
        await page.goto('/coach/coach-123/dashboard/search?sport=Basketball');

        // Wait for results
        await expect(page.locator('[data-testid="athlete-search-results"]')).toBeVisible();

        // Check if pagination is visible (only if there are enough results)
        const paginationVisible = await page.locator('[data-testid="pagination"]').isVisible();

        if (paginationVisible) {
            // Click next page
            await page.click('[data-testid="pagination-next"]');

            // Verify page scrolled to top
            const scrollY = await page.evaluate(() => window.scrollY);
            expect(scrollY).toBe(0);

            // Verify results updated
            await expect(page.locator('[data-testid="athlete-search-results"]')).toBeVisible();
        }
    });

    test('browser back button support', async ({ page }) => {
        // First search
        await page.goto('/coach/coach-123/dashboard/search?sport=Basketball');
        await expect(page.locator('[data-testid="athlete-search-results"]')).toBeVisible();

        // Second search
        await page.goto('/coach/coach-123/dashboard/search?sport=Football');
        await expect(page.locator('[data-testid="athlete-search-results"]')).toBeVisible();

        // Go back
        await page.goBack();

        // Verify first search restored
        await page.waitForURL('**/search?sport=Basketball');
        expect(page.url()).toContain('sport=Basketball');
        await expect(page.locator('[data-testid="athlete-search-results"]')).toBeVisible();
    });

    test('bookmark and share URL', async ({ page, context }) => {
        // Navigate to search results
        await page.goto('/coach/coach-123/dashboard/search?sport=Basketball&gpaMin=3.5');
        await expect(page.locator('[data-testid="athlete-search-results"]')).toBeVisible();

        // Get the URL
        const searchUrl = page.url();

        // Open URL in new tab (simulating bookmark/share)
        const newPage = await context.newPage();
        await newPage.goto(searchUrl);

        // Verify same results displayed
        await expect(newPage.locator('[data-testid="athlete-search-results"]')).toBeVisible();
        expect(newPage.url()).toContain('sport=Basketball');
        expect(newPage.url()).toContain('gpaMin=3.5');

        await newPage.close();
    });

    test('click athlete card to view profile', async ({ page }) => {
        // Navigate to search results
        await page.goto('/coach/coach-123/dashboard/search?sport=Basketball');
        await expect(page.locator('[data-testid="athlete-search-results"]')).toBeVisible();

        // Wait for athlete cards to load
        const firstAthleteCard = page.locator('[data-testid^="athlete-card-"]').first();
        await expect(firstAthleteCard).toBeVisible();

        // Click on athlete card
        await firstAthleteCard.click();

        // Verify navigation to athlete profile
        await page.waitForURL('**/player/**');
        expect(page.url()).toContain('/player/');
    });

    test('no results message', async ({ page }) => {
        // Search with criteria that returns no results
        await page.goto('/coach/coach-123/dashboard/search?sport=Basketball&gpaMin=4.5');

        // Wait for results to load
        await expect(page.locator('[data-testid="athlete-search-results"]')).toBeVisible();

        // Verify no results message
        await expect(page.locator('[data-testid="no-results-message"]')).toBeVisible();
        await expect(page.locator('[data-testid="no-results-message"]')).toContainText(
            'No athletes match your search criteria'
        );
    });

    test('error handling on API failure', async ({ page }) => {
        // Mock API to return error
        await page.route('**/api/dashboard/athletes/search**', (route) => {
            route.fulfill({
                status: 500,
                body: JSON.stringify({ error: 'Internal server error' }),
            });
        });

        // Navigate to search results
        await page.goto('/coach/coach-123/dashboard/search?sport=Basketball');

        // Verify error message displayed
        await expect(page.locator('text=Error loading search results')).toBeVisible();
        await expect(page.locator('text=Try again')).toBeVisible();
    });

    test('loading state during search', async ({ page }) => {
        // Slow down API response
        await page.route('**/api/dashboard/athletes/search**', async (route) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await route.continue();
        });

        // Navigate to search results
        await page.goto('/coach/coach-123/dashboard/search?sport=Basketball');

        // Verify loading state
        await expect(page.locator('text=Searching for athletes...')).toBeVisible();

        // Wait for results
        await expect(page.locator('[data-testid="athlete-search-results"]')).toBeVisible();
    });

    test('refine search button reopens modal', async ({ page }) => {
        // Navigate to search results
        await page.goto('/coach/coach-123/dashboard/search?sport=Basketball');
        await expect(page.locator('[data-testid="athlete-search-results"]')).toBeVisible();

        // Click refine search button
        await page.click('[data-testid="refine-search-button"]');

        // Verify modal opens with existing criteria
        await expect(page.locator('[data-testid="athlete-search-modal"]')).toBeVisible();

        // Verify sport is pre-selected
        const sportSelect = page.locator('[data-testid="sport-select"]');
        await expect(sportSelect).toHaveValue('Basketball');
    });

    test('responsive design on mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Navigate to search results
        await page.goto('/coach/coach-123/dashboard/search?sport=Basketball');

        // Verify page is responsive
        await expect(page.locator('[data-testid="athlete-search-results"]')).toBeVisible();

        // Verify single column layout
        const resultsGrid = page.locator('[data-testid="athlete-search-results"]');
        const gridColumns = await resultsGrid.evaluate((el) => {
            return window.getComputedStyle(el).gridTemplateColumns;
        });

        // Should be single column on mobile
        expect(gridColumns).not.toContain('repeat');
    });

    test('keyboard navigation support', async ({ page }) => {
        await page.goto('/coach/coach-123/dashboard/search?sport=Basketball');
        await expect(page.locator('[data-testid="athlete-search-results"]')).toBeVisible();

        // Tab through interactive elements
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        // Verify focus is on an interactive element
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
    });
});
