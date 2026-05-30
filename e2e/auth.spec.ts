import { test, expect } from '@playwright/test'

test.describe('Página de login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('renderiza el formulario de login', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /inicia|login|acceder/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
    await expect(page.getByLabel(/contraseña|password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /ingresar|entrar|iniciar/i })).toBeVisible()
  })

  test('link a signup existe', async ({ page }) => {
    const signupLink = page.getByRole('link', { name: /registr|crear cuenta|sign up/i })
    await expect(signupLink).toBeVisible()
  })

  test('muestra error al enviar formulario vacío', async ({ page }) => {
    await page.getByRole('button', { name: /ingresar|entrar|iniciar/i }).click()
    // Either HTML5 validation or custom error message
    const emailInput = page.getByRole('textbox', { name: /email/i })
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBeTruthy()
  })

  test('muestra error con email inválido', async ({ page }) => {
    await page.getByRole('textbox', { name: /email/i }).fill('no-es-un-email')
    await page.getByLabel(/contraseña|password/i).fill('password123')
    await page.getByRole('button', { name: /ingresar|entrar|iniciar/i }).click()
    const emailInput = page.getByRole('textbox', { name: /email/i })
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBeTruthy()
  })

  test('no devuelve error HTTP 5xx', async ({ page }) => {
    const response = await page.goto('/login')
    expect(response?.status()).toBeLessThan(500)
  })
})

test.describe('Página de signup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup')
  })

  test('renderiza el formulario de registro', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /crea|registr|signup/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
    await expect(page.getByLabel(/contraseña|password/i).first()).toBeVisible()
  })

  test('link a login existe', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /iniciar sesión|ya tenés cuenta|ingresar/i })
    await expect(loginLink).toBeVisible()
  })

  test('link de login navega a /login', async ({ page }) => {
    await page.getByRole('link', { name: /iniciar sesión|ya tenés cuenta|ingresar/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('no devuelve error HTTP 5xx', async ({ page }) => {
    const response = await page.goto('/signup')
    expect(response?.status()).toBeLessThan(500)
  })
})
