import { test, expect, type Page } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/admin.json' })

async function irAlPrimerTorneo(page: Page): Promise<void> {
  await page.goto('/torneos')

  await page.locator('.MuiFormControl-root', { has: page.locator('label').filter({ hasText: /^Mes$/i }) })
    .locator('.MuiSelect-select').click()
  await page.getByRole('option', { name: /diciembre/i }).click()

  await page.locator('.MuiCard-root').first().click()
}

async function generarYCerrar(page: Page): Promise<void> {
  await page.getByRole('button', { name: /generar llaves/i }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: /generar todas/i }).click()
  await expect(dialog.getByRole('button', { name: 'Cerrar' })).toBeVisible({ timeout: 30_000 })
  await dialog.getByRole('button', { name: 'Cerrar' }).click()
  await expect(dialog).not.toBeVisible()
}


test.describe.serial('Flujo 1 — Admin genera llaves para el torneo', () => {
  test('el botón "Generar llaves" es visible para el admin', async ({ page }) => {
    await irAlPrimerTorneo(page)
    await expect(page.getByRole('button', { name: /generar llaves/i })).toBeVisible()
  })

  test('el modal muestra el título y la información de reglas antes de generar', async ({ page }) => {
    await irAlPrimerTorneo(page)
    await page.getByRole('button', { name: /generar llaves/i }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText(/generar llaves.*todas las categorías/i)).toBeVisible()

    await expect(dialog.getByText(/liguilla/i)).toBeVisible()
    await expect(dialog.getByText(/eliminatoria directa/i)).toBeVisible()

    await expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Generar todas' })).toBeVisible()

    await dialog.getByRole('button', { name: 'Cancelar' }).click()
    await expect(dialog).not.toBeVisible()
  })

  test('"Generar todas" arranca la generación y el botón queda deshabilitado durante el proceso', async ({ page }) => {
    await irAlPrimerTorneo(page)
    await page.getByRole('button', { name: /generar llaves/i }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Generar todas' }).click()

    
    await expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    await expect(dialog.getByRole('button', { name: 'Generar todas' })).not.toBeVisible()

    
    await expect(dialog.getByRole('button', { name: 'Cerrar' })).toBeVisible({ timeout: 30_000 })
    await dialog.getByRole('button', { name: 'Cerrar' }).click()
  })

  test('el modal muestra el resumen de resultados por categoría al finalizar', async ({ page }) => {
    await irAlPrimerTorneo(page)
    await page.getByRole('button', { name: /generar llaves/i }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Generar todas' }).click()
    await expect(dialog.getByRole('button', { name: 'Cerrar' })).toBeVisible({ timeout: 30_000 })

    await expect(dialog.getByText(/categoría.*generada|error/i)).toBeVisible()

    const items = dialog.locator('[class*="MuiListItem"]')
    await expect(items.first()).toBeVisible()

    await dialog.getByRole('button', { name: 'Cerrar' }).click()
  })
})



test.describe.serial('Flujo 2 — Visualización del bracket generado', () => {
  test('el bracket muestra el tipo de sistema y el número de participantes', async ({ page }) => {
    await irAlPrimerTorneo(page)

    await expect(
      page.getByText(/liguilla|bracket/i).first()
    ).toBeVisible({ timeout: 10_000 })

    await expect(page.getByText(/\d+ participantes/i)).toBeVisible()
  })

  test('la vista de cuadro muestra los combates de la primera ronda', async ({ page }) => {
    await irAlPrimerTorneo(page)

    const cuadroToggle = page.getByRole('button', { name: /cuadro/i })

    if (await cuadroToggle.isVisible()) {
      
      await cuadroToggle.click()
      
      await expect(page.getByText(/pendiente|en curso|finalizado|bye/i).first()).toBeVisible()
    } else {
      
      await expect(page.getByRole('table').or(page.getByText(/vs/i)).first()).toBeVisible()
    }
  })

  test('para bracket de eliminación la vista "Por tatami" lista los combates', async ({ page }) => {
    await irAlPrimerTorneo(page)

    const tatamiToggle = page.getByRole('button', { name: /tatami/i })

    if (await tatamiToggle.isVisible()) {
      await tatamiToggle.click()
      
      await expect(page.getByRole('tab').first()).toBeVisible()
    } else {
      
      test.skip()
    }
  })
})
