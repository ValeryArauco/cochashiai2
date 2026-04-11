import { test, expect, type Page } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/admin.json' })

async function irAReportes(page: Page): Promise<void> {
  await page.goto('/reportes')
  await expect(page.getByText('Reportes y Analítica')).toBeVisible({ timeout: 10_000 })
}

test.describe.serial('Flujo 1 — Control de acceso', () => {

  test('el admin accede a /reportes y ve el título y las pestañas', async ({ page }) => {
    await irAReportes(page)
    await expect(page.getByRole('tab', { name: 'Atletas' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Categorías' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Clubes' })).toBeVisible()
  })

  test('un judoka (no admin) es redirigido a /torneos', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth/judoka.json' })
    const page = await ctx.newPage()
    await page.goto('/reportes')
    await expect(page).toHaveURL(/\/torneos/, { timeout: 10_000 })
    await ctx.close()
  })

})

test.describe.serial('Flujo 2 — Las pestañas cargan contenido', () => {

  test('la pestaña Categorías muestra el título y la gráfica o estado vacío', async ({ page }) => {
    await irAReportes(page)
    await page.getByRole('tab', { name: 'Categorías' }).click()

    await expect(page.getByText('Categorías más competidas')).toBeVisible({ timeout: 10_000 })
    
    await expect(
      page.getByText(/atleta/i).first().or(page.getByText('No hay inscripciones confirmadas para mostrar'))
    ).toBeVisible({ timeout: 10_000 })
  })

  test('la pestaña Clubes muestra el título y la tabla del medallero o estado vacío', async ({ page }) => {
    await irAReportes(page)
    await page.getByRole('tab', { name: 'Clubes' }).click()

    await expect(page.getByText('Medallero por Club')).toBeVisible({ timeout: 10_000 })
    
    await expect(
      page.getByRole('columnheader', { name: 'Club' }).or(page.getByText('No hay datos de clubes para mostrar'))
    ).toBeVisible({ timeout: 10_000 })
  })

})

test.describe.serial('Flujo 3 — Búsqueda y estadísticas de atleta', () => {

  test('el autocomplete sugiere judokas al escribir', async ({ page }) => {
    await irAReportes(page)

    await page.getByLabel('Buscar atleta').fill('a')

    await expect(page.getByRole('option').first()).toBeVisible({ timeout: 10_000 })
  })

  test('seleccionar un atleta muestra sus métricas (combates, victorias, win rate)', async ({ page }) => {
    await irAReportes(page)

    await page.getByLabel('Buscar atleta').fill('a')
    await expect(page.getByRole('option').first()).toBeVisible({ timeout: 10_000 })
    await page.getByRole('option').nth(2).click()
    
    await expect(page.getByText(/combates/i).first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/victorias/i).first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/win rate/i).first()).toBeVisible({ timeout: 10_000 })
  })

})
