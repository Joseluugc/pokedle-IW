# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: compatibilidad.spec.ts >> Pruebas de Compatibilidad Multiplataforma >> PC-02: WebKit Móvil
- Location: tests\compatibilidad.spec.ts:19:7

# Error details

```
Error: browser.newContext: options.isMobile is not supported in Firefox
```

# Test source

```ts
  1  | import { test } from '@playwright/test';
  2  | 
  3  | const BASE = 'https://pokedle-iw.vercel.app';
  4  | 
  5  | test.describe('Pruebas de Compatibilidad Multiplataforma', () => {
  6  | 
  7  |   test('PC-01: Chromium Desktop', async ({ browser }) => {
  8  |     const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  9  |     const page = await context.newPage();
  10 |     await page.goto(BASE);
  11 |     await page.waitForLoadState('networkidle');
  12 |     await page.screenshot({ path: 'evidencias_p4/compatibilidad_chromium_desktop.png', fullPage: true });
  13 |     await page.goto(`${BASE}/signin`);
  14 |     await page.waitForLoadState('networkidle');
  15 |     await page.screenshot({ path: 'evidencias_p4/compatibilidad_chromium_desktop_login.png', fullPage: true });
  16 |     await context.close();
  17 |   });
  18 | 
  19 |   test('PC-02: WebKit Móvil', async ({ browser }) => {
> 20 |     const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
     |                     ^ Error: browser.newContext: options.isMobile is not supported in Firefox
  21 |     const page = await context.newPage();
  22 |     await page.goto(BASE);
  23 |     await page.waitForLoadState('networkidle');
  24 |     await page.screenshot({ path: 'evidencias_p4/compatibilidad_webkit_movil.png', fullPage: true });
  25 |     await page.goto(`${BASE}/signin`);
  26 |     await page.waitForLoadState('networkidle');
  27 |     await page.screenshot({ path: 'evidencias_p4/compatibilidad_webkit_movil_login.png', fullPage: true });
  28 |     await context.close();
  29 |   });
  30 | 
  31 |   test('PC-03: Firefox Tablet', async ({ browser }) => {
  32 |     const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  33 |     const page = await context.newPage();
  34 |     await page.goto(BASE);
  35 |     await page.waitForLoadState('networkidle');
  36 |     await page.screenshot({ path: 'evidencias_p4/compatibilidad_firefox_tablet.png', fullPage: true });
  37 |     await page.goto(`${BASE}/signin`);
  38 |     await page.waitForLoadState('networkidle');
  39 |     await page.screenshot({ path: 'evidencias_p4/compatibilidad_firefox_tablet_login.png', fullPage: true });
  40 |     await context.close();
  41 |   });
  42 | });
  43 | 
```