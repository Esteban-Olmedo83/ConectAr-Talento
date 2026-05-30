import { test, expect } from '@playwright/test'

test.describe('Tienda digital', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tienda')
  })

  test('carga sin login y muestra el título', async ({ page }) => {
    await expect(page).toHaveTitle(/Tienda|Recursos/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('muestra los 4 productos', async ({ page }) => {
    await expect(page.getByText('Guía Completa de Reclutamiento con IA')).toBeVisible()
    await expect(page.getByText('50 Plantillas de Job Descriptions para LATAM')).toBeVisible()
    await expect(page.getByText('200 Preguntas de Entrevista por Competencias')).toBeVisible()
    await expect(page.getByText('Pipeline Kanban para Reclutadores en Excel')).toBeVisible()
  })

  test('muestra el pack completo con descuento', async ({ page }) => {
    await expect(page.getByText('Pack Completo')).toBeVisible()
    await expect(page.getByText('USD $29.99')).toBeVisible()
  })

  test('los botones de compra tienen href de WhatsApp', async ({ page }) => {
    const buyButtons = page.getByRole('link', { name: /Comprar por WhatsApp/i })
    const count = await buyButtons.count()
    expect(count).toBeGreaterThanOrEqual(4)

    const firstHref = await buyButtons.first().getAttribute('href')
    expect(firstHref).toContain('wa.me')
  })

  test('el link de volver al inicio navega a /', async ({ page }) => {
    await page.getByRole('link', { name: /Volver al inicio/i }).click()
    await expect(page).toHaveURL(/^\/$|^\/\?/)
  })

  test('el CTA al ATS navega a /signup', async ({ page }) => {
    await page.getByRole('link', { name: /Usar el ATS gratis/i }).click()
    await expect(page).toHaveURL(/\/signup/)
  })

  test('no devuelve error HTTP 5xx', async ({ page }) => {
    const response = await page.goto('/tienda')
    expect(response?.status()).toBeLessThan(500)
  })
})
