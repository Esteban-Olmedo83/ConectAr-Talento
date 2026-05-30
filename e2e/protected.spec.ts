import { test, expect } from '@playwright/test'

const PROTECTED_ROUTES = [
  '/dashboard',
  '/candidates',
  '/vacancies',
  '/pipeline',
  '/interviews',
  '/reports',
  '/settings',
]

test.describe('Rutas protegidas', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route} redirige a /login si no hay sesión`, async ({ page }) => {
      const response = await page.goto(route)
      // Should redirect to login (not 500, and not stay on the protected page)
      expect(response?.status()).toBeLessThan(500)
      await expect(page).toHaveURL(/\/(login|signup|auth)/)
    })
  }
})

test.describe('Páginas públicas accesibles sin login', () => {
  const PUBLIC_ROUTES = ['/', '/tienda', '/login', '/signup', '/privacy', '/terms']

  for (const route of PUBLIC_ROUTES) {
    test(`${route} carga sin redirección`, async ({ page }) => {
      const response = await page.goto(route)
      expect(response?.status()).toBeLessThan(500)
      await expect(page).toHaveURL(new RegExp(route.replace('/', '\\/').replace('.', '\\.')))
    })
  }
})

test.describe('API protegida', () => {
  test('GET /api/stripe/subscription devuelve 401 sin sesión', async ({ request }) => {
    const response = await request.get('/api/stripe/subscription')
    expect(response.status()).toBe(401)
  })

  test('POST /api/stripe/portal devuelve 401 sin sesión', async ({ request }) => {
    const response = await request.post('/api/stripe/portal')
    expect(response.status()).toBe(401)
  })

  test('POST /api/ai/analyze-cv devuelve 401 sin sesión', async ({ request }) => {
    const response = await request.post('/api/ai/analyze-cv', {
      data: { cvText: 'test' },
    })
    expect(response.status()).toBe(401)
  })

  test('GET /api/admin/stats devuelve 401 sin sesión', async ({ request }) => {
    const response = await request.get('/api/admin/stats')
    expect(response.status()).toBe(401)
  })
})
