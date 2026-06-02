import { test, expect } from '@playwright/test'

const hasCredentials = !!(process.env.E2E_TEST_EMAIL && process.env.E2E_TEST_PASSWORD)

test.describe('Gestión de vacantes', () => {
  test.beforeEach(async () => {
    test.skip(!hasCredentials, 'Requiere E2E_TEST_EMAIL y E2E_TEST_PASSWORD')
  })

  test('carga la página de vacantes sin error', async ({ page }) => {
    const response = await page.goto('/vacancies')
    expect(response?.status()).toBeLessThan(500)
    await expect(page).toHaveURL(/\/vacancies/)
  })

  test('no redirige a login cuando autenticado', async ({ page }) => {
    await page.goto('/vacancies')
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('muestra título de la sección', async ({ page }) => {
    await page.goto('/vacancies')
    const heading = page.getByRole('heading', { name: /vacantes|posiciones/i })
    await expect(heading.first()).toBeVisible({ timeout: 10000 })
  })

  test('muestra botón para crear vacante', async ({ page }) => {
    await page.goto('/vacancies')
    const newBtn = page.getByRole('button', { name: /nueva vacante/i })
    await expect(newBtn).toBeVisible({ timeout: 10000 })
  })

  test('abre el diálogo al hacer clic en Nueva Vacante', async ({ page }) => {
    await page.goto('/vacancies')
    await page.getByRole('button', { name: /nueva vacante/i }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })
  })

  test('diálogo de nueva vacante tiene campo de título', async ({ page }) => {
    await page.goto('/vacancies')
    await page.getByRole('button', { name: /nueva vacante/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    const titleField = page.getByLabel(/título|puesto|cargo/i).or(
      page.locator('input[name*="title"], input[placeholder*="título"], input[placeholder*="Título"]')
    )
    await expect(titleField.first()).toBeVisible({ timeout: 5000 })
  })

  test('diálogo de vacante se cierra con Escape', async ({ page }) => {
    await page.goto('/vacancies')
    await page.getByRole('button', { name: /nueva vacante/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 })
  })

  test('buscador de vacantes es accesible', async ({ page }) => {
    await page.goto('/vacancies')
    const searchInput = page.locator(
      'input[placeholder*="buscar"], input[placeholder*="Buscar"], input[placeholder*="filtrar"]'
    )
    await expect(searchInput.first()).toBeVisible({ timeout: 10000 })
  })
})
