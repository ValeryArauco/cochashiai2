import { test, expect, type Page } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/admin.json' })

async function obtenerTorneoId(page: Page): Promise<string> {
  await page.goto('/torneos')
  await page.locator('.MuiFormControl-root', {
    has: page.locator('label').filter({ hasText: /^Mes$/i }),
  }).locator('.MuiSelect-select').click()
  await page.getByRole('option', { name: /diciembre/i }).click()
  const card = page.locator('.MuiCard-root').first()
  await expect(card).toBeVisible({ timeout: 10_000 })
  await card.click()
  await page.waitForURL(/\/torneos\/[^/]+$/)
  return page.url().split('/torneos/')[1]
}

test.describe.serial('Flujo 1 — El tablero es accesible públicamente', () => {

  test('la página carga sin credenciales activas y no redirige a /login', async ({ page, browser }) => {
    const torneoId = await obtenerTorneoId(page)

    const publicContext = await browser.newContext()
    const publicPage = await publicContext.newPage()
    await publicPage.goto(`/tablero/${torneoId}`)

    await expect(publicPage).not.toHaveURL(/\/login/)
    await expect(publicPage.locator('body')).toBeVisible()

    await publicContext.close()
  })

  test('el encabezado muestra el nombre del torneo', async ({ page }) => {
    const torneoId = await obtenerTorneoId(page)
    await page.goto(`/tablero/${torneoId}`)

    await expect(page.locator('h5')).toBeVisible({ timeout: 10_000 })
  })

  test('el encabezado muestra el indicador "EN VIVO"', async ({ page }) => {
    const torneoId = await obtenerTorneoId(page)
    await page.goto(`/tablero/${torneoId}`)

    await expect(page.getByText('EN VIVO')).toBeVisible({ timeout: 10_000 })
  })

})


test.describe.serial('Flujo 2 — Contenido de los paneles de tatami', () => {

  test('hay al menos un panel con encabezado "TATAMI N"', async ({ page }) => {
    const torneoId = await obtenerTorneoId(page)
    await page.goto(`/tablero/${torneoId}`)

    await expect(
      page.getByText(/^TATAMI \d+$/).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('los paneles muestran las etiquetas de color "AZUL" y "BLANCO"', async ({ page }) => {
    const torneoId = await obtenerTorneoId(page)
    await page.goto(`/tablero/${torneoId}`)

    await expect(page.getByText(/^TATAMI \d+$/).first()).toBeVisible({ timeout: 10_000 })

    const azulVisible = await page.getByText(/^AZUL$/).first().isVisible()
    if (azulVisible) {
      await expect(page.getByText(/^BLANCO$/).first()).toBeVisible()
    } else {
      
      await expect(page.getByText('Sin combate activo').first()).toBeVisible({ timeout: 5_000 })
    }
  })

  test('los paneles con combate muestran el estado "EN CURSO" o "PRÓXIMO"', async ({ page }) => {
    const torneoId = await obtenerTorneoId(page)
    await page.goto(`/tablero/${torneoId}`)

    await expect(page.getByText(/^TATAMI \d+$/).first()).toBeVisible({ timeout: 10_000 })

    const tieneEstado = await page
      .locator('.MuiChip-root').filter({ hasText: /^EN CURSO$|^PRÓXIMO$/ })
      .first()
      .isVisible()

    if (tieneEstado) {
      await expect(
        page.locator('.MuiChip-root').filter({ hasText: /^EN CURSO$|^PRÓXIMO$/ }).first()
      ).toBeVisible()
    } else {
      
      await expect(page.getByText('Sin combate activo').first()).toBeVisible({ timeout: 5_000 })
    }
  })

  test('los paneles con datos muestran los marcadores IPPON, WAZARI y SHIDO', async ({ page }) => {
    const torneoId = await obtenerTorneoId(page)
    await page.goto(`/tablero/${torneoId}`)

    await expect(page.getByText(/^TATAMI \d+$/).first()).toBeVisible({ timeout: 10_000 })

    const tieneMarcadores = await page.getByText('IPPON').first().isVisible()
    if (tieneMarcadores) {
      await expect(page.getByText('WAZARI').first()).toBeVisible()
      await expect(page.getByText('SHIDO').first()).toBeVisible()
    } else {
      await expect(page.getByText('Sin combate activo').first()).toBeVisible({ timeout: 5_000 })
    }
  })

})

test.describe.serial('Flujo 3 — Actualización manual del tablero', () => {

  test('el botón "Actualizar" es visible en el encabezado', async ({ page }) => {
    const torneoId = await obtenerTorneoId(page)
    await page.goto(`/tablero/${torneoId}`)

    await expect(page.getByRole('button').filter({ has: page.locator('[data-testid="RefreshIcon"]') }))
      .toBeVisible({ timeout: 10_000 })
  })

  test('pulsar el botón de actualizar no produce errores y mantiene el contenido visible', async ({ page }) => {
    const torneoId = await obtenerTorneoId(page)
    await page.goto(`/tablero/${torneoId}`)

    await expect(page.getByText(/^TATAMI \d+$/).first()).toBeVisible({ timeout: 10_000 })

    await page.getByRole('button').filter({ has: page.locator('[data-testid="RefreshIcon"]') }).click()

    await expect(page.getByText(/^TATAMI \d+$/).first()).toBeVisible({ timeout: 10_000 })

    await expect(page.locator('p').filter({ hasText: /error/i })).not.toBeVisible()
  })

})
