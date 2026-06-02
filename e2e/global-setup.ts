import { chromium, FullConfig } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

async function globalSetup(config: FullConfig) {
  const authFile = path.join(__dirname, '.auth/user.json')
  fs.mkdirSync(path.dirname(authFile), { recursive: true })

  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD

  if (!email || !password) {
    // No credentials — write empty state so authenticated tests skip gracefully
    fs.writeFileSync(authFile, JSON.stringify({ cookies: [], origins: [] }))
    return
  }

  const baseURL =
    (config.projects.find(p => p.name === 'chromium')?.use?.baseURL as string | undefined) ??
    process.env.PLAYWRIGHT_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'https://conect-ar-talento-esteban-olmedo83s-projects.vercel.app'

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto(`${baseURL}/login`)

  await page.getByRole('textbox', { name: /email/i }).fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: 'Ingresar' }).click()

  await page.waitForURL(/\/dashboard/, { timeout: 20000 })

  await context.storageState({ path: authFile })
  await browser.close()
}

export default globalSetup
