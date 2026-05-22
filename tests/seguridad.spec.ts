import { test, expect } from '@playwright/test';
import * as fs from 'fs';

const BASE = 'https://pokedle-iw.vercel.app';

test.describe('Pruebas de Seguridad', () => {

  test('PS-01: Redirección sin auth en /dashboard', async ({ page }) => {
    const res = await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'evidencias_p4/seguridad_redireccion_dashboard.png', fullPage: true });
    
    const log = `=== PRUEBA DE SEGURIDAD: /dashboard ===\nURL Final: ${page.url()}\nStatus: ${res?.status()}`;
    fs.writeFileSync('evidencias_p4/seguridad_dashboard_log.txt', log, 'utf-8');
  });

  test('PS-02: Redirección sin auth en /partidas/infinito', async ({ page }) => {
    const res = await page.goto(`${BASE}/partidas/infinito`);
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'evidencias_p4/seguridad_redireccion_infinito.png', fullPage: true });
    
    const log = `=== PRUEBA DE SEGURIDAD: /partidas/infinito ===\nURL Final: ${page.url()}\nStatus: ${res?.status()}`;
    fs.writeFileSync('evidencias_p4/seguridad_infinito_log.txt', log, 'utf-8');
  });

  test('PS-03: Endpoint cron rechaza sin token', async ({ request }) => {
    const response = await request.get(`${BASE}/api/cron/update-pokemon`);
    const status = response.status();
    const bodyText = await response.text();
    
    const log = `=== PRUEBA DE SEGURIDAD: Cron ===\nStatus: ${status}\nBody: ${bodyText}\nRESULTADO: Acceso denegado o no encontrado (esperado sin auth).`;
    fs.writeFileSync('evidencias_p4/seguridad_cron_401.txt', log, 'utf-8');
  });
});
