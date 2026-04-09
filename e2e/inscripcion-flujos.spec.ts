import { test, expect, Browser, Page } from '@playwright/test'


async function judokaInscribe(browser: Browser) {
  const ctx  = await browser.newContext({ storageState: 'e2e/.auth/judoka.json' })
  const page = await ctx.newPage()

  await page.goto('/torneos')
  await expect(page.locator('.MuiCard-root').first()).toBeVisible({ timeout: 15000 })
  await page.locator('.MuiCard-root').first().click()
  await page.waitForURL('**/torneos/**', { timeout: 10000 })

  await expect(page.getByRole('button', { name: /inscribirse/i })).toBeVisible({ timeout: 10000 })
  await page.getByRole('button', { name: /inscribirse/i }).click()
  await page.getByRole('radio').first().click()
  await page.getByRole('button', { name: /confirmar inscripción/i }).click()
  await expect(page.getByText(/solicitud de inscripción fue enviada/i)).toBeVisible({ timeout: 15000 })

  await ctx.close()
}

async function judokaCancela(browser: Browser) {
  const ctx  = await browser.newContext({ storageState: 'e2e/.auth/judoka.json' })
  const page = await ctx.newPage()

  await page.goto('/torneos')
  await page.locator('.MuiCard-root').first().click()
  await page.waitForURL('**/torneos/**', { timeout: 10000 })

  await expect(page.getByText(/pendiente sensei/i)).toBeVisible({ timeout: 10000 })
  await page.getByRole('button', { name: /cancelar solicitud/i }).click()
  await expect(page.getByRole('button', { name: /inscribirse/i })).toBeVisible({ timeout: 10000 })

  await ctx.close()
}

async function senseiAprueba(browser: Browser) {
  const ctx  = await browser.newContext({ storageState: 'e2e/.auth/sensei.json' })
  const page = await ctx.newPage()

  await page.goto('/torneos')
  await page.locator('.MuiCard-root').first().click()
  await page.waitForURL('**/torneos/**', { timeout: 10000 })

  await page.getByRole('button', { name: /ver solicitudes/i }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible({ timeout: 10000 })
  await expect(dialog.getByRole('checkbox').first()).toBeVisible({ timeout: 10000 })
  await dialog.getByRole('checkbox').first().click()
  await dialog.getByRole('button', { name: /aprobar/i }).click()
  await expect(dialog.getByRole('checkbox')).toHaveCount(0, { timeout: 10000 })

  await ctx.close()
}

async function senseiRechaza(browser: Browser) {
  const ctx  = await browser.newContext({ storageState: 'e2e/.auth/sensei.json' })
  const page = await ctx.newPage()

  await page.goto('/torneos')
  await page.locator('.MuiCard-root').first().click()
  await page.waitForURL('**/torneos/**', { timeout: 10000 })

  await page.getByRole('button', { name: /ver solicitudes/i }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible({ timeout: 10000 })
  await expect(dialog.locator('button.MuiIconButton-colorError').first()).toBeVisible({ timeout: 10000 })
  await dialog.locator('button.MuiIconButton-colorError').first().click()
  await expect(dialog.getByRole('checkbox')).toHaveCount(0, { timeout: 10000 })

  await ctx.close()
}

async function abrirGestionAdmin(page: Page) {
  await page.goto('/torneos')
  await expect(page.locator('.MuiCard-root').first()).toBeVisible({ timeout: 15000 })
  await page.locator('.MuiCard-root').first().click()
  await page.waitForURL('**/torneos/**', { timeout: 10000 })
  await page.getByRole('button', { name: /gestionar solicitudes/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 })
}

test.describe.serial('Flujo 1 — judoka solicita y cancela', () => {
  test('judoka solicita inscripción', async ({ browser }) => {
    await judokaInscribe(browser)
  })

  test('judoka cancela solicitud pendiente → chip desaparece', async ({ browser }) => {
    await judokaCancela(browser)
  })
})


test.describe.serial('Flujo 2 — sensei rechaza solicitud', () => {
  test('judoka solicita inscripción', async ({ browser }) => {
    await judokaInscribe(browser)
  })

  test('sensei rechaza → solicitud eliminada', async ({ browser }) => {
    await senseiRechaza(browser)
  })
})

test.describe.serial('Flujo 3 — admin elimina inscripción aprobada', () => {
  test('judoka solicita inscripción', async ({ browser }) => {
    await judokaInscribe(browser)
  })

  test('sensei aprueba inscripción', async ({ browser }) => {
    await senseiAprueba(browser)
  })

  test('admin elimina participante → fila desaparece', async ({ page }) => {
    await abrirGestionAdmin(page)
    const dialog = page.getByRole('dialog')

    page.once('dialog', d => d.accept())
    await dialog.locator('button.MuiIconButton-colorError').first().click()

    await expect(dialog.getByText(/no hay inscripciones/i)).toBeVisible({ timeout: 10000 })
    await dialog.getByRole('button', { name: /cerrar/i }).click()
  })
})


test.describe.serial('Flujo 4 — inscripción confirmada (camino feliz)', () => {
  test('judoka solicita inscripción', async ({ browser }) => {
    await judokaInscribe(browser)
  })

  test('sensei aprueba inscripción', async ({ browser }) => {
    await senseiAprueba(browser)
  })

  test('admin registra peso oficial', async ({ page }) => {
    await abrirGestionAdmin(page)
    const dialog = page.getByRole('dialog')

    const pesoInput = dialog.getByLabel(/peso \(kg\)/i).first()
    await expect(pesoInput).toBeVisible({ timeout: 10000 })
    await pesoInput.fill('55')

    await dialog.locator('button.MuiIconButton-colorSuccess').first().click()
    await expect(dialog.getByText(/pesaje/i)).toBeVisible({ timeout: 10000 })

    await dialog.getByRole('button', { name: /cerrar/i }).click()
  })

  test('admin confirma pago → inscripción en estado confirmado', async ({ page }) => {
    await abrirGestionAdmin(page)
    const dialog = page.getByRole('dialog')

    await dialog.locator('button.MuiIconButton-colorPrimary').first().click()
    await expect(dialog.getByText(/pagado/i)).toBeVisible({ timeout: 10000 })

    await dialog.getByRole('button', { name: /cerrar/i }).click()
  })
})
