import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../docs/screenshots');

await mkdir(OUT, { recursive: true });

const out = (name) => path.join(OUT, name);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

console.log('1) home (lista de quests)');
await page.goto('http://localhost:3000/');
await page.waitForLoadState('networkidle');
await page.screenshot({ path: out('01-home.png'), fullPage: true });

console.log('2) nova quest (formulario vazio)');
await page.getByRole('link', { name: /nova quest/i }).click();
await page.waitForURL(/\/nova$/);
await page.waitForLoadState('networkidle');
await page.screenshot({ path: out('02-nova-vazia.png'), fullPage: true });

console.log('3) nova quest (preenchida)');
const titulo = `Derrotar o dragao anciao ${Date.now()}`;
await page.getByRole('textbox', { name: 'Título' }).fill(titulo);
await page.getByRole('textbox', { name: 'Descrição (opcional)' }).fill('Raid epico no covil gelado. Level 80+ recomendado.');
await page.getByRole('spinbutton', { name: 'XP' }).fill('500');
await page.screenshot({ path: out('03-nova-preenchida.png'), fullPage: true });

console.log('4) quest criada (lista atualizada)');
await page.getByRole('button', { name: /criar quest/i }).click();
await page.waitForURL(/http:\/\/localhost:3000\/$/);
await page.waitForLoadState('networkidle');
const questItem = page.locator('li', { has: page.getByRole('heading', { name: titulo }) });
await questItem.waitFor();
await page.screenshot({ path: out('04-criada.png'), fullPage: true });

console.log('5) marcar como concluida');
await questItem.getByRole('button', { name: /marcar conclu/i }).click();
await questItem.getByRole('button', { name: /conclu/i }).waitFor();
await page.waitForLoadState('networkidle');
await page.screenshot({ path: out('05-concluida.png'), fullPage: true });

console.log('6) stats (crop topo)');
await page.screenshot({ path: out('06-stats.png'), clip: { x: 0, y: 0, width: 1280, height: 380 } });

console.log('7) dark mode');
await page.evaluate(() => {
  localStorage.setItem('theme', 'dark');
  document.documentElement.classList.add('dark');
});
await page.waitForTimeout(200);
await page.screenshot({ path: out('07-dark.png'), fullPage: true });

console.log('8) cleanup: deletar quest');
page.on('dialog', (d) => d.accept());
await questItem.getByRole('button', { name: /^deletar$/i }).click({ timeout: 5000 });
await page.waitForTimeout(500);

await browser.close();
console.log('OK - screenshots em', OUT);
