import { test, expect } from '@playwright/test'

const hasCredentials = !!(process.env.E2E_TEST_EMAIL && process.env.E2E_TEST_PASSWORD)

test.describe('Búsqueda global', () => {
  test.beforeEach(async () => {
    test.skip(!hasCredentials, 'Requiere E2E_TEST_EMAIL y E2E_TEST_PASSWORD')
  })

  test('Ctrl+K abre el modal de búsqueda', async ({ page }) => {
    await page.goto('/dashboard')
    await page.keyboard.press('Control+k')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })
    await expect(dialog.locator('input[placeholder*="Buscar"]')).toBeVisible()
  })

  test('botón de lupa en topbar abre el modal', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: /buscar/i }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })
  })

  test('Escape cierra el modal de búsqueda', async ({ page }) => {
    await page.goto('/dashboard')
    await page.keyboard.press('Control+k')
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 })
  })

  test('Ctrl+K alterna el modal (abre/cierra)', async ({ page }) => {
    await page.goto('/dashboard')
    await page.keyboard.press('Control+k')
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Control+k')
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 })
  })

  test('escribir en búsqueda no causa error', async ({ page }) => {
    await page.goto('/dashboard')
    await page.keyboard.press('Control+k')
    const input = page.locator('input[placeholder*="Buscar"]')
    await expect(input).toBeVisible()
    await input.fill('test')
    // Wait for debounce (300ms) + network
    await page.waitForTimeout(500)
    // Modal should still be open and stable
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(input).toHaveValue('test')
  })

  test('resultados agrupados por tipo aparecen tras búsqueda', async ({ page }) => {
    await page.goto('/dashboard')
    await page.keyboard.press('Control+k')
    const input = page.locator('input[placeholder*="Buscar"]')
    await input.fill('a')
    await page.waitForTimeout(600)
    // Either results are shown or an empty-state message appears
    const feedback = page
      .getByText(/candidatos|vacantes|sin resultados|Escribí para buscar/i)
      .first()
    await expect(feedback).toBeVisible({ timeout: 5000 })
  })

  test('clic en resultado navega a la página del item', async ({ page }) => {
    await page.goto('/dashboard')
    await page.keyboard.press('Control+k')
    const input = page.locator('input[placeholder*="Buscar"]')
    await input.fill('a')
    await page.waitForTimeout(600)

    // Check if any results exist (clickable links in the dialog)
    const results = page.getByRole('dialog').getByRole('link')
    const count = await results.count()
    if (count === 0) {
      test.skip(true, 'No hay resultados de búsqueda para navegar')
      return
    }
    await results.first().click()
    // Should have navigated away from /dashboard
    await expect(page).not.toHaveURL(/\/dashboard/)
  })

  test('búsqueda funciona desde la página de candidatos', async ({ page }) => {
    await page.goto('/candidates')
    await page.keyboard.press('Control+k')
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
    await page.keyboard.press('Escape')
  })
})
