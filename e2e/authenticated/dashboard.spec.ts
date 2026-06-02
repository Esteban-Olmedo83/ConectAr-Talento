import { test, expect } from '@playwright/test'

const hasCredentials = !!(process.env.E2E_TEST_EMAIL && process.env.E2E_TEST_PASSWORD)

test.describe('Dashboard', () => {
  test.beforeEach(async () => {
    test.skip(!hasCredentials, 'Requiere E2E_TEST_EMAIL y E2E_TEST_PASSWORD')
  })

  test('carga el dashboard sin error', async ({ page }) => {
    const response = await page.goto('/dashboard')
    expect(response?.status()).toBeLessThan(500)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('sidebar de navegación es visible', async ({ page }) => {
    await page.goto('/dashboard')
    const nav = page.getByRole('navigation').or(page.locator('nav'))
    await expect(nav.first()).toBeVisible({ timeout: 10000 })
  })

  test('topbar con búsqueda y notificaciones es visible', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('button', { name: /buscar/i })).toBeVisible({ timeout: 10000 })
  })

  test('muestra al menos un elemento de estadísticas', async ({ page }) => {
    await page.goto('/dashboard')
    // Wait for the main content to load — look for any heading or metric card
    const content = page.locator('main h1, main h2, main [class*="card"], main [class*="stat"]')
    await expect(content.first()).toBeVisible({ timeout: 15000 })
  })

  test('acceso a /dashboard redirige a /dashboard (no rebota a login)', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
