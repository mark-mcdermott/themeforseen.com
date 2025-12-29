import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
	test('home page loads', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/ThemeForseen/i);
	});

	test('about page loads', async ({ page }) => {
		await page.goto('/about');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('palettes page loads and shows palettes', async ({ page }) => {
		await page.goto('/palettes');
		// Wait for palettes to load
		await expect(page.locator('[data-testid="palette-card"], .palette-card, article, [class*="palette"]').first()).toBeVisible({ timeout: 10000 });
	});

	test('fonts page loads', async ({ page }) => {
		await page.goto('/fonts');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('pricing page loads', async ({ page }) => {
		await page.goto('/pricing');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('legal page loads', async ({ page }) => {
		await page.goto('/legal');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('getting started page loads', async ({ page }) => {
		await page.goto('/getting-started');
		await expect(page.locator('h1')).toBeVisible();
	});
});

test.describe('Merch Store', () => {
	test('merch page loads and shows products', async ({ page }) => {
		await page.goto('/merch');
		// Should show at least one product
		await expect(page.locator('a[href*="/merch/"]').first()).toBeVisible({ timeout: 10000 });
	});

	test('product detail page loads', async ({ page }) => {
		await page.goto('/merch/womens-relaxed-tee');
		// Should show product name
		await expect(page.getByText(/relaxed/i).first()).toBeVisible();
		// Should show add to cart button
		await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
	});

	test('can add product to cart', async ({ page }) => {
		await page.goto('/merch/womens-relaxed-tee');

		// Select a size if not already selected
		const sizeButton = page.locator('button:has-text("M")').first();
		if (await sizeButton.isVisible()) {
			await sizeButton.click();
		}

		// Click add to cart
		await page.getByRole('button', { name: /add to cart/i }).click();

		// Cart should open or show item count
		await expect(page.locator('[data-testid="cart-count"], [class*="cart-count"], .cart-badge').first()).toBeVisible({ timeout: 5000 }).catch(() => {
			// Some implementations show a toast instead
			return expect(page.getByText(/added to cart/i)).toBeVisible({ timeout: 5000 });
		});
	});
});

test.describe('Authentication Pages', () => {
	test('login page loads', async ({ page }) => {
		await page.goto('/login');
		await expect(page.getByRole('heading', { name: /log in|sign in/i })).toBeVisible();
		await expect(page.getByLabel(/email/i)).toBeVisible();
		await expect(page.getByLabel(/password/i)).toBeVisible();
	});

	test('signup page loads', async ({ page }) => {
		await page.goto('/signup');
		await expect(page.getByRole('heading', { name: /sign up|create account|register/i })).toBeVisible();
		await expect(page.getByLabel(/email/i)).toBeVisible();
		await expect(page.getByLabel(/password/i)).toBeVisible();
	});

	test('login form shows error for invalid credentials', async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel(/email/i).fill('invalid@example.com');
		await page.getByLabel(/password/i).fill('wrongpassword');
		await page.getByRole('button', { name: /log in|sign in|submit/i }).click();

		// Should show error message
		await expect(page.getByText(/invalid|incorrect|error|failed/i).first()).toBeVisible({ timeout: 5000 });
	});

	test('signup form validates email format', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel(/email/i).fill('notanemail');
		await page.getByLabel(/password/i).fill('password123');

		// Try to submit
		await page.getByRole('button', { name: /sign up|create|register|submit/i }).click();

		// Should either show validation error or not submit
		// Native HTML5 validation or custom error
		const emailInput = page.getByLabel(/email/i);
		const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
		expect(isInvalid || await page.getByText(/valid email|invalid email/i).isVisible().catch(() => false)).toBeTruthy();
	});
});

test.describe('Theme Tools', () => {
	test('accessibility checker loads', async ({ page }) => {
		await page.goto('/accessibility');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('colorblind simulator loads', async ({ page }) => {
		await page.goto('/colorblind');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('previewer loads', async ({ page }) => {
		await page.goto('/previewer');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('extract page loads', async ({ page }) => {
		await page.goto('/extract');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('export page loads', async ({ page }) => {
		await page.goto('/export');
		await expect(page.locator('h1')).toBeVisible();
	});

	test('font explorer loads', async ({ page }) => {
		await page.goto('/font-explorer');
		await expect(page.locator('h1')).toBeVisible();
	});
});

test.describe('Navigation', () => {
	test('main navigation links work', async ({ page }) => {
		await page.goto('/');

		// Click on Palettes link
		await page.getByRole('link', { name: /palettes/i }).first().click();
		await expect(page).toHaveURL(/\/palettes/);

		// Click on Fonts link
		await page.getByRole('link', { name: /fonts/i }).first().click();
		await expect(page).toHaveURL(/\/fonts/);
	});

	test('logo links to home', async ({ page }) => {
		await page.goto('/palettes');

		// Click logo/brand link
		const logo = page.locator('a[href="/"]').first();
		await logo.click();
		await expect(page).toHaveURL('/');
	});
});
