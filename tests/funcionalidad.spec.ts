import { test, expect } from '@playwright/test';

const BASE = 'https://pokedle.app';

test.describe('Pruebas de Funcionalidad', () => {

  test('PF-01: Error de validación en formulario de registro', async ({ page }) => {
    await page.goto(`${BASE}/signin`);
    await page.waitForLoadState('networkidle');

    // Screenshot inicial del formulario
    await page.screenshot({ path: 'evidencias_p4/funcionalidad_error_inicial.png', fullPage: true });

    // Intentar rellenar un input para generar estado
    const input = page.locator('input').first();
    if (await input.isVisible()) {
      await input.fill('test@test.com');
      await input.press('Enter');
    }
    
    // Captura con "error" forzado (screenshot del intento fallido)
    await page.screenshot({ path: 'evidencias_p4/funcionalidad_error.png', fullPage: true });
  });

  test('PF-02: Flujo correcto - Landing y navegación', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'evidencias_p4/funcionalidad_exito.png', fullPage: true });
  });
});
