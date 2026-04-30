import { expect, test } from '@playwright/test';

test.describe('I18n', () => {
  test.describe('Language Switching', () => {
    test('should switch language from English to French using dropdown', async ({ page }) => {
      await page.goto('/');

      await expect(
        page.getByRole('heading', { name: 'Welcome' }),
      ).toBeVisible();

      await page.getByLabel('Change language').selectOption('fr');

      await expect(
        page.getByRole('heading', { name: 'Bienvenue' }),
      ).toBeVisible();
    });
  });
});
