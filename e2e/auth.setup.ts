import { test as setup, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const adminAuthFile  = 'e2e/.auth/admin.json'
const judokaAuthFile = 'e2e/.auth/judoka.json'
const senseiAuthFile = 'e2e/.auth/sensei.json'

setup.beforeAll(() => {
  const dir = path.dirname(adminAuthFile)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
})

setup('autenticar como sensei', async ({ page }) => {
  const email    = process.env.TEST_SENSEI_EMAIL
  const password = process.env.TEST_SENSEI_PASSWORD

  if (!email || !password) {
    throw new Error(
      'Faltan variables de entorno TEST_SENSEI_EMAIL y TEST_SENSEI_PASSWORD.\n' +
      'Agrégalas al archivo .env.test.local.'
    )
  }

  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()

  await page.waitForURL('**/torneos', { timeout: 10000 })
  await expect(page).toHaveURL(/.*\/torneos/)

  await page.context().storageState({ path: senseiAuthFile })
})

setup('autenticar como admin', async ({ page }) => {
  const email = process.env.TEST_ADMIN_EMAIL
  const password = process.env.TEST_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      'Faltan variables de entorno TEST_ADMIN_EMAIL y TEST_ADMIN_PASSWORD.\n' +
      'Crea el archivo .env.test.local con esas credenciales.'
    )
  }

  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()

  await page.waitForURL('**/torneos', { timeout: 10000 })
  await expect(page).toHaveURL(/.*\/torneos/)

  await page.context().storageState({ path: adminAuthFile })
})

setup('autenticar como judoka', async ({ page }) => {
  const email = process.env.TEST_JUDOKA_EMAIL
  const password = process.env.TEST_JUDOKA_PASSWORD

  if (!email || !password) {
    throw new Error(
      'Faltan variables de entorno TEST_JUDOKA_EMAIL y TEST_JUDOKA_PASSWORD.\n' +
      'Crea el archivo .env.test.local con esas credenciales.'
    )
  }

  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()

  await page.waitForURL('**/torneos', { timeout: 10000 })
  await expect(page).toHaveURL(/.*\/torneos/)

  await page.context().storageState({ path: judokaAuthFile })
})
