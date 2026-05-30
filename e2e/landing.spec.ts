import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('carga correctamente y muestra el hero', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/ConectAr Talento/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('el nav tiene los links correctos', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Iniciar sesión' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Empezar gratis' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Tienda' })).toBeVisible()
  })

  test('el link Tienda navega a /tienda', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Tienda' }).click()
    await expect(page).toHaveURL(/\/tienda/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('link Iniciar sesión navega a /login', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Iniciar sesión' }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('link Empezar gratis navega a /signup', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Empezar gratis' }).click()
    await expect(page).toHaveURL(/\/signup/)
  })

  test('no devuelve errores HTTP 5xx', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBeLessThan(500)
  })
})
