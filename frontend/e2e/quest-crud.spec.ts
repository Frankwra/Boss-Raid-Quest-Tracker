import { test, expect } from '@playwright/test';

test('criar, ver e marcar quest como concluida', async ({ page }) => {
  const titulo = `E2E quest ${Date.now()}`;

  await page.goto('/');

  await page.getByRole('link', { name: /nova quest/i }).click();
  await expect(page).toHaveURL(/\/nova$/);

  await page.getByRole('textbox', { name: 'Título' }).fill(titulo);
  await page.getByRole('spinbutton', { name: 'XP' }).fill('100');
  await page.getByRole('button', { name: /criar quest/i }).click();

  await expect(page).toHaveURL(/\/$/);
  const questItem = page.locator('li', { has: page.getByRole('heading', { name: titulo }) });
  await expect(questItem).toBeVisible();
  await expect(questItem).toContainText('100 XP');

  await questItem.getByRole('button', { name: /marcar conclu/i }).click();
  await expect(questItem.getByRole('button', { name: /conclu/i })).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await questItem.getByRole('button', { name: /^deletar$/i }).click();
  await expect(page.getByRole('heading', { name: titulo })).not.toBeVisible();
});
