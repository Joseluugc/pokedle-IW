import { test } from '@playwright/test';

const BASE = 'https://pokedle-iw.vercel.app';

test.describe('Pruebas de Compatibilidad Multiplataforma', () => {

  test('PC-01: Chromium Desktop', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'evidencias_p4/compatibilidad_chromium_desktop.png', fullPage: true });
    await page.goto(`${BASE}/signin`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'evidencias_p4/compatibilidad_chromium_desktop_login.png', fullPage: true });
    await context.close();
  });

  test('PC-02: WebKit Móvil', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'evidencias_p4/compatibilidad_webkit_movil.png', fullPage: true });
    await page.goto(`${BASE}/signin`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'evidencias_p4/compatibilidad_webkit_movil_login.png', fullPage: true });
    await context.close();
  });

  test('PC-03: Firefox Tablet', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
    const page = await context.newPage();
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'evidencias_p4/compatibilidad_firefox_tablet.png', fullPage: true });
    await page.goto(`${BASE}/signin`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'evidencias_p4/compatibilidad_firefox_tablet_login.png', fullPage: true });
    await context.close();
  });
});
