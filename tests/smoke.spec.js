import { test, expect } from '@playwright/test';

test('page renders, theme toggles, no console errors', async ({ page }) => {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/', { waitUntil: 'networkidle' });

  await expect(page).toHaveTitle(/Mohammad Hammad/);
  await expect(page.locator('h1')).toBeVisible();

  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');

  await page.click('#theme-toggle');
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect(html).toHaveClass(/light-theme/);

  await page.click('#theme-toggle');
  await expect(html).toHaveAttribute('data-theme', 'dark');

  expect(errors).toEqual([]);
});
