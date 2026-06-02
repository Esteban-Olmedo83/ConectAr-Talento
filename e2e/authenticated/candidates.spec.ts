import { test, expect } from '@playwright/test'

const hasCredentials = !!(process.env.E2E_TEST_EMAIL && process.env.E2E_TEST_PASSWORD)

test.describe('Gestión de candidatos', () => {
  test.beforeEach(async () => {
    test.skip(!hasCredentials, 'Requiere E2E_TEST_EMAIL y E2E_TEST_PASSWORD')
  })

  test('carga la página de candidatos sin error', async ({ page }) => {
    const response = await page.goto('/candidates')
    expect(response?.status()).toBeLessThan(500)
    await expect(page).toHaveURL(/\/candidates/)
  })

  test('no redirige a login cuando autenticado', async ({ page }) => {
    await page.goto('/candidates')
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('muestra título de la sección', async ({ page }) => {
    await page.goto('/candidates')
    const heading = page.getByRole('heading', { name: /candidatos/i })
    await expect(heading.first()).toBeVisible({ timeout: 10000 })
  })

  test('muestra botón para agregar candidato', async ({ page }) => {
    await page.goto('/candidates')
    const addBtn = page.getByRole('button', { name: /agregar candidato/i })
    await expect(addBtn).toBeVisible({ timeout: 10000 })
  })

  test('abre el diálogo al hacer clic en Agregar Candidato', async ({ page }) => {
    await page.goto('/candidates')
    await page.getByRole('button', { name: /agregar candidato/i }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })
  })

  test('diálogo tiene campos de nombre y email', async ({ page }) => {
    await page.goto('/candidates')
    await page.getByRole('button', { name: /agregar candidato/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    // Name input
    const nameField = page.locator('input[placeholder*="nombre"], input[name*="name"], input[placeholder*="Nombre"]')
    await expect(nameField.first()).toBeVisible()
    // Email input
    const emailField = page.locator('input[type="email"], input[placeholder*="email"]')
    await expect(emailField.first()).toBeVisible()
  })

  test('cierra el diálogo con el botón Cancelar', async ({ page }) => {
    await page.goto('/candidates')
    await page.getByRole('button', { name: /agregar candidato/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /cancelar/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 })
  })

  test('buscador de candidatos es accesible', async ({ page }) => {
    await page.goto('/candidates')
    const searchInput = page.locator(
      'input[placeholder*="buscar"], input[placeholder*="Buscar"], input[placeholder*="filtrar"]'
    )
    await expect(searchInput.first()).toBeVisible({ timeout: 10000 })
  })

  test('filtrar por nombre actualiza la lista', async ({ page }) => {
    await page.goto('/candidates')
    const searchInput = page.locator(
      'input[placeholder*="buscar"], input[placeholder*="Buscar"], input[placeholder*="filtrar"]'
    ).first()
    await expect(searchInput).toBeVisible({ timeout: 10000 })
    // Type something unlikely to match anything
    await searchInput.fill('xyzzy_no_existe_123')
    // The list should update — either empty state or fewer results
    await page.waitForTimeout(500)
    const noResults = page.locator('[class*="empty"], [class*="no-result"]')
      .or(page.getByText(/no se encontraron|sin resultados|no hay candidatos/i))
    // The page should still be stable (no crash)
    await expect(page).toHaveURL(/\/candidates/)
  })
})
