import { test, expect, type Page } from '@playwright/test'

function tomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function muiSelect(page: Page, labelText: RegExp) {
  return page
    .locator('.MuiFormControl-root', { has: page.locator('label').filter({ hasText: labelText }) })
    .locator('.MuiSelect-select')
}

test('camino feliz: admin crea un torneo nuevo', async ({ page }) => {
  test.setTimeout(90000)

  const nombreTorneo = `Torneo E2E ${Date.now()}`

  await page.goto('/torneos')

  const fab = page.getByRole('button', { name: /crear torneo/i })
  await expect(fab).toBeVisible({ timeout: 15000 })
  await fab.click()


  await expect(page.getByRole('dialog')).toBeVisible()

  await page.getByLabel(/nombre del torneo/i).fill(nombreTorneo)

  const clubSelect = muiSelect(page, /ubicación/i)
  await expect(clubSelect).toBeVisible({ timeout: 10000 })
  await clubSelect.click()
  await expect(page.getByRole('option').first()).toBeVisible({ timeout: 5000 })
  await page.getByRole('option').first().click()

  await page.locator('input[name="fechaLimiteInscripcion"]').fill(today())
  await page.locator('input[name="numTatamis"]').fill('2')
  await page.locator('input[name="fechas.0.fecha"]').fill(tomorrow())
  await page.locator('input[name="fechas.0.horaInicio"]').fill('09:00')
  await page.locator('input[name="fechas.0.horaFin"]').fill('18:00')

  await page.getByRole('button', { name: /siguiente/i }).click()

  await expect(page.getByRole('dialog')).toBeVisible()

  const firstCheckbox = page.getByRole('checkbox').first()
  await expect(firstCheckbox).toBeVisible({ timeout: 10000 })
  await firstCheckbox.check()
  
  const saveButton = page.getByRole('button', { name: /crear torneo/i })
  await expect(saveButton).toBeEnabled({ timeout: 5000 })
  await saveButton.click()

  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15000 })
  await expect(page.getByText(nombreTorneo)).toBeVisible({ timeout: 15000 })
})
