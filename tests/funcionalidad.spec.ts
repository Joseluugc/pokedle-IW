import { test, expect } from '@playwright/test';

const BASE = 'https://pokedle-iw.vercel.app';

test.describe('Pruebas de Funcionalidad', () => {

  test('PF-01: Error de validación en formulario de registro', async ({ page }) => {
    await page.goto(`${BASE}/signin`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'evidencias_p4/funcionalidad_error_inicial.png', fullPage: true });

    const input = page.locator('input').first();
    if (await input.isVisible()) {
      await input.fill('test@test.com');
      await input.press('Enter');
    }
    
    await page.screenshot({ path: 'evidencias_p4/funcionalidad_error.png', fullPage: true });
  });

  test('PF-02: Flujo correcto - Landing y navegación', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'evidencias_p4/funcionalidad_exito.png', fullPage: true });
  });

  test('PF-03: Jugar Modo Diario - Autocompletado', async ({ page }) => {
    await page.goto(`${BASE}/partidas/diario`);
    await page.waitForLoadState('networkidle');

    const input = page.locator('input[placeholder="Nombre del pokemon"]');
    if (await input.isVisible()) {
      await input.fill('pika');
      
      // Esperar a que la petición debounce se complete y salgan las sugerencias
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'evidencias_p4/funcionalidad_diario_autocomplete.png', fullPage: true });

      // Seleccionar la sugerencia
      const suggestion = page.locator('ul li').first();
      if (await suggestion.isVisible()) {
        await suggestion.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'evidencias_p4/funcionalidad_diario_seleccion.png', fullPage: true });
      }
    }
  });
});
